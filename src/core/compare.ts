import type { Delta, Grade, RunRecord, TestCase } from './types.js'

const INCOMPATIBLE_REASONS = new Set([
  'cwd-unknown', 'scope-changed', 'config-changed', 'runner-changed', 'schema-changed',
  'environment-changed', 'parser-unsupported', 'expired-run', 'epoch-changed',
])

export function compareRuns(baseline: RunRecord, current: RunRecord): Delta {
  const reasons = [...new Set([
    ...baseline.completeness.reasons,
    ...current.completeness.reasons,
    ...baseline.reasons,
    ...current.reasons,
  ])]
  const incompatible = baseline.runner !== current.runner
    || baseline.basicSeriesKey !== current.basicSeriesKey
    || reasons.some(reason => INCOMPATIBLE_REASONS.has(reason))
  const complete = !incompatible
    && baseline.completeness.capture === 'known'
    && baseline.completeness.parser === 'known'
    && baseline.completeness.inventory === 'known'
    && baseline.completeness.metadata === 'known'
    && baseline.completeness.freshness === 'known'
    && current.completeness.capture === 'known'
    && current.completeness.parser === 'known'
    && current.completeness.inventory === 'known'
    && current.completeness.metadata === 'known'
    && current.completeness.freshness === 'known'
    && baseline.comparisonEvidenceKey !== undefined
    && baseline.comparisonEvidenceKey === current.comparisonEvidenceKey
  const grade: Grade = incompatible ? 'incomparable' : complete ? 'complete-comparable' : 'observational'
  const common = { baselineRunId: baseline.runId, currentRunId: current.runId, grade, reasons }
  if (grade === 'incomparable') return common
  return {
    ...common,
    diagnostics: diagnosticDelta(baseline.diagnostics, current.diagnostics, grade),
    tests: testDelta(baseline.tests, current.tests),
  }
}

function diagnosticDelta(baseline: RunRecord['diagnostics'], current: RunRecord['diagnostics'], grade: Grade) {
  const before = new Map(baseline.map(item => [item.id, item.occurrences]))
  const after = new Map(current.map(item => [item.id, item.occurrences]))
  let added = 0
  let persisting = 0
  let missing = 0
  for (const [id, count] of after) {
    const prior = before.get(id) ?? 0
    added += Math.max(0, count - prior)
    persisting += Math.min(count, prior)
  }
  for (const [id, count] of before) missing += Math.max(0, count - (after.get(id) ?? 0))
  return { new: added, persisting, notObserved: missing, absenceLabel: grade === 'complete-comparable' ? 'not-reproduced' as const : 'not-observed' as const }
}

function isFailure(status: TestCase['status']): boolean {
  return status === 'failed' || status === 'error'
}

function testDelta(baseline: readonly TestCase[], current: readonly TestCase[]) {
  const before = new Map(baseline.map(item => [item.id, item]))
  const after = new Map(current.map(item => [item.id, item]))
  let newFailures = 0
  let persistingFailures = 0
  let passedNow = 0
  let unconfirmed = 0
  for (const item of current) {
    const prior = before.get(item.id)
    if (prior === undefined) {
      if (isFailure(item.status)) newFailures += 1
      continue
    }
    if (isFailure(prior.status) && isFailure(item.status)) persistingFailures += 1
    else if (isFailure(prior.status) && item.status === 'passed') passedNow += 1
    else if (isFailure(prior.status) && item.status !== 'passed') unconfirmed += 1
  }
  for (const prior of baseline) {
    if (!after.has(prior.id) && isFailure(prior.status)) unconfirmed += 1
  }
  return { newFailures, persistingFailures, passedNow, unconfirmed }
}
