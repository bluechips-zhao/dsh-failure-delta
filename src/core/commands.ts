import { defaultFingerprinter, Fingerprinter } from './normalize.js'
import type { Runner } from './types.js'

export interface CommandRecognition {
  readonly runner: Runner
  readonly supported: boolean
  readonly scopeKnown: boolean
  readonly semantic: string
  readonly commandDigest: string
  readonly reasons: readonly string[]
}

function tokensOf(command: string): string[] | undefined {
  const tokens: string[] = []
  let current = ''
  let quote: '"' | "'" | undefined
  for (let i = 0; i < command.length; i += 1) {
    const char = command[i]
    if (quote !== undefined) {
      if (char === quote) quote = undefined
      else current += char
      continue
    }
    if (char === '"' || char === "'") {
      quote = char
      continue
    }
    if (/\s/.test(char ?? '')) {
      if (current) tokens.push(current)
      current = ''
      continue
    }
    current += char
  }
  if (quote !== undefined) return undefined
  if (current) tokens.push(current)
  return tokens
}

export function recognizeCommand(command: string, fingerprinter = defaultFingerprinter): CommandRecognition {
  const reasons: string[] = []
  const forbidden = /(?:\||&&|;|\$\(|`|>|<|\n|\r)/u.test(command)
  const tokens = forbidden ? undefined : tokensOf(command.trim())
  let runner: Runner = 'opaque'
  let supported = false
  if (tokens !== undefined) {
    const joined = tokens.slice(0, 3).join(' ')
    if (joined === 'tsc' || joined === 'pnpm exec tsc' || joined === 'npx tsc') {
      runner = 'tsc'
      supported = true
    } else if (joined === 'vitest run' || joined === 'pnpm exec vitest') {
      runner = 'vitest'
      supported = tokens.includes('run')
    } else if ((joined === 'python -m pytest' || joined === 'python3 -m pytest' || joined === 'py -m pytest')) {
      runner = 'pytest'
      supported = true
    }
  }
  if (tokens === undefined) reasons.push('unsupported-command')
  if (!supported && tokens !== undefined) reasons.push('unsupported-command')
  const rangeFlags = ['--watch', '--changed', '--related', '--shard', '--bail', '--maxfail', '--lf', '-k', '--deselect']
  const scopeKnown = supported && !rangeFlags.some(flag => tokens?.some(token => token === flag || token.startsWith(`${flag}=`)))
  if (supported && !scopeKnown) reasons.push('scope-changed')
  if (supported && tokens?.some(token => token === '--build' || token === '-b' || token === '--incremental')) reasons.push('parser-unsupported')
  const commandDigest = fingerprinter.id('command', command)
  const semantic = `${runner}:${commandDigest}:${scopeKnown ? 'scope-known' : 'scope-unknown'}`
  return {
    runner,
    supported,
    scopeKnown,
    semantic,
    commandDigest,
    reasons,
  }
}
