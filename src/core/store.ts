import { randomUUID } from 'node:crypto'
import { compareRuns } from './compare.js'
import type { Delta, RunRecord } from './types.js'

export interface StoreLimits {
  readonly maxRunsPerSession?: number
  readonly maxSessions?: number
}

export interface StoreHealth {
  readonly droppedRuns: number
  readonly evictedRuns: number
}

export interface StoreSnapshot {
  readonly epoch: string
  readonly revision: number
  readonly runs: readonly RunRecord[]
  readonly health: StoreHealth
}

const DEFAULTS = { maxRunsPerSession: 100, maxSessions: 32 }

export class MemoryRunStore {
  readonly #epoch = randomUUID()
  readonly #limits: Required<StoreLimits>
  readonly #sessions = new Map<string, RunRecord[]>()
  #revision = 0
  #droppedRuns = 0
  #evictedRuns = 0

  constructor(limits: StoreLimits = {}) {
    this.#limits = { ...DEFAULTS, ...limits }
  }

  get epoch(): string { return this.#epoch }
  get revision(): number { return this.#revision }

  append(run: Omit<RunRecord, 'epoch'>): RunRecord | undefined {
    if (this.#sessions.size >= this.#limits.maxSessions && !this.#sessions.has(run.sessionId)) {
      this.#droppedRuns += 1
      return undefined
    }
    const record: RunRecord = { ...run, epoch: this.#epoch }
    const session = this.#sessions.get(run.sessionId) ?? []
    session.push(record)
    while (session.length > this.#limits.maxRunsPerSession) {
      session.shift()
      this.#evictedRuns += 1
    }
    this.#sessions.set(run.sessionId, session)
    this.#revision += 1
    return record
  }

  runs(sessionId: string): readonly RunRecord[] {
    return this.#sessions.get(sessionId) ?? []
  }

  baseline(sessionId: string, current: RunRecord): RunRecord | undefined {
    const candidates = this.runs(sessionId).filter(run => run.state === 'ready'
      && run.startSeq < current.startSeq
      && run.basicSeriesKey === current.basicSeriesKey)
    return candidates.sort((left, right) => left.startSeq - right.startSeq).at(-1)
  }

  compare(sessionId: string, current: RunRecord, baselineRunId?: string): Delta | undefined {
    const baseline = baselineRunId === undefined
      ? this.baseline(sessionId, current)
      : this.runs(sessionId).find(run => run.runId === baselineRunId)
    return baseline === undefined ? undefined : compareRuns(baseline, current)
  }

  snapshot(sessionId: string): StoreSnapshot {
    return {
      epoch: this.#epoch,
      revision: this.#revision,
      runs: this.runs(sessionId),
      health: { droppedRuns: this.#droppedRuns, evictedRuns: this.#evictedRuns },
    }
  }
}
