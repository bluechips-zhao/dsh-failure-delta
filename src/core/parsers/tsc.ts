import { capItems, limitsOf } from '../limits.js'
import { aggregateDiagnostics, defaultFingerprinter, diagnostic, Fingerprinter, cleanText } from '../normalize.js'
import type { ParserLimits, ParserResult } from '../types.js'

const FILE_DIAGNOSTIC = /^(.*)\((\d+),(\d+)\):\s*(error|warning)\s+(TS\d+):\s*(.*)$/u
const GLOBAL_DIAGNOSTIC = /^(error|warning)\s+(TS\d+):\s*(.*)$/u

export function parseTsc(text: string, options: { truncated?: boolean; fingerprinter?: Fingerprinter; limits?: ParserLimits } = {}): ParserResult {
  const fingerprinter = options.fingerprinter ?? defaultFingerprinter
  const limits = limitsOf(options.limits)
  const lines = cleanText(text).split(/\r?\n/u)
  const found = []
  let continuation: { index: number; message: string } | undefined
  for (const line of lines) {
    const fileMatch = FILE_DIAGNOSTIC.exec(line)
    const globalMatch = GLOBAL_DIAGNOSTIC.exec(line)
    if (fileMatch !== null) {
      const [, file = '', lineNumber = '0', column = '0', , code = '', message = ''] = fileMatch
      found.push(diagnostic(fingerprinter, { file, line: Number(lineNumber), column: Number(column), code, message }, limits))
      continuation = { index: found.length - 1, message }
      continue
    }
    if (globalMatch !== null) {
      const [, , code = '', message = ''] = globalMatch
      found.push(diagnostic(fingerprinter, { code, message }, limits))
      continuation = { index: found.length - 1, message }
      continue
    }
    if (continuation !== undefined && /^\s+\S/u.test(line) && line.trim() !== '') {
      const prior: (typeof found)[number] | undefined = found[continuation.index]
      if (prior !== undefined) {
        const message = `${continuation.message} ${line.trim()}`
        found[continuation.index] = diagnostic(fingerprinter, {
          ...(prior.code === undefined ? {} : { code: prior.code }),
          ...(prior.file === undefined ? {} : { file: prior.file }),
          ...(prior.line === undefined ? {} : { line: prior.line }),
          ...(prior.column === undefined ? {} : { column: prior.column }),
          message,
          occurrences: prior.occurrences,
        }, limits)
        continuation.message = message
      }
    }
  }
  const bounded = capItems(aggregateDiagnostics(found), limits.maxDiagnostics)
  const reasons = [...bounded.dropped > 0 ? ['budget-exceeded'] : [], ...options.truncated ? ['capture-truncated'] : []]
  return {
    runner: 'tsc',
    parserVersion: 'tsc-diagnostics-v1',
    diagnostics: bounded.items,
    tests: [],
    parser: reasons.length === 0 ? 'known' : 'incomplete',
    inventory: 'unsupported',
    reasons,
  }
}
