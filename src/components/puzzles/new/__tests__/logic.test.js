import { describe, expect, it } from 'vitest'
import { evaluateSoundSequence, nextExpectedTone, SOUND_PATTERN } from '../soundLogic'
import { isCipherCorrect, normalizeCipherInput, revealCipherHint, CIPHER_SOLUTION } from '../cipherLogic'

describe('soundLogic', () => {
  it('validates correct sequence', () => {
    const result = evaluateSoundSequence(SOUND_PATTERN)
    expect(result.status).toBe('correct')
    expect(result.matches).toBe(true)
    expect(result.progress).toBe(SOUND_PATTERN.length)
  })

  it('detects incorrect sequence', () => {
    const result = evaluateSoundSequence(['alpha', 'gamma'])
    expect(result.status).toBe('incorrect')
    expect(result.matches).toBe(false)
  })

  it('reports next expected tone', () => {
    expect(nextExpectedTone(['alpha', 'delta'])).toBe('gamma')
    expect(nextExpectedTone(SOUND_PATTERN)).toBeNull()
  })
})

describe('cipherLogic', () => {
  it('normalizes cipher input', () => {
    expect(normalizeCipherInput(' mk-7319 ')).toBe('MK7319')
  })

  it('validates correct solution', () => {
    expect(isCipherCorrect('MK-7319')).toBe(true)
    expect(isCipherCorrect('7319')).toBe(false)
  })

  it('reveals hints progressively', () => {
    const first = revealCipherHint(2)
    expect(first).toBe(CIPHER_SOLUTION.slice(0, 2))
    const full = revealCipherHint(20)
    expect(full).toBe(normalizeCipherInput(CIPHER_SOLUTION))
  })
})
