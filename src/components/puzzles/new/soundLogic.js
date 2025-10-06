export const SOUND_PATTERN = ['alpha', 'delta', 'gamma', 'beta']

export function evaluateSoundSequence(input, pattern = SOUND_PATTERN) {
  const normalizedInput = Array.isArray(input) ? input : []
  const normalizedPattern = Array.isArray(pattern) ? pattern : []

  const partialMatch = normalizedInput.every((value, index) => value === normalizedPattern[index])
  if (!partialMatch) {
    return { status: 'incorrect', matches: false, progress: normalizedInput.length }
  }

  if (normalizedInput.length < normalizedPattern.length) {
    return { status: 'incomplete', matches: true, progress: normalizedInput.length }
  }

  return { status: 'correct', matches: true, progress: normalizedPattern.length }
}

export function nextExpectedTone(input, pattern = SOUND_PATTERN) {
  const normalizedInput = Array.isArray(input) ? input : []
  const normalizedPattern = Array.isArray(pattern) ? pattern : []
  const nextIndex = normalizedInput.length
  return normalizedPattern[nextIndex] ?? null
}

export function normalizeToneId(id) {
  return typeof id === 'string' ? id.toLowerCase() : ''
}
