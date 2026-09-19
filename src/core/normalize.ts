import { createHmac, randomBytes } from 'node:crypto'
import { limitUtf8, limitsOf } from './limits.js'
import type { Diagnostic, ParserLimits, TestCase, TestStatus } from './types.js'

const ANSI = /\u001B(?:\[[0-?]*[ -/]*[@-~]|\][^\u0007]*(?:\u0007|\u001B\\))/g
const CONTROL = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g
const SECRET = /((?:token|secret|password|passwd|api[_-]?key|authorization)\s*[=:]\s*)([^\s,;]+)/gi
const URL_SECRET = /(https?:\/\/[^\s/@]+):([^\s/@]+)@/gi
const ABSOLUTE_PATH = /(?:[A-Za-z]:\\[^\s'"`]+|\/Users\/[^\s'"`]+|\/home\/[^\s'"`]+|\/workspace\/[^\s'"`]+)/g

export class Fingerprinter {
  readonly #key = randomBytes(32)

  id(domain: 'diagnostic' | 'test' | 'command', semantic: string): string {
    return createHmac('sha256', this.#key).update(domain).update('\0').update(semantic).digest('hex')
  }
}

/** One process-random key makes default parser calls comparable within one epoch. */
export const defaultFingerprinter = new Fingerprinter()

export function cleanText(input: string): string {
  return input.replace(ANSI, '').replace(CONTROL, '')
}

export function redactExcerpt(input: string, limits?: ParserLimits): string {
  const max = limitsOf(limits).maxExcerptChars
  const redacted = cleanText(input)
    .replace(URL_SECRET, '$1:[REDACTED]@')
    .replace(SECRET, '$1[REDACTED]')
    .replace(ABSOLUTE_PATH, '[PATH]')
    .replace(/\s+/g, ' ')
    .trim()
  return limitUtf8(redacted, max).text
}

export function normalizeFile(file: string | undefined): string | undefined {
  if (file === undefined) return undefined
  const normalized = file.replaceAll('\\', '/').replace(/^\.\//, '')
  if (/^[A-Za-z]:\//.test(normalized) || normalized.startsWith('/')) return '[ABSOLUTE_PATH]'
  return normalized || undefined
}

export function diagnostic(
  fingerprinter: Fingerprinter,
  input: { code?: string; file?: string; line?: number; column?: number; message: string; occurrences?: number },
  limits?: ParserLimits,
): Diagnostic {
  const file = normalizeFile(input.file)
  const code = input.code?.toUpperCase()
  const identityFile = input.file?.replaceAll('\\', '/')
  const semantic = [code ?? '', identityFile ?? '', cleanText(input.message).trim()].join('\u001F')
  return {
    id: fingerprinter.id('diagnostic', semantic),
    ...(code === undefined ? {} : { code }),
    ...(file === undefined ? {} : { file }),
    ...(input.line === undefined ? {} : { line: input.line }),
    ...(input.column === undefined ? {} : { column: input.column }),
    excerpt: redactExcerpt(input.message, limits),
    occurrences: input.occurrences ?? 1,
  }
}

export function testCase(
  fingerprinter: Fingerprinter,
  input: { runner: string; project?: string; file?: string; names: readonly string[]; status: TestStatus; message?: string },
  limits?: ParserLimits,
): TestCase {
  const file = normalizeFile(input.file)
  const project = input.project?.trim() || undefined
  const displayName = input.names.map(name => cleanText(name).trim()).filter(Boolean).join(' > ') || '[unnamed]'
  const identityFile = input.file?.replaceAll('\\', '/')
  const semantic = [input.runner, project ?? '', identityFile ?? '', displayName].join('\u001F')
  return {
    id: fingerprinter.id('test', semantic),
    displayName: redactExcerpt(displayName, { ...limitsOf(limits), maxExcerptChars: 160 }),
    ...(file === undefined ? {} : { file }),
    ...(project === undefined ? {} : { project: redactExcerpt(project, { ...limitsOf(limits), maxExcerptChars: 160 }) }),
    status: input.status,
    ...(input.message === undefined ? {} : { excerpt: redactExcerpt(input.message, limits) }),
  }
}

export function aggregateDiagnostics(items: readonly Diagnostic[]): readonly Diagnostic[] {
  const merged = new Map<string, Diagnostic>()
  for (const item of items) {
    const previous = merged.get(item.id)
    if (previous === undefined) merged.set(item.id, item)
    else merged.set(item.id, { ...previous, occurrences: previous.occurrences + item.occurrences })
  }
  return [...merged.values()]
}

export function markAmbiguousTests(items: readonly TestCase[]): readonly TestCase[] {
  const counts = new Map<string, number>()
  for (const item of items) counts.set(item.id, (counts.get(item.id) ?? 0) + 1)
  return items.map(item => (counts.get(item.id) === 1 ? item : { ...item, status: 'ambiguous' as const }))
}
