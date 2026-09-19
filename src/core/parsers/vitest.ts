import { capItems, limitsOf } from '../limits.js'
import { aggregateDiagnostics, defaultFingerprinter, diagnostic, Fingerprinter, markAmbiguousTests, testCase } from '../normalize.js'
import type { ParserLimits, ParserResult, TestStatus } from '../types.js'

function statusOf(value: unknown): TestStatus | undefined {
  if (value === 'passed') return 'passed'
  if (value === 'failed') return 'failed'
  if (value === 'skipped') return 'skipped'
  if (value === 'pending') return 'pending'
  if (value === 'todo') return 'todo'
  return undefined
}

function asRecord(value: unknown): Record<string, unknown> | undefined {
  return typeof value === 'object' && value !== null && !Array.isArray(value) ? value as Record<string, unknown> : undefined
}

export function parseVitestJson(text: string, options: { fingerprinter?: Fingerprinter; limits?: ParserLimits } = {}): ParserResult {
  const fingerprinter = options.fingerprinter ?? defaultFingerprinter
  const limits = limitsOf(options.limits)
  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch {
    return { runner: 'vitest', parserVersion: 'vitest-json-v1', diagnostics: [], tests: [], parser: 'unsupported', inventory: 'unsupported', reasons: ['parser-unsupported'] }
  }
  const root = asRecord(parsed)
  const suiteRows = root?.testResults
  if (!Array.isArray(suiteRows)) {
    return { runner: 'vitest', parserVersion: 'vitest-json-v1', diagnostics: [], tests: [], parser: 'unsupported', inventory: 'unsupported', reasons: ['parser-unsupported'] }
  }
  const tests = []
  const diagnostics = []
  let malformed = false
  for (const suite of suiteRows) {
    const record = asRecord(suite)
    const assertions = record?.assertionResults
    if (record === undefined || !Array.isArray(assertions)) {
      malformed = true
      continue
    }
    const file = typeof record.name === 'string' ? record.name : undefined
    for (const assertion of assertions) {
      const item = asRecord(assertion)
      const status = statusOf(item?.status)
      const title = typeof item?.title === 'string' ? item.title : undefined
      if (status === undefined || title === undefined) {
        malformed = true
        continue
      }
      if (item === undefined) {
        malformed = true
        continue
      }
      const ancestors = Array.isArray(item.ancestorTitles) && item.ancestorTitles.every(value => typeof value === 'string')
        ? item.ancestorTitles as string[]
        : []
      const failureMessages = Array.isArray(item.failureMessages) ? item.failureMessages.filter((value): value is string => typeof value === 'string') : []
      tests.push(testCase(fingerprinter, {
        runner: 'vitest',
        ...(file === undefined ? {} : { file }),
        names: [...ancestors, title],
        status,
        ...(failureMessages[0] === undefined ? {} : { message: failureMessages[0] }),
      }, limits))
      for (const message of failureMessages) diagnostics.push(diagnostic(fingerprinter, { ...(file === undefined ? {} : { file }), message }, limits))
    }
  }
  const boundedTests = capItems(markAmbiguousTests(tests), limits.maxTestCases)
  const boundedDiagnostics = capItems(aggregateDiagnostics(diagnostics), limits.maxDiagnostics)
  const reasons = [
    ...malformed ? ['parser-unsupported'] : [],
    ...boundedTests.dropped || boundedDiagnostics.dropped ? ['budget-exceeded'] : [],
    ...boundedTests.items.some(item => item.status === 'ambiguous') ? ['ambiguous-test'] : [],
  ]
  const declared = typeof root?.numTotalTests === 'number' ? root.numTotalTests : undefined
  if (declared !== undefined && declared !== tests.length) reasons.push('inventory-incomplete')
  return {
    runner: 'vitest',
    parserVersion: 'vitest-json-v1',
    diagnostics: boundedDiagnostics.items,
    tests: boundedTests.items,
    parser: reasons.includes('parser-unsupported') ? 'unsupported' : reasons.length > 0 ? 'incomplete' : 'known',
    inventory: reasons.includes('inventory-incomplete') || reasons.includes('ambiguous-test') || boundedTests.dropped > 0 ? 'incomplete' : 'known',
    reasons: [...new Set(reasons)],
  }
}
