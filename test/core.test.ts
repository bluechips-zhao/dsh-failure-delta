import { describe, expect, it } from 'vitest'
import {
  compareRuns,
  Fingerprinter,
  MemoryRunStore,
  parsePytestJUnit,
  parsePytestText,
  parseTsc,
  parseVitestJson,
  recognizeCommand,
  type Completeness,
  type RunRecord,
} from '../src/index.js'

const fingerprinter = new Fingerprinter()

function completeness(overrides: Partial<Completeness> = {}): Completeness {
  return {
    capture: 'known', parser: 'known', inventory: 'known', metadata: 'known', freshness: 'known', reasons: [], ...overrides,
  }
}

function run(partial: Partial<RunRecord> = {}): RunRecord {
  return {
    runId: partial.runId ?? 'run', sessionId: 'session', epoch: 'epoch', startSeq: 1,
    startedAt: '2026-09-19T00:00:00.000Z', observedEndAt: '2026-09-19T00:00:01.000Z',
    callId: 'call', rootCallId: 'call', state: 'ready', runner: 'tsc', parserVersion: 'tsc-diagnostics-v1',
    basicSeriesKey: 'series', comparisonEvidenceKey: 'evidence', completeness: completeness(),
    diagnostics: [], tests: [], droppedDiagnostics: 0, droppedTests: 0, reasons: [], ...partial,
  }
}

describe('command recognition', () => {
  it('accepts only direct supported calls and keeps shell composition opaque', () => {
    expect(recognizeCommand('pnpm exec tsc --noEmit').supported).toBe(true)
    expect(recognizeCommand('pnpm exec tsc --noEmit').runner).toBe('tsc')
    expect(recognizeCommand('pnpm exec vitest run --changed').scopeKnown).toBe(false)
    expect(recognizeCommand('tsc --noEmit | tee output').reasons).toContain('unsupported-command')
  })
})

describe('parsers', () => {
  it('parses tsc diagnostics, preserves duplicates, and marks truncation incomplete', () => {
    const result = parseTsc('src/a.ts(2,4): error TS2322: token=abc\n  detail\nsrc/a.ts(2,4): error TS2322: token=abc\nsrc/a.ts(2,4): error TS2322: token=abc\n', { fingerprinter, truncated: true })
    expect(result.diagnostics).toHaveLength(2)
    expect(result.diagnostics[1]?.occurrences).toBe(2)
    expect(result.diagnostics[0]?.excerpt).toContain('[REDACTED]')
    expect(result.reasons).toContain('capture-truncated')
    expect(result.parser).toBe('incomplete')
  })

  it('uses one process-random default key so separate parses can match', () => {
    const first = parseTsc('src/a.ts(1,1): error TS2322: bad')
    const second = parseTsc('src/a.ts(1,1): error TS2322: bad')
    expect(first.diagnostics[0]?.id).toBe(second.diagnostics[0]?.id)
  })

  it('rejects mixed vitest stdout and retains explicit case states', () => {
    const mixed = 'log before JSON\n{"testResults":[]}'
    expect(parseVitestJson(mixed, { fingerprinter }).parser).toBe('unsupported')
    const result = parseVitestJson(JSON.stringify({
      numTotalTests: 2,
      testResults: [{ name: 'src/a.test.ts', assertionResults: [
        { ancestorTitles: ['suite'], title: 'fails', status: 'failed', failureMessages: ['bad'] },
        { ancestorTitles: ['suite'], title: 'skips', status: 'skipped', failureMessages: [] },
      ] }],
    }), { fingerprinter })
    expect(result.tests.map(item => item.status)).toEqual(['failed', 'skipped'])
    expect(result.inventory).toBe('known')
  })

  it('rejects XML entity features and parses bounded JUnit cases', () => {
    expect(parsePytestJUnit('<!DOCTYPE testsuite [<!ENTITY x "boom">]><testsuite/>', { fingerprinter }).parser).toBe('unsupported')
    const result = parsePytestJUnit('<testsuite><testcase classname="pkg" name="ok"/><testcase classname="pkg" name="bad"><failure>secret=abc</failure></testcase><testcase name="skip"><skipped/></testcase></testsuite>', { fingerprinter })
    expect(result.tests.map(item => item.status)).toEqual(['passed', 'failed', 'skipped'])
    expect(result.diagnostics[0]?.excerpt).toContain('[REDACTED]')
  })

  it('keeps pytest text observation explicitly incomplete', () => {
    const result = parsePytestText('FAILED tests/test_a.py::test_a - boom\nPASSED tests/test_b.py::test_b', { fingerprinter })
    expect(result.inventory).toBe('incomplete')
    expect(result.reasons).toContain('inventory-incomplete')
  })
})

describe('comparison and store', () => {
  it('reports passed-now only for explicit passed and never for missing cases', () => {
    const before = run({ runId: 'before', diagnostics: [{ id: 'd', excerpt: 'x', occurrences: 2 }], tests: [
      { id: 't1', displayName: 'fails', status: 'failed' },
      { id: 't2', displayName: 'missing', status: 'failed' },
    ] })
    const current = run({ runId: 'current', startSeq: 2, diagnostics: [{ id: 'd', excerpt: 'x', occurrences: 1 }], tests: [
      { id: 't1', displayName: 'fails', status: 'passed' },
    ] })
    const delta = compareRuns(before, current)
    expect(delta.grade).toBe('complete-comparable')
    expect(delta.diagnostics).toMatchObject({ new: 0, persisting: 1, notObserved: 1, absenceLabel: 'not-reproduced' })
    expect(delta.tests).toMatchObject({ passedNow: 1, unconfirmed: 1 })
  })

  it('downgrades unknown evidence and makes series changes incomparable', () => {
    const observational = compareRuns(run({ runId: 'a' }), run({ runId: 'b', startSeq: 2, completeness: completeness({ capture: 'incomplete' }) }))
    expect(observational.grade).toBe('observational')
    expect(observational.diagnostics?.absenceLabel).toBe('not-observed')
    const incomparable = compareRuns(run({ runId: 'a' }), run({ runId: 'b', startSeq: 2, basicSeriesKey: 'other' }))
    expect(incomparable.grade).toBe('incomparable')
    expect(incomparable.diagnostics).toBeUndefined()
  })

  it('selects a completed baseline by start order and exposes eviction health', () => {
    const store = new MemoryRunStore({ maxRunsPerSession: 2 })
    store.append(run({ runId: 'r1', startSeq: 1 }))
    store.append(run({ runId: 'r2', startSeq: 2 }))
    const current = run({ runId: 'r3', startSeq: 3 })
    store.append(current)
    expect(store.baseline('session', current)?.runId).toBe('r2')
    expect(store.snapshot('session').health.evictedRuns).toBe(1)
  })
})
