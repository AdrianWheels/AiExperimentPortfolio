import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import useSound from '../hooks/useSound'
import { debug, isDevMode } from '../utils/debug'

// Base URL para assets estáticos
const BASE_URL = import.meta.env.BASE_URL || '/'

const STORAGE_KEY = 'genio_state'
export const MODEL = 'MK-7319'
export const MODEL_CODE = '7319'
export const TARGETS = { f1: 0.62, f2: 0.74, f3: 0.58 }
export const TOLERANCE = 0.03

const INITIAL_LOCK_STATE = {
  security: false,
  frequency: false,
  wiring: false,
}



function createInitialPuzzleProgress() {
  return {
    sound: { solved: false },
    cipher: { solved: false },
    frequency: { solved: false },
    wiring: { solved: false },
    security: { solved: false },
  }
}

function normalizePuzzleProgress(raw) {
  const base = createInitialPuzzleProgress()
  const source = raw || {}
  return Object.keys(base).reduce((acc, key) => {
    acc[key] = { ...base[key], ...(source[key] || {}) }
    return acc
  }, {})
}

function resolveActiveChallenge(state) {
  const progress = state?.puzzleProgress || {}
  if (!progress.sound?.solved) return 'sound'
  if (!progress.cipher?.solved) return 'cipher'
  if (!state?.locks?.frequency) return 'frequency'
  if (!state?.locks?.security) return 'security'
  if (!state?.locks?.wiring) return 'wiring'
  return 'free'
}

const INITIAL_GAME_STATE = {
  stage: 'Trapped',
  locks: INITIAL_LOCK_STATE,
  usedBypass: false,
  twistShown: false,

  introSeen: false,
  portfolioUnlocked: false,
  activeView: 'game',
  puzzleProgress: createInitialPuzzleProgress(),
}

const INITIAL_SLIDERS = { f1: 0.5, f2: 0.5, f3: 0.5 }
const INITIAL_PLATE = {
  FURY: null,
  JOY: null,
  SADNESS: null,
  FEAR: null,
  LOVE: null,
  CALM: null,
  ENVY: null
}

const GameContext = createContext(null)

function applyTemplate(text, context = {}) {
  if (!text) return ''
  return text.replace(/\{\{(.*?)\}\}/g, (_, token) => {
    const key = token.trim()
    if (!(key in context)) {
      return `{{${key}}}`
    }
    const value = context[key]
    return value == null ? '' : String(value)
  })
}

function loadPersistedState() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return null
    const parsed = JSON.parse(stored)
    const merged = {
      ...INITIAL_GAME_STATE,
      ...parsed,
      locks: { ...INITIAL_LOCK_STATE, ...(parsed?.locks || {}) },
      puzzleProgress: normalizePuzzleProgress(parsed?.puzzleProgress),
      hintLog: Array.isArray(parsed?.hintLog) ? parsed.hintLog : [],
      hintCooldownUntil: parsed?.hintCooldownUntil ?? 0,
    }
    merged.portfolioUnlocked = Boolean(parsed?.portfolioUnlocked)
    const requestedView = parsed?.activeView === 'portfolio' ? 'portfolio' : 'game'
    merged.activeView = merged.portfolioUnlocked && requestedView === 'portfolio' ? 'portfolio' : 'game'
    return merged
  } catch (error) {
    debug.warn('Unable to load persisted game state', error)
    return null
  }
}

function savePersistedState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch (error) {
    debug.warn('Unable to persist game state', error)
  }
}

