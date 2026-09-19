import { limitUtf8 } from '../core/limits.js'
import type { CanonicalForeground } from '../core/types.js'

const MAX_CAPTURE_BYTES = 1024 * 1024

export type CanonicalValueResult =
  | { readonly kind: 'foreground'; readonly value: CanonicalForeground }
  | { readonly kind: 'unsupported'; readonly reasons: readonly string[] }

function recordOf(value: unknown): Record<string, unknown> | undefined {
  return typeof value === 'object' && value !== null && !Array.isArray(value) ? value as Record<string, unknown> : undefined
}

function outputOf(value: unknown): { text: string; truncated: boolean } | undefined {
  const record = recordOf(value)
  if (typeof record?.text !== 'string' || typeof record.truncated !== 'boolean') return undefined
  return { ...limitUtf8(record.text, MAX_CAPTURE_BYTES), truncated: record.truncated || limitUtf8(record.text, MAX_CAPTURE_BYTES).truncated }
}

export function normalizeForegroundValue(value: unknown): CanonicalValueResult {
  const root = recordOf(value)
  if (root?.kind === 'background') return { kind: 'unsupported', reasons: ['unsupported-background'] }
  if (root?.kind !== 'foreground') return { kind: 'unsupported', reasons: ['unknown-result'] }
  const stdout = outputOf(root.stdout)
  const stderr = outputOf(root.stderr)
  const valid = (root.exitCode === null || Number.isInteger(root.exitCode))
    && (root.signal === null || typeof root.signal === 'string')
    && typeof root.timedOut === 'boolean'
    && typeof root.aborted === 'boolean'
    && typeof root.timeoutMs === 'number' && Number.isFinite(root.timeoutMs)
    && stdout !== undefined && stderr !== undefined
  if (!valid) return { kind: 'unsupported', reasons: ['unknown-result'] }
  const sandbox = recordOf(root.sandbox)
  return {
    kind: 'foreground',
    value: {
      kind: 'foreground',
      exitCode: root.exitCode as number | null,
      signal: root.signal as string | null,
      timedOut: root.timedOut as boolean,
      aborted: root.aborted as boolean,
      timeoutMs: root.timeoutMs as number,
      stdout,
      stderr,
      ...(sandbox !== undefined && typeof sandbox.mode === 'string' && typeof sandbox.denied === 'boolean'
        ? { sandbox: {
          mode: sandbox.mode,
          denied: sandbox.denied,
          ...(typeof sandbox.enforcement === 'string' ? { enforcement: sandbox.enforcement } : {}),
          ...(typeof sandbox.runnerFailed === 'boolean' ? { runnerFailed: sandbox.runnerFailed } : {}),
        } } : {}),
    },
  }
}
