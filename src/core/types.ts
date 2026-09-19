export type Grade = 'complete-comparable' | 'observational' | 'incomparable'
export type Evidence = 'known' | 'unknown' | 'incomplete' | 'unsupported'
export type RunState = 'processing' | 'ready' | 'unsupported' | 'dropped' | 'error'
export type Runner = 'tsc' | 'vitest' | 'pytest' | 'opaque'
export type TestStatus = 'passed' | 'failed' | 'error' | 'skipped' | 'pending' | 'todo' | 'deselected' | 'ambiguous'

export interface Completeness {
  capture: Evidence
  parser: Evidence
  inventory: Evidence
  metadata: Evidence
  freshness: Evidence
  reasons: string[]
}

export interface Diagnostic {
  readonly id: string
  readonly code?: string
  readonly file?: string
  readonly line?: number
  readonly column?: number
  readonly excerpt: string
  readonly occurrences: number
}

export interface TestCase {
  readonly id: string
  readonly displayName: string
  readonly file?: string
  readonly project?: string
  readonly status: TestStatus
  readonly excerpt?: string
}

export interface ProcessOutcome {
  readonly exitCode: number | null
  readonly signal: string | null
  readonly timedOut: boolean
  readonly aborted: boolean
}

export interface RunRecord {
  readonly runId: string
  readonly sessionId: string
  readonly epoch: string
  readonly startSeq: number
  readonly startedAt: string
  readonly observedEndAt: string
  readonly callId: string
  readonly rootCallId: string
  readonly state: RunState
  readonly runner: Runner
  readonly parserVersion: string
  readonly basicSeriesKey: string
  readonly comparisonEvidenceKey?: string
  readonly completeness: Completeness
  readonly process?: ProcessOutcome
  readonly diagnostics: readonly Diagnostic[]
  readonly tests: readonly TestCase[]
  readonly droppedDiagnostics: number
  readonly droppedTests: number
  readonly reasons: readonly string[]
}

export interface DiagnosticDelta {
  readonly new: number
  readonly persisting: number
  readonly notObserved: number
  readonly absenceLabel: 'not-observed' | 'not-reproduced'
}

export interface TestDelta {
  readonly newFailures: number
  readonly persistingFailures: number
  readonly passedNow: number
  readonly unconfirmed: number
}

export interface Delta {
  readonly baselineRunId: string
  readonly currentRunId: string
  readonly grade: Grade
  readonly reasons: readonly string[]
  readonly diagnostics?: DiagnosticDelta
  readonly tests?: TestDelta
}

export interface ParserResult {
  readonly runner: Runner
  readonly parserVersion: string
  readonly diagnostics: readonly Diagnostic[]
  readonly tests: readonly TestCase[]
  readonly parser: Evidence
  readonly inventory: Evidence
  readonly reasons: readonly string[]
}

export interface CanonicalForeground {
  readonly kind: 'foreground'
  readonly exitCode: number | null
  readonly signal: string | null
  readonly timedOut: boolean
  readonly aborted: boolean
  readonly timeoutMs: number
  readonly stdout: { readonly text: string; readonly truncated: boolean }
  readonly stderr: { readonly text: string; readonly truncated: boolean }
  readonly sandbox?: { readonly mode: string; readonly denied: boolean; readonly enforcement?: string; readonly runnerFailed?: boolean }
}

export interface ParserLimits {
  readonly maxInputBytes?: number
  readonly maxDiagnostics?: number
  readonly maxTestCases?: number
  readonly maxExcerptChars?: number
}
