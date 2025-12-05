export const CIPHER_SOLUTION = '7319'

export function normalizeCipherInput(value) {
  if (typeof value !== 'string') return ''
  return value.replace(/\s+/g, '').replace(/-/g, '').toUpperCase()
}

export function isCipherCorrect(value, solution = CIPHER_SOLUTION) {
  return normalizeCipherInput(value) === normalizeCipherInput(solution)
}

export function revealCipherHint(level, solution = CIPHER_SOLUTION) {
  const normalized = normalizeCipherInput(solution)
  const safeLevel = Math.max(0, Math.min(level, normalized.length))
  return normalized.slice(0, safeLevel)
}
