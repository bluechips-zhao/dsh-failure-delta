import type { ParserLimits } from './types.js'

export const DEFAULT_LIMITS: Required<ParserLimits> = {
  maxInputBytes: 1024 * 1024,
  maxDiagnostics: 1000,
  maxTestCases: 20_000,
  maxExcerptChars: 240,
}

export function limitsOf(input?: ParserLimits): Required<ParserLimits> {
  return { ...DEFAULT_LIMITS, ...input }
}

export function utf8Bytes(text: string): number {
  return new TextEncoder().encode(text).byteLength
}

export function limitUtf8(text: string, maxBytes: number): { text: string; truncated: boolean } {
  if (utf8Bytes(text) <= maxBytes) return { text, truncated: false }
  const bytes = new TextEncoder().encode(text).slice(0, Math.max(0, maxBytes))
  return { text: new TextDecoder().decode(bytes), truncated: true }
}

export function capItems<T>(items: readonly T[], max: number): { items: readonly T[]; dropped: number } {
  return items.length <= max ? { items, dropped: 0 } : { items: items.slice(0, max), dropped: items.length - max }
}
