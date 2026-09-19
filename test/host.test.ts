import { describe, expect, it } from 'vitest'
import { FailureDeltaObserver, normalizeForegroundValue } from '../src/host/index.js'

describe('host-neutral canonical adapter', () => {
  it('copies only bounded foreground fields and never reads spillPath', () => {
    const result = normalizeForegroundValue({
      kind: 'foreground', exitCode: 1, signal: null, timedOut: false, aborted: false, timeoutMs: 1000,
      stdout: { text: 'ok', truncated: false, spillPath: 'should-not-be-read' },
      stderr: { text: 'secret=abc', truncated: false },
    })
    expect(result.kind).toBe('foreground')
    if (result.kind === 'foreground') {
      expect(result.value.stdout).toEqual({ text: 'ok', truncated: false })
      expect(result.value.stderr.text).toBe('secret=abc')
    }
  })

  it('does not turn background handles or tool failures into runs', () => {
    expect(normalizeForegroundValue({ kind: 'background', jobId: 'job' })).toEqual({ kind: 'unsupported', reasons: ['unsupported-background'] })
    const observer = new FailureDeltaObserver()
    const session = {}
    const token = Symbol('token')
    observer.begin({ token, callId: 'call', rootCallId: 'root', session, runnerCommand: 'tsc --noEmit', startedAt: new Date(0).toISOString() })
    const observed = observer.finish(token, { isError: true, value: { kind: 'foreground' } })
    expect(observed?.record.state).toBe('error')
    expect(observer.store.snapshot(observed?.sessionId ?? 'unknown').runs).toHaveLength(1)
  })
})
