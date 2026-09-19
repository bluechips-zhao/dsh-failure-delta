import { randomUUID } from 'node:crypto'
import { recognizeCommand } from '../core/commands.js'
import { Fingerprinter } from '../core/normalize.js'
import { MemoryRunStore } from '../core/store.js'
import type { CanonicalForeground, Completeness, ParserLimits, RunRecord } from '../core/types.js'
import { normalizeForegroundValue } from './canonical.js'

export interface ObserverExecution {
  readonly token: symbol
  readonly callId: string
  readonly rootCallId: string
  readonly session: object | undefined
  readonly runnerCommand: string
  readonly startedAt: string
  readonly startSeq: number
}

export interface ObserverResult {
  readonly isError: boolean
  readonly value?: unknown
}

export interface ObservedRun {
  readonly execution: ObserverExecution
  readonly sessionId: string
  readonly record: RunRecord
  readonly foreground?: CanonicalForeground
}

/**
 * Host-neutral bridge for the official execute/result seam. It owns no DSH
 * objects and never reads spillPath; an integration supplies opaque Session
 * identity and final canonical result values.
 */
export class FailureDeltaObserver {
  readonly #pending = new Map<symbol, ObserverExecution>()
  readonly #sessionIds = new WeakMap<object, string>()
  readonly #store: MemoryRunStore
  readonly #fingerprinter = new Fingerprinter()
  #nextSeq = 0
  #recorderErrors = 0

  constructor(store = new MemoryRunStore(), _limits?: ParserLimits) {
    this.#store = store
  }

  begin(input: Omit<ObserverExecution, 'startSeq'>): void {
    if (this.#pending.size >= 256) {
      this.#recorderErrors += 1
      return
    }
    this.#pending.set(input.token, { ...input, startSeq: ++this.#nextSeq })
  }

  finish(token: symbol, result: ObserverResult, observedEndAt = new Date().toISOString()): ObservedRun | undefined {
    const execution = this.#pending.get(token)
    this.#pending.delete(token)
    if (execution === undefined || execution.session === undefined) return undefined
    const normalized = result.isError
      ? { kind: 'unsupported' as const, reasons: ['tool-failure'] as const }
      : normalizeForegroundValue(result.value)
    const command = recognizeCommand(execution.runnerCommand, this.#fingerprinter)
    const sessionId = this.#sessionId(execution.session)
    const completeness: Completeness = {
      capture: normalized.kind === 'foreground' && (normalized.value.stdout.truncated || normalized.value.stderr.truncated) ? 'incomplete' : normalized.kind === 'foreground' ? 'known' : 'unknown',
      parser: normalized.kind === 'foreground' && command.supported ? 'known' : 'unsupported',
      inventory: 'unknown',
      metadata: 'unknown',
      freshness: 'unknown',
      reasons: [
        ...command.reasons,
        ...(normalized.kind === 'foreground' && (normalized.value.stdout.truncated || normalized.value.stderr.truncated) ? ['capture-truncated'] : []),
        ...(normalized.kind === 'unsupported' ? normalized.reasons : []),
      ],
    }
    const foreground = normalized.kind === 'foreground' ? normalized.value : undefined
    const record: RunRecord = {
      runId: randomUUID(),
      sessionId,
      epoch: this.#store.epoch,
      startSeq: execution.startSeq,
      startedAt: execution.startedAt,
      observedEndAt,
      callId: execution.callId,
      rootCallId: execution.rootCallId,
      state: foreground === undefined ? (result.isError ? 'error' : 'unsupported') : 'ready',
      runner: command.runner,
      parserVersion: 'host-observation-v1',
      basicSeriesKey: `${command.runner}:${command.semantic}`,
      completeness,
      ...(foreground === undefined ? {} : { process: {
        exitCode: foreground.exitCode,
        signal: foreground.signal,
        timedOut: foreground.timedOut,
        aborted: foreground.aborted,
      } }),
      diagnostics: [],
      tests: [],
      droppedDiagnostics: 0,
      droppedTests: 0,
      reasons: completeness.reasons,
    }
    this.#store.append(record)
    return { execution, sessionId, record, ...(foreground === undefined ? {} : { foreground }) }
  }

  get store(): MemoryRunStore { return this.#store }
  get recorderErrors(): number { return this.#recorderErrors }

  #sessionId(session: object): string {
    const existing = this.#sessionIds.get(session)
    if (existing !== undefined) return existing
    const id = randomUUID()
    this.#sessionIds.set(session, id)
    return id
  }
}
