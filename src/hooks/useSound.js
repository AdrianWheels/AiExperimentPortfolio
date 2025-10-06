import { useCallback, useMemo, useRef } from 'react'

function createContext() {
  const AudioContextClass = typeof window !== 'undefined' ? window.AudioContext || window.webkitAudioContext : null
  if (!AudioContextClass) return null
  return new AudioContextClass()
}

export default function useSound() {
  const contextRef = useRef(null)

  const ensureContext = useCallback(async () => {
    if (!contextRef.current) {
      contextRef.current = createContext()
    }
    const context = contextRef.current
    if (context && context.state === 'suspended') {
      try {
        await context.resume()
      } catch (error) {
        console.warn('Unable to resume audio context', error)
      }
    }
    return context
  }, [])

  const playTone = useCallback(
    async (frequency = 440, duration = 0.22, type = 'sine', volume = 0.25) => {
      const context = await ensureContext()
      if (!context) return
      const now = context.currentTime
      const oscillator = context.createOscillator()
      const gain = context.createGain()

      oscillator.type = type
      oscillator.frequency.setValueAtTime(frequency, now)

      gain.gain.setValueAtTime(volume, now)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration)

      oscillator.connect(gain)
      gain.connect(context.destination)

      oscillator.start(now)
      oscillator.stop(now + duration)
    },
    [ensureContext],
  )

  const playSequence = useCallback(
    async (tones) => {
      for (const tone of tones) {
        await playTone(tone.frequency, tone.duration, tone.type, tone.volume)
      }
    },
    [playTone],
  )

  return useMemo(
    () => ({
      playTone,
      playUnlock: () =>
        playSequence([
          { frequency: 420, duration: 0.12, type: 'triangle', volume: 0.3 },
          { frequency: 640, duration: 0.18, type: 'sine', volume: 0.25 },
          { frequency: 860, duration: 0.2, type: 'triangle', volume: 0.2 },
        ]),
      playError: () =>
        playSequence([
          { frequency: 220, duration: 0.2, type: 'sawtooth', volume: 0.25 },
          { frequency: 180, duration: 0.22, type: 'sawtooth', volume: 0.2 },
        ]),
      playSlider: () => playTone(560, 0.05, 'square', 0.08),
    }),
    [playSequence, playTone],
  )
}