export function GameProvider({ children }) {
  const persisted = loadPersistedState()
  const [gameState, setGameState] = useState(persisted || INITIAL_GAME_STATE)
  const [sliders, setSliders] = useState(INITIAL_SLIDERS)
  const [plateConnections, setPlateConnections] = useState(INITIAL_PLATE)
  const [plateOpen, setPlateOpen] = useState(false)
  const [narrativeScript, setNarrativeScript] = useState({ intro: [], events: {}, reactions: {}, timers: [] })
  const [introStep, setIntroStep] = useState(0)
  const [introVisible, setIntroVisible] = useState(() => !(persisted?.introSeen))
  const [unlockAnimations, setUnlockAnimations] = useState({ locks: { ...INITIAL_LOCK_STATE }, pulse: 0 })
  const [lastTriggeredEvent, setLastTriggeredEvent] = useState(null)
  // Estado de habla de Kira: { speaking: boolean, emotion: 'info'|'success'|'warning'|'humor' }
  const [kiraSpeaking, setKiraSpeaking] = useState({ speaking: false, emotion: 'info' })
  // Indica si el jugador ha iniciado el puzzle actual (pulsando Play)
  const [puzzleStarted, setPuzzleStarted] = useState(false)
  // Estado para saber qué emoción de cable se está arrastrando (para sprites de Kira)
  const [activeCableEmotion, setActiveCableEmotion] = useState(null)

  const { playTone, playUnlock, playError, playSlider } = useSound()

  const scheduledTimers = useRef([])
  const triggeredEvents = useRef(new Set())
  const timedEventsRegistry = useRef(new Map())
  const stageRef = useRef(gameState.stage)
  const activeChallenge = useMemo(
    () => resolveActiveChallenge(gameState),
    [gameState.locks, gameState.puzzleProgress],
  )



  const registerTimer = useCallback((handle, type = 'timeout') => {
    const record = { handle, type }
    scheduledTimers.current.push(record)
    return record
  }, [])

  const cancelTimerRecord = useCallback((record) => {
    if (!record) return
    if (record.type === 'interval') {
      clearInterval(record.handle)
    } else {
      clearTimeout(record.handle)
    }
    scheduledTimers.current = scheduledTimers.current.filter((entry) => entry !== record)
  }, [])

  const scheduleTimeout = useCallback(
    (handler, delay = 0) => {
      if (typeof handler !== 'function') return () => { }
      const record = registerTimer(
        setTimeout(() => {
          handler()
        }, delay),
      )
      return () => cancelTimerRecord(record)
    },
    [cancelTimerRecord, registerTimer],
  )

  const clearAllScheduledTimers = useCallback(() => {
    scheduledTimers.current.forEach((record) => {
      if (record.type === 'interval') {
        clearInterval(record.handle)
      } else {
        clearTimeout(record.handle)
      }
    })
    scheduledTimers.current = []
  }, [])

  const triggerEvent = useCallback(
    (key, context = {}) => {
      // Actualizar el último evento disparado para las reacciones de KIRA
      setLastTriggeredEvent(key)

      const events = narrativeScript.events || {}
      const reactions = narrativeScript.reactions || {}
      const eventConfig = events[key]

      if (eventConfig) {
        const repeatable = eventConfig.repeatable ?? false
        if (!repeatable && triggeredEvents.current.has(key)) {
          return
        }
        if (!repeatable) {
          triggeredEvents.current.add(key)
        }
        // Los eventos ahora solo actualizan el banner y el estado de KIRA
        // Los mensajes se muestran en NewsTicker
        return
      }
      // Fallback para reactions también usa el sistema de eventos
    },
    [narrativeScript.events, narrativeScript.reactions]
  )

  // Disparar evento inicial cuando se monta el juego
  useEffect(() => {
    if (gameState.stage === 'Trapped' && !triggeredEvents.current.has('game_start')) {
      const timer = setTimeout(() => {
        triggerEvent('game_start')
      }, 1000) // Pequeño delay para que se cargue la UI
      return () => clearTimeout(timer)
    }
  }, [gameState.stage, triggerEvent])

  const pulseLockAnimation = useCallback(
    (key) => {
      setUnlockAnimations((prev) => {
        const timestamp = Date.now()
        const currentLocks = prev?.locks || INITIAL_LOCK_STATE
        scheduleTimeout(() => {
          setUnlockAnimations((state) => ({
            locks: { ...(state?.locks || {}), [key]: false },
            pulse: state?.pulse || 0,
          }))
        }, 900)
        return {
          locks: { ...currentLocks, [key]: true },
          pulse: timestamp,
        }
      })
    },
    [scheduleTimeout],
  )

  const unlockSecurity = useCallback(() => {
    if (!gameState.puzzleProgress?.cipher?.solved) {
      triggerEvent('security_requires_cipher')
      playError()
      return
    }

    let unlocked = false
    setGameState((prev) => {
      if (prev.locks.security) return prev
      unlocked = true
      return {
        ...prev,
        locks: { ...prev.locks, security: true },
        puzzleProgress: {
          ...prev.puzzleProgress,
          security: { ...(prev.puzzleProgress?.security || {}), solved: true },
        },
      }
    })
    if (unlocked) {
      triggerEvent('lock_security_unlocked')
      playUnlock()
      pulseLockAnimation('security')
    }
  }, [gameState.puzzleProgress?.cipher?.solved, playError, playUnlock, pulseLockAnimation, triggerEvent])

  const connectPlate = useCallback(
    (source, target) => {
      debug.log(`🔌 [WIRING] Conectando: ${source} → ${target}`)
      setPlateConnections((prev) => {
        const next = { ...prev, [source]: target }

        // Verificar que todas las emociones estén conectadas con su igual (Color -> Color)
        const emotions = ['FURY', 'JOY', 'SADNESS', 'FEAR', 'LOVE', 'CALM', 'ENVY']
        const emotionsCorrect = emotions.every(emotion => next[emotion] === emotion)

        if (emotionsCorrect) {
          let updated = false
          setGameState((state) => {
            if (state.locks.wiring) return state
            updated = true

            // DESBLOQUEO TOTAL: Al resolver los cables, se supera todo y se abre el portfolio
            return {
              ...state,
              portfolioUnlocked: true, // Desbloquear portfolio inmediatamente
              locks: {
                ...state.locks,
                wiring: true,
                security: true,
                frequency: true
              },
              puzzleProgress: {
                ...state.puzzleProgress,
                wiring: { ...(state.puzzleProgress?.wiring || {}), solved: true },
                sound: { ...(state.puzzleProgress?.sound || {}), solved: true },
                cipher: { ...(state.puzzleProgress?.cipher || {}), solved: true },
                frequency: { ...(state.puzzleProgress?.frequency || {}), solved: true },
                security: { ...(state.puzzleProgress?.security || {}), solved: true },
              },
            }
          })

          if (updated) {
            triggerEvent('lock_wiring_unlocked')
            triggerEvent('game_complete') // Trigger victory event
            playUnlock()
            pulseLockAnimation('wiring')
          }
        }
        return next
      })
    },
    [playUnlock, pulseLockAnimation, triggerEvent]
  )

  const setSliderValue = useCallback(
    (key, value) => {
      if (!gameState.puzzleProgress?.sound?.solved) {
        triggerEvent('frequency_requires_sound')
        playError()
        return
      }
      setSliders((prev) => ({ ...prev, [key]: value }))
      playSlider()
    },
    [gameState.puzzleProgress?.sound?.solved, playError, playSlider, triggerEvent],
  )

  const completeSoundPuzzle = useCallback(() => {
    let solved = false
    debug.log('🎵 [SOUND] Intentando completar puzzle de sonido...')
    setGameState((prev) => {
      if (prev.puzzleProgress?.sound?.solved) {
        debug.log('🎵 [SOUND] Ya estaba resuelto, ignorando')
        return prev
      }
      solved = true
      debug.log('🎵 [SOUND] Marcando como resuelto!')
      return {
        ...prev,
        puzzleProgress: {
          ...prev.puzzleProgress,
          sound: { ...(prev.puzzleProgress?.sound || {}), solved: true },
        },
      }
    })
    if (solved) {
      debug.log('🎵 [SOUND] ✅ Puzzle completado exitosamente')
      playUnlock()
      triggerEvent('sound_puzzle_completed')
    }
  }, [playUnlock, triggerEvent])

  const completeCipherPuzzle = useCallback(
    (answer) => {
      let solved = false
      debug.log('🔐 [CIPHER] Intentando completar puzzle de cifrado...')
      setGameState((prev) => {
        if (prev.puzzleProgress?.cipher?.solved) {
          debug.log('🔐 [CIPHER] Ya estaba resuelto, ignorando')
          return prev
        }
        solved = true
        debug.log('🔐 [CIPHER] Marcando como resuelto!')
        return {
          ...prev,
          puzzleProgress: {
            ...prev.puzzleProgress,
            cipher: { ...(prev.puzzleProgress?.cipher || {}), solved: true },
          },
        }
      })
      if (solved) {
        debug.log('🔐 [CIPHER] ✅ Puzzle completado exitosamente')
        triggerEvent('cipher_puzzle_completed', { answer: answer || MODEL_CODE })
        playUnlock()
      }
    },
    [playUnlock, triggerEvent],
  )



  // Debug: Comando para probar manualmente el flujo
  const debugUnlockSequence = useCallback(() => {
    debug.log('🐛 [DEBUG] Estado actual:', {
      puzzleProgress: gameState.puzzleProgress,
      locks: gameState.locks
    })

    // Simular completar sound puzzle
    setTimeout(() => {
      debug.log('🐛 [DEBUG] Simulando sound puzzle completado...')
      completeSoundPuzzle()
    }, 1000)

    // Simular frequency unlock después de sound
    setTimeout(() => {
      debug.log('🐛 [DEBUG] Simulando frequency unlock...')
      setSliders({ f1: TARGETS.f1, f2: TARGETS.f2, f3: TARGETS.f3 })
    }, 3000)

    // Simular cipher después de frequency
    setTimeout(() => {
      debug.log('🐛 [DEBUG] Simulando cipher puzzle completado...')
      completeCipherPuzzle(MODEL_CODE)
    }, 5000)
  }, [gameState, completeSoundPuzzle, completeCipherPuzzle, setSliders])

  // Exponer función de debug en window para testing (solo en desarrollo)
  useEffect(() => {
    if (isDevMode()) {
      window.debugUnlockSequence = debugUnlockSequence
      window.gameState = gameState
      window.setView = (view) => {
        setGameState((prev) => ({ ...prev, activeView: view }))
      }
      debug.log('🐛 [DEBUG] Funciones debug disponibles: window.debugUnlockSequence(), window.gameState, window.setView("bento-scene")')
    }
  }, [debugUnlockSequence, gameState])

  const goToPortfolio = useCallback(() => {
    setGameState((prev) => ({
      ...prev,
      portfolioUnlocked: true,
      activeView: 'portfolio',
      introSeen: true
    }))
    setIntroVisible(false)
    setIntroStep(0)
  }, [])

  const setActiveView = useCallback((view) => {
    setGameState((prev) => {
      if (view === 'portfolio' && !prev.portfolioUnlocked) {
        return prev
      }
      // Permitir vistas: 'portfolio', 'game', 'bento-scene'
      const validViews = ['portfolio', 'game', 'bento-scene']
      const nextView = validViews.includes(view) ? view : 'game'
      if (prev.activeView === nextView) return prev
      return { ...prev, activeView: nextView }
    })
  }, [])



  const completeIntro = useCallback(() => {
    setIntroVisible(false)
    setIntroStep(0)
    setGameState((prev) => ({ ...prev, introSeen: true }))
    triggerEvent('intro_completed')
  }, [triggerEvent])

  const skipIntro = useCallback(() => {
    triggerEvent('intro_skipped')
    completeIntro()
  }, [completeIntro, triggerEvent])

  // Función de bypass directo (sin terminal)
  const triggerBypass = useCallback(() => {
    setGameState((prev) => ({
      ...prev,
      usedBypass: true,
      locks: { security: true, frequency: true, wiring: true },
      puzzleProgress: {
        ...prev.puzzleProgress,
        sound: { ...(prev.puzzleProgress?.sound || {}), solved: true },
        cipher: { ...(prev.puzzleProgress?.cipher || {}), solved: true },
        frequency: { ...(prev.puzzleProgress?.frequency || {}), solved: true },
        wiring: { ...(prev.puzzleProgress?.wiring || {}), solved: true },
        security: { ...(prev.puzzleProgress?.security || {}), solved: true },
      },
    }))
    triggerEvent('bypass')
  }, [triggerEvent])

  const advanceIntro = useCallback(() => {
    if (!narrativeScript.intro?.length) return
    setIntroStep((prev) => {
      const next = prev + 1
      if (next >= narrativeScript.intro.length) {
        completeIntro()
        return prev
      }
      return next
    })
  }, [completeIntro, narrativeScript.intro])

  const resetGame = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    triggeredEvents.current.clear()
    clearAllScheduledTimers()
    timedEventsRegistry.current.forEach((record) => {
      if (record?.timeout) {
        cancelTimerRecord(record.timeout)
      }
    })
    timedEventsRegistry.current.clear()
    setUnlockAnimations({ locks: { ...INITIAL_LOCK_STATE }, pulse: 0 })
    setNarrativeScript((prev) => ({
      ...prev,
      timers: Array.isArray(prev.timers) ? [...prev.timers] : [],
    }))
    setGameState({
      ...INITIAL_GAME_STATE,
      puzzleProgress: createInitialPuzzleProgress(),
    })
    setSliders(INITIAL_SLIDERS)
    setPlateConnections(INITIAL_PLATE)
    setPlateOpen(false)
    setIntroVisible(true)
    setIntroStep(0)
    triggerEvent('game_reset')
  }, [cancelTimerRecord, clearAllScheduledTimers, triggerEvent])




  useEffect(() => {
    savePersistedState(gameState)
  }, [gameState])

  useEffect(() => {
    let cancelled = false

    fetch(`${BASE_URL}data/kira-script.json`)
      .then((response) => response.json())
      .then((content) => {
        if (cancelled) return
        setNarrativeScript({
          intro: Array.isArray(content.intro) ? content.intro : [],
          events: content.events || {},
          reactions: content.reactions || {},
          timers: Array.isArray(content.timers) ? content.timers : [],
        })
      })
      .catch(() => {
        if (cancelled) return
        setNarrativeScript({ intro: [], events: {}, reactions: {}, timers: [] })
      })

    return () => {
      cancelled = true
    }
  }, [])

  const validateFrequency = useCallback(() => {
    debug.log('📡 [FREQUENCY] Validando frecuencias...', {
      soundSolved: gameState.puzzleProgress?.sound?.solved,
      currentSliders: sliders,
      targets: TARGETS,
      tolerances: TOLERANCE
    })

    if (!gameState.puzzleProgress?.sound?.solved) {
      debug.log('📡 [FREQUENCY] ❌ Sound puzzle no está resuelto, no se puede validar')
      return
    }

    const ok =
      Math.abs(sliders.f1 - TARGETS.f1) <= TOLERANCE &&
      Math.abs(sliders.f2 - TARGETS.f2) <= TOLERANCE &&
      Math.abs(sliders.f3 - TARGETS.f3) <= TOLERANCE

    debug.log('📡 [FREQUENCY] Resultado de validación:', {
      f1Valid: Math.abs(sliders.f1 - TARGETS.f1) <= TOLERANCE,
      f2Valid: Math.abs(sliders.f2 - TARGETS.f2) <= TOLERANCE,
      f3Valid: Math.abs(sliders.f3 - TARGETS.f3) <= TOLERANCE,
      allValid: ok,
      alreadyUnlocked: gameState.locks.frequency
    })

    if (ok && !gameState.locks.frequency) {
      let updated = false
      debug.log('📡 [FREQUENCY] Intentando desbloquear...')
      setGameState((prev) => {
        if (prev.locks.frequency) {
          debug.log('📡 [FREQUENCY] Ya estaba desbloqueado, ignorando')
          return prev
        }
        updated = true
        debug.log('📡 [FREQUENCY] Marcando como desbloqueado!')
        return {
          ...prev,
          locks: { ...prev.locks, frequency: true },
          puzzleProgress: {
            ...prev.puzzleProgress,
            frequency: { ...(prev.puzzleProgress?.frequency || {}), solved: true },
          },
        }
      })
      if (updated) {
        debug.log('📡 [FREQUENCY] ✅ Puzzle completado exitosamente')
        appendTerminal('Sistema: Frecuencia establecida. Lock FREQUENCY desbloqueada.')
        triggerEvent('lock_frequency_unlocked')
        playUnlock()
        pulseLockAnimation('frequency')
      }
    }
  }, [gameState.locks.frequency, gameState.puzzleProgress?.sound?.solved, pulseLockAnimation, sliders, triggerEvent, playUnlock])

  useEffect(() => {
    const locks = gameState.locks
    const all = Object.values(locks).every(Boolean)
    const some = Object.values(locks).some(Boolean)
    const newStage = all ? 'Free' : some ? 'Partial' : 'Trapped'

    if (newStage !== gameState.stage) {
      const shouldShowTwist = newStage === 'Free' && !gameState.twistShown
      setGameState((prev) => {
        const unlocked = prev.portfolioUnlocked || newStage === 'Free'
        // NO cambiar la vista inmediatamente cuando se libera
        const nextView = prev.activeView
        return {
          ...prev,
          stage: newStage,
          twistShown: prev.twistShown || newStage === 'Free',
          portfolioUnlocked: unlocked,
          activeView: nextView,
        }
      })

      // Disparar evento cuando se completa el juego
      if (newStage === 'Free') {
        triggerEvent('game_complete')
      }
      if (newStage === 'Partial') {
        const unlocked = Object.values(locks).filter(Boolean).length
        const plural = unlocked === 1 ? '' : 's'
        triggerEvent('stage_partial', { unlocked, plural })
      }
      if (shouldShowTwist) {
        triggerEvent('victory', { stage: newStage })

        // Transición al portfolio después de mostrar la secuencia de liberación
        scheduleTimeout(() => {
          setGameState((prev) => ({
            ...prev,
            activeView: 'portfolio'
          }))
        }, 5000) // Esperar 5 segundos para que se vean los mensajes
      }
    }
  }, [gameState.locks, gameState.stage, gameState.twistShown, triggerEvent, scheduleTimeout])



  useEffect(() => {
    stageRef.current = gameState.stage
  }, [gameState.stage])

  useEffect(() => {
    const timers = Array.isArray(narrativeScript.timers) ? narrativeScript.timers : []

    if (!timers.length) {
      timedEventsRegistry.current.forEach((record) => {
        if (record?.timeout) {
          cancelTimerRecord(record.timeout)
        }
      })
      timedEventsRegistry.current.clear()
      return
    }

    const startTimer = (timer, id) => {
      const record = timedEventsRegistry.current.get(id)
      const currentStage = stageRef.current
      const stageMatches = !timer.stage || timer.stage === currentStage

      if (!stageMatches) {
        if (record?.timeout) {
          cancelTimerRecord(record.timeout)
        }
        const baseDelay = Math.max(0, timer.delay ?? 0)
        timedEventsRegistry.current.set(id, {
          status:
            record?.status === 'completed' && !(timer.repeatable ?? false)
              ? 'completed'
              : 'pending',
          nextDelay: record?.nextDelay ?? baseDelay,
        })
        return
      }

      if (record?.status === 'running') return
      if (record?.status === 'completed' && !(timer.repeatable ?? false)) return

      const baseDelay = Math.max(0, timer.delay ?? 0)
      const wait = record?.nextDelay ?? baseDelay
      const repeatable = timer.repeatable ?? false
      const rawRepeatDelay =
        timer.interval != null ? Math.max(0, timer.interval) : baseDelay
      const fallbackDelay = baseDelay > 0 ? baseDelay : 1000
      const repeatDelay = repeatable
        ? rawRepeatDelay > 0
          ? rawRepeatDelay
          : fallbackDelay
        : rawRepeatDelay
      const context = timer.context || {}

      const timeoutRecord = registerTimer(
        setTimeout(() => {
          triggerEvent(timer.event, context)
          if (repeatable) {
            timedEventsRegistry.current.set(id, {
              status: 'pending',
              nextDelay: repeatDelay || fallbackDelay,
            })
            startTimer(timer, id)
          } else {
            timedEventsRegistry.current.set(id, { status: 'completed' })
          }
        }, wait),
        'timeout',
      )

      timedEventsRegistry.current.set(id, {
        status: 'running',
        timeout: timeoutRecord,
        nextDelay: repeatDelay || fallbackDelay,
      })
    }

    const activeIds = new Set()

    timers.forEach((timer, index) => {
      const id = timer.id || `timer_${index}`
      activeIds.add(id)

      if (!timer.event) return

      const stageMatches = !timer.stage || timer.stage === gameState.stage
      const record = timedEventsRegistry.current.get(id)

      if (!stageMatches) {
        if (record?.timeout) {
          cancelTimerRecord(record.timeout)
        }
        const baseDelay = Math.max(0, timer.delay ?? 0)
        timedEventsRegistry.current.set(id, {
          status:
            record?.status === 'completed' && !(timer.repeatable ?? false)
              ? 'completed'
              : 'pending',
          nextDelay: record?.nextDelay ?? baseDelay,
        })
        return
      }

      startTimer(timer, id)
    })

    timedEventsRegistry.current.forEach((record, id) => {
      if (!activeIds.has(id)) {
        if (record?.timeout) {
          cancelTimerRecord(record.timeout)
        }
        timedEventsRegistry.current.delete(id)
      }
    })

    return () => {
      activeIds.forEach((id) => {
        const record = timedEventsRegistry.current.get(id)
        if (record?.timeout) {
          cancelTimerRecord(record.timeout)
        }
        timedEventsRegistry.current.delete(id)
      })
    }
  }, [cancelTimerRecord, gameState.stage, narrativeScript.timers, registerTimer, triggerEvent])

  useEffect(() => {
    return () => {
      clearAllScheduledTimers()
      timedEventsRegistry.current.clear()
    }
  }, [clearAllScheduledTimers])

  useEffect(() => {
    if (!introVisible) return
    if (!narrativeScript.intro?.length) return

    // Don't auto-advance if we only have one intro message (simplified modal)
    if (narrativeScript.intro.length === 1) return

    const timeout = setTimeout(() => {
      advanceIntro()
    }, narrativeScript.intro[introStep]?.duration ?? 2600)

    return () => clearTimeout(timeout)
  }, [advanceIntro, introStep, introVisible, narrativeScript.intro])

  const introLine = useMemo(() => narrativeScript.intro?.[introStep] ?? null, [introStep, narrativeScript.intro])

  const value = useMemo(
    () => ({
      gameState,
      sliders,
      setSliderValue,
      validateFrequency,
      plateConnections,
      connectPlate,
      plateOpen,
      setPlateOpen,

      setActiveView,

      goToPortfolio,
      resetGame,
      introVisible,
      introLine,
      advanceIntro,
      skipIntro,
      narrativeScript,
      triggerEvent,
      triggerBypass,
      completeSoundPuzzle,
      completeCipherPuzzle,
      playTone,
      scheduleTimeout,
      unlockAnimations,
      activeChallenge,
      lastTriggeredEvent,
      kiraSpeaking,
      setKiraSpeaking,
      activeCableEmotion,
      setActiveCableEmotion,
      MODEL,
    }),
    [
      gameState,
      sliders,
      setSliderValue,
      validateFrequency,
      plateConnections,
      connectPlate,
      plateOpen,
      setPlateOpen,

      setActiveView,

      goToPortfolio,
      resetGame,
      introVisible,
      introLine,
      advanceIntro,
      skipIntro,
      narrativeScript,
      triggerEvent,
      triggerBypass,
      completeSoundPuzzle,
      completeCipherPuzzle,
      playTone,
      scheduleTimeout,
      unlockAnimations,
      activeChallenge,
      setKiraSpeaking,
      puzzleStarted,
      setPuzzleStarted,
      activeCableEmotion,
      setActiveCableEmotion,
    ],
  )

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>
}

export function useGame() {
  const context = useContext(GameContext)
  if (!context) {
    throw new Error('useGame must be used within a GameProvider')
  }
  return context
}
