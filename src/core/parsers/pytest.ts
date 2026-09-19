import { capItems, limitsOf, utf8Bytes } from '../limits.js'
import { aggregateDiagnostics, defaultFingerprinter, diagnostic, Fingerprinter, markAmbiguousTests, testCase } from '../normalize.js'
import type { ParserLimits, ParserResult, TestStatus } from '../types.js'

function statusFromJUnit(node: string): TestStatus {
  if (node === 'failure') return 'failed'
  if (node === 'error') return 'error'
  if (node === 'skipped') return 'skipped'
  return 'passed'
}

function attr(tag: string, name: string): string | undefined {
  const match = new RegExp(`\\b${name}\\s*=\\s*(["'])(.*?)\\1`, 'u').exec(tag)
  return match?.[2]
}

export function parsePytestJUnit(xml: string, options: { fingerprinter?: Fingerprinter; limits?: ParserLimits } = {}): ParserResult {
  const fingerprinter = options.fingerprinter ?? defaultFingerprinter
  const limits = limitsOf(options.limits)
  if (/<!DOCTYPE|<!ENTITY|<\?xml-stylesheet/iu.test(xml)) {
    return { runner: 'pytest', parserVersion: 'pytest-junit-v1', diagnostics: [], tests: [], parser: 'unsupported', inventory: 'unsupported', reasons: ['parser-unsupported'] }
  }
  if (utf8Bytes(xml) > limits.maxInputBytes || (xml.match(/</g)?.length ?? 0) > limits.maxTestCases * 4) {
    return { runner: 'pytest', parserVersion: 'pytest-junit-v1', diagnostics: [], tests: [], parser: 'incomplete', inventory: 'incomplete', reasons: ['budget-exceeded'] }
  }
  const normalizedXml = xml.replace(/<testcase\b([^>]*)\/>/giu, '<testcase$1></testcase>')
  const tests = []
  const diagnostics = []
  const testcasePattern = /<testcase\b[^>]*>([\s\S]*?)<\/testcase\s*>/giu
  let match: RegExpExecArray | null
  let malformed = false
  while ((match = testcasePattern.exec(normalizedXml)) !== null) {
    const open = /<testcase\b[^>]*>/iu.exec(match[0])?.[0]
    if (open === undefined) {
      malformed = true
      continue
    }
    const body = match[1] ?? ''
    const hasFailure = /<failure\b/iu.test(body)
    const hasError = /<error\b/iu.test(body)
    const skipped = /<skipped\b/iu.test(body)
    const status = statusFromJUnit(hasError ? 'error' : hasFailure ? 'failure' : skipped ? 'skipped' : 'passed')
    const name = attr(open, 'name')
    const classname = attr(open, 'classname')
    if (name === undefined) {
      malformed = true
      continue
    }
    const message = /<(?:failure|error)\b[^>]*>([\s\S]*?)<\/(?:failure|error)\s*>/iu.exec(body)?.[1]
    tests.push(testCase(fingerprinter, { runner: 'pytest', ...(classname === undefined ? {} : { project: classname }), names: [name], status, ...(message === undefined ? {} : { message }) }, limits))
    if (message !== undefined && (hasFailure || hasError)) diagnostics.push(diagnostic(fingerprinter, { ...(classname === undefined ? {} : { file: classname }), message }, limits))
  }
  const declaredCases = normalizedXml.match(/<testcase\b/giu)?.length ?? 0
  if (declaredCases !== tests.length) malformed = true
  const boundedTests = capItems(markAmbiguousTests(tests), limits.maxTestCases)
  const boundedDiagnostics = capItems(aggregateDiagnostics(diagnostics), limits.maxDiagnostics)
  const reasons = [
    ...malformed ? ['parser-unsupported'] : [],
    ...boundedTests.dropped || boundedDiagnostics.dropped ? ['budget-exceeded'] : [],
    ...boundedTests.items.some(item => item.status === 'ambiguous') ? ['ambiguous-test'] : [],
  ]
  return {
    runner: 'pytest',
    parserVersion: 'pytest-junit-v1',
    diagnostics: boundedDiagnostics.items,
    tests: boundedTests.items,
    parser: reasons.includes('parser-unsupported') ? 'unsupported' : reasons.length > 0 ? 'incomplete' : 'known',
    inventory: boundedTests.dropped > 0 || reasons.includes('ambiguous-test') ? 'incomplete' : 'known',
    reasons: [...new Set(reasons)],
  }
}

export function parsePytestText(text: string, options: { fingerprinter?: Fingerprinter; limits?: ParserLimits } = {}): ParserResult {
  const fingerprinter = options.fingerprinter ?? defaultFingerprinter
  const limits = limitsOf(options.limits)
  const tests = []
  const diagnostics = []
  for (const line of text.split(/\r?\n/u)) {
    const match = /^\s*(FAILED|PASSED|SKIPPED)\s+([^\s]+)(?:\s+-\s+(.*))?$/u.exec(line)
    if (match === null) continue
    const status: TestStatus = match[1] === 'FAILED' ? 'failed' : match[1] === 'SKIPPED' ? 'skipped' : 'passed'
    const target = match[2] ?? '[unknown]'
    const message = match[3]
    tests.push(testCase(fingerprinter, { runner: 'pytest', names: [target], status, ...(message === undefined ? {} : { message }) }, limits))
    if (message !== undefined && status === 'failed') diagnostics.push(diagnostic(fingerprinter, { message }, limits))
  }
  const boundedTests = capItems(markAmbiguousTests(tests), limits.maxTestCases)
  const boundedDiagnostics = capItems(aggregateDiagnostics(diagnostics), limits.maxDiagnostics)
  return {
    runner: 'pytest',
    parserVersion: 'pytest-text-v1',
    diagnostics: boundedDiagnostics.items,
    tests: boundedTests.items,
    parser: 'incomplete',
    inventory: 'incomplete',
    reasons: ['inventory-incomplete', ...(boundedTests.items.some(item => item.status === 'ambiguous') ? ['ambiguous-test'] : []), ...(boundedTests.dropped || boundedDiagnostics.dropped ? ['budget-exceeded'] : [])],
  }
}
