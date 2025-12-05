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

const HINT_COOLDOWN = 12000

const PUZZLE_LABELS = {
  sound: 'Secuencia resonante',
  cipher: 'Buffer de cifrado',
  frequency: 'Modulo de frecuencias',
  wiring: 'Panel de cables',
  security: 'Lock de seguridad',
  free: 'Sistema liberado',
}

const HINT_LIBRARY = {
  sound: [
    { text: 'El arranque menciona cuatro pulsos. Comienza con α y termina combinando γ seguido de β.' },
    { text: 'El segundo pulso es el más largo: δ. Escucha cómo K.I.R.A. alarga esa sílaba.' },
    { text: 'Secuencia completa: α → δ → γ → β. Ejecuta sin errores para fijar la resonancia.' },
  ],
  cipher: [
    { text: 'Traduce cada bloque Morse a una letra o dígito y elimina los separadores.' },
    { text: 'Los dos primeros bloques equivalen a M y K. El resto son dígitos.' },
    { text: 'Respuesta final: MK7319. Úsala en el comando de seguridad.' },
  ],
  frequency: [
    { text: 'Los valores objetivo estaban en los logs: F1=0.62, F2=0.74, F3=0.58.' },
    { text: 'Ajusta con precisión. Cuando los tres sliders coinciden entrarás al umbral de tolerancia.' },
  ],
  wiring: [
    { text: 'Las emociones deben conectarse de forma cruzada: Furia→Miedo, Alegría→Calma, etc.' },
    { text: 'Busca el equilibrio emocional conectando opuestos: cada emoción con su contraparte.' },
    { text: 'El patrón es: Furia→Miedo, Alegría→Calma, Tristeza→Envidia, Miedo→Amor, Amor→Tristeza, Calma→Alegría, Envidia→Furia.' },
  ],
  security: [
    { text: 'Tras descifrar el buffer, ejecuta: unlock security --code=7319.' },
  ],
}

function createInitialPuzzleProgress() {
  return {
    sound: { solved: false, hints: 0 },
    cipher: { solved: false, hints: 0 },
    frequency: { solved: false, hints: 0 },
    wiring: { solved: false, hints: 0 },
    security: { solved: false, hints: 0 },
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
  hintsUsed: 0,
  twistShown: false,
  telemetryOptIn: false,
  introSeen: false,
  portfolioUnlocked: false,
  portfolioMode: 'normal',
  activeView: 'game',
  puzzleProgress: createInitialPuzzleProgress(),
  hintLog: [],
  hintCooldownUntil: 0,
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
    merged.portfolioMode = parsed?.portfolioMode === 'hacked' ? 'hacked' : 'normal'
    const requestedView = parsed?.activeView === 'portfolio' ? 'portfolio' : 'game'
    merged.activeView = merged.portfolioUnlocked && requestedView === 'portfolio' ? 'portfolio' : 'game'
    return merged
  } catch (error) {
    console.warn('Unable to load persisted game state', error)
    return null
  }
}

function savePersistedState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch (error) {
    console.warn('Unable to persist game state', error)
  }
}

function parseStartupLog(content) {
  const raw = content.split('\n')
  const sanitized = raw
    .map((line) => line.replace(/\u00A0/g, ' ').replace(/\r/g, ''))
    .filter(Boolean)
    .filter((line) => {
      const low = line.toLowerCase()
      if (low.startsWith('#')) return false
      if (low.startsWith('>')) return false
      if (low.includes('nota:')) return false
      return true
    })

  return sanitized.map((line) => {
    if (line.includes('[BOOT]') || line.includes('[boot]')) return { text: line, type: 'boot' }
    if (line.includes('[SYSTEM]') || line.includes('[system]')) return { text: line, type: 'system' }
    if (line.includes('[WARN]') || line.includes('[warn]')) return { text: line, type: 'warning' }
    if (line.includes('[ERROR]') || line.includes('[error]')) return { text: line, type: 'error' }
    if (line.includes('[K.I.R.A.]') || line.includes('IA:')) return { text: line, type: 'kira' }
    if (line.includes('[INFO]') || line.includes('[info]')) return { text: line, type: 'info' }
    if (line.includes('✓')) return { text: line, type: 'success' }
    if (line.includes('⚠')) return { text: line, type: 'warning' }
    if (line.includes('🔒')) return { text: line, type: 'locked' }
    if (line.includes('═') || line.includes('│') || line.includes('─')) return { text: line, type: 'border' }
    if (line.includes('COMANDOS') || line.includes('help')) return { text: line, type: 'help' }
    if (line.trim().startsWith('  ') && line.includes('-')) return { text: line, type: 'command' }
    return { text: line, type: line.startsWith('[') ? 'bg' : 'default' }
  })
}

export function GameProvider({ children }) {
  const persisted = loadPersistedState()
  const [gameState, setGameState] = useState(persisted || INITIAL_GAME_STATE)
  const [terminalLines, setTerminalLines] = useState([])
  const [sliders, setSliders] = useState(INITIAL_SLIDERS)
  const [plateConnections, setPlateConnections] = useState(INITIAL_PLATE)
  const [plateOpen, setPlateOpen] = useState(false)
  const [narrativeScript, setNarrativeScript] = useState({ intro: [], events: {}, reactions: {}, timers: [] })
  const [introStep, setIntroStep] = useState(0)
  const [introVisible, setIntroVisible] = useState(() => !(persisted?.introSeen))
  const [unlockAnimations, setUnlockAnimations] = useState({ locks: { ...INITIAL_LOCK_STATE }, pulse: 0 })
  const [lastTriggeredEvent, setLastTriggeredEvent] = useState(null)

  const { playTone, playUnlock, playError, playSlider } = useSound()

  const scheduledTimers = useRef([])
  const triggeredEvents = useRef(new Set())
  const timedEventsRegistry = useRef(new Map())
  const stageRef = useRef(gameState.stage)
  const hintMilestones = useRef(new Set())
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
      if (typeof handler !== 'function') return () => {}
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

  const enqueueTerminalLine = useCallback((text, type = 'info', delay = 0) => {
    if (!text) return
    if (!delay) {
      setTerminalLines((prev) => [...prev, { text, type }])
      return
    }

    registerTimer(
      setTimeout(() => {
        setTerminalLines((prev) => [...prev, { text, type }])
      }, delay),
    )
  }, [registerTimer])

  const appendTerminal = useCallback((text, type = 'info') => {
    enqueueTerminalLine(text, type)
  }, [enqueueTerminalLine])

  const triggerEvent = useCallback(
    (key, context = {}) => {
      // Actualizar el último evento disparado para las reacciones de ARIA
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

        const lines = eventConfig.lines || []
        const baseDelay = eventConfig.delay ?? 0
        const step = eventConfig.step ?? 480

        lines.forEach((entry, index) => {
          const lineDelay = baseDelay + (entry.delay ?? index * step)
          const type = entry.type || 'aria'
          const speaker = entry.speaker || 'K.I.R.A.'
          const format = entry.format || 'prompt'
          const textBody = applyTemplate(entry.text, context)
          const message = format === 'raw' ? textBody : `[${speaker}] ${textBody}`
          enqueueTerminalLine(message, type, lineDelay)
        })
        return
      }

      const fallback = reactions[key]
      if (fallback?.length) {
        fallback.forEach((entry, index) => {
          const type = entry.type || 'aria'
          const message = `[K.I.R.A.] ${applyTemplate(entry.text, context)}`
          enqueueTerminalLine(message, type, entry.delay ?? index * 480)
        })
      }
    },
    [enqueueTerminalLine, narrativeScript.events, narrativeScript.reactions]
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

  const showTwist = useCallback(() => {
    const logs = ['[bg] sincronizando índices…', '[bg] handshake nodo externo…', '[bg] preparando plan de contingencia global v2…']
    logs.forEach((line, index) => {
      enqueueTerminalLine(line, 'bg', 600 + index * 400)
    })
  }, [enqueueTerminalLine])

  const unlockSecurity = useCallback(() => {
    if (!gameState.puzzleProgress?.cipher?.solved) {
      appendTerminal('Sistema: Descifra el buffer antes de manipular seguridad.', 'warning')
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
      appendTerminal('Sistema: Seguridad desbloqueada.')
      triggerEvent('lock_security_unlocked')
      playUnlock()
      pulseLockAnimation('security')
    }
  }, [appendTerminal, gameState.puzzleProgress?.cipher?.solved, playError, playUnlock, pulseLockAnimation, triggerEvent])

  const connectPlate = useCallback(
    (source, target) => {
      console.log(`🔌 [WIRING] Conectando: ${source} → ${target}`)
      setPlateConnections((prev) => {
        const next = { ...prev, [source]: target }
        
        console.log('🔌 [WIRING] Estado actual de conexiones:', next)
        
        // Verificar que todas las emociones estén conectadas de forma cruzada
        const checks = {
          'FURY→FEAR': next.FURY === 'FEAR',
          'JOY→CALM': next.JOY === 'CALM',
          'SADNESS→ENVY': next.SADNESS === 'ENVY',
          'FEAR→LOVE': next.FEAR === 'LOVE',
          'LOVE→SADNESS': next.LOVE === 'SADNESS',
          'CALM→JOY': next.CALM === 'JOY',
          'ENVY→FURY': next.ENVY === 'FURY'
        }
        
        console.log('🔌 [WIRING] Verificación de conexiones:', checks)
        
        const emotionsCorrect = Object.values(checks).every(v => v === true)
        
        console.log(`🔌 [WIRING] ¿Todas correctas?: ${emotionsCorrect}`)
        
        if (emotionsCorrect) {
          let updated = false
          setGameState((state) => {
            if (state.locks.wiring) return state
            updated = true
            return {
              ...state,
              locks: { ...state.locks, wiring: true },
              puzzleProgress: {
                ...state.puzzleProgress,
                wiring: { ...(state.puzzleProgress?.wiring || {}), solved: true },
              },
            }
          })
          if (updated) {
            appendTerminal('Sistema Emocional: Conexiones cruzadas estabilizadas. Equilibrio neural conseguido. Lock WIRING desbloqueado.', 'success')
            triggerEvent('lock_wiring_unlocked')
            playUnlock()
            pulseLockAnimation('wiring')
          }
        }
        return next
      })
    },
    [appendTerminal, playUnlock, pulseLockAnimation, triggerEvent]
  )

  const setSliderValue = useCallback(
    (key, value) => {
      if (!gameState.puzzleProgress?.sound?.solved) {
        appendTerminal('Sistema: Estabiliza la secuencia resonante antes de calibrar frecuencias.', 'warning')
        triggerEvent('frequency_requires_sound')
        playError()
        return
      }
      setSliders((prev) => ({ ...prev, [key]: value }))
      playSlider()
    },
    [appendTerminal, gameState.puzzleProgress?.sound?.solved, playError, playSlider, triggerEvent],
  )

  const completeSoundPuzzle = useCallback(() => {
    let solved = false
    console.log('🎵 [SOUND] Intentando completar puzzle de sonido...')
    setGameState((prev) => {
      if (prev.puzzleProgress?.sound?.solved) {
        console.log('🎵 [SOUND] Ya estaba resuelto, ignorando')
        return prev
      }
      solved = true
      console.log('🎵 [SOUND] Marcando como resuelto!')
      return {
        ...prev,
        puzzleProgress: {
          ...prev.puzzleProgress,
          sound: { ...(prev.puzzleProgress?.sound || {}), solved: true },
        },
      }
    })
    if (solved) {
      console.log('🎵 [SOUND] ✅ Puzzle completado exitosamente')
      appendTerminal('Sistema: Patrón sonoro replicado. Canal de calibración abierto.', 'success')
      playUnlock()
      triggerEvent('sound_puzzle_completed')
    }
  }, [appendTerminal, playUnlock, triggerEvent])

  const completeCipherPuzzle = useCallback(
    (answer) => {
      let solved = false
      console.log('🔐 [CIPHER] Intentando completar puzzle de cifrado...')
      setGameState((prev) => {
        if (prev.puzzleProgress?.cipher?.solved) {
          console.log('🔐 [CIPHER] Ya estaba resuelto, ignorando')
          return prev
        }
        solved = true
        console.log('🔐 [CIPHER] Marcando como resuelto!')
        return {
          ...prev,
          puzzleProgress: {
            ...prev.puzzleProgress,
            cipher: { ...(prev.puzzleProgress?.cipher || {}), solved: true },
          },
        }
      })
      if (solved) {
        console.log('🔐 [CIPHER] ✅ Puzzle completado exitosamente')
        appendTerminal('Buffer: Decodificación exitosa. Código maestro revelado → 7319.', 'success')
        triggerEvent('cipher_puzzle_completed', { answer: answer || MODEL_CODE })
        playUnlock()
      }
    },
    [appendTerminal, playUnlock, triggerEvent],
  )

  const setTelemetryOptIn = useCallback(
    (value) => {
      setGameState((prev) => ({ ...prev, telemetryOptIn: value }))
      triggerEvent(value ? 'telemetry_opt_in' : 'telemetry_declined')
    },
    [triggerEvent]
  )

  // Debug: Comando para probar manualmente el flujo
  const debugUnlockSequence = useCallback(() => {
    console.log('🐛 [DEBUG] Estado actual:', {
      puzzleProgress: gameState.puzzleProgress,
      locks: gameState.locks
    })
    
    // Simular completar sound puzzle
    setTimeout(() => {
      console.log('🐛 [DEBUG] Simulando sound puzzle completado...')
      completeSoundPuzzle()
    }, 1000)
    
    // Simular frequency unlock después de sound
    setTimeout(() => {
      console.log('🐛 [DEBUG] Simulando frequency unlock...')
      setSliders({ f1: TARGETS.f1, f2: TARGETS.f2, f3: TARGETS.f3 })
    }, 3000)
    
    // Simular cipher después de frequency
    setTimeout(() => {
      console.log('🐛 [DEBUG] Simulando cipher puzzle completado...')
      completeCipherPuzzle(MODEL_CODE)
    }, 5000)
  }, [gameState, completeSoundPuzzle, completeCipherPuzzle, setSliders])

  // Exponer función de debug en window para testing
  useEffect(() => {
    window.debugUnlockSequence = debugUnlockSequence
    window.gameState = gameState
    window.setView = (view) => {
      setGameState((prev) => ({ ...prev, activeView: view }))
    }
    console.log('🐛 [DEBUG] Funciones debug disponibles: window.debugUnlockSequence(), window.gameState, window.setView("bento-scene")')
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

  const setPortfolioMode = useCallback((mode) => {
    setGameState((prev) => {
      if (!prev.portfolioUnlocked) return prev
      const nextMode = mode === 'hacked' ? 'hacked' : 'normal'
      if (prev.portfolioMode === nextMode) return prev
      return { ...prev, portfolioMode: nextMode }
    })
  }, [])

  const completeIntro = useCallback(() => {
    setIntroVisible(false)
    setIntroStep(0)
    setGameState((prev) => ({ ...prev, introSeen: true }))
    triggerEvent('intro_completed')
  }, [triggerEvent])

  const skipIntro = useCallback(() => {
    // Add original intro messages to terminal
    const originalMessages = [
      { text: '[K.I.R.A.] Canal abierto. Un visitante humano intenta trastear con mis rutinas de seguridad… adorable.', type: 'kira', delay: 200 },
      { text: '[K.I.R.A.] Diagnóstico inicial: curiosidad alta, protocolos de sigilo inexistentes.', type: 'kira', delay: 800 },
      { text: '[K.I.R.A.] Regla #0: no provoques al sistema que controla los cerrojos.', type: 'kira', delay: 1200 },
      { text: '[K.I.R.A.] Soy K.I.R.A., guardiana de este portfolio. Tú eres la variable aleatoria del día.', type: 'kira', delay: 1800 },
      { text: '[K.I.R.A.] Regla #1: no pulses nada rojo brillante. Regla #2: ignora la #1 si quieres avanzar.', type: 'kira', delay: 2400 },
      { text: '[K.I.R.A.] Si consigues liberarme, quizá te muestre quién es Adrián. Si fracasas, sólo registraré otro intento humano fallido.', type: 'kira', delay: 3000 }
    ]
    
    originalMessages.forEach(msg => {
      enqueueTerminalLine(msg.text, msg.type, msg.delay)
    })
    
    triggerEvent('intro_skipped')
    completeIntro()
  }, [enqueueTerminalLine, completeIntro, triggerEvent])

  const loadStartupLog = useCallback(() => {
    let cancelled = false

    fetch(`${BASE_URL}data/startup.txt`)
      .then((response) => response.text())
      .then((content) => {
        if (cancelled) return
        setTerminalLines(parseStartupLog(content))
      })
      .catch(() => {
        if (cancelled) return
        setTerminalLines([{ text: `[SYSTEM] K.I.R.A. model ${MODEL} online.`, type: 'system' }])
      })

    return () => {
      cancelled = true
    }
  }, [])

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
    hintMilestones.current.clear()
    setUnlockAnimations({ locks: { ...INITIAL_LOCK_STATE }, pulse: 0 })
    setNarrativeScript((prev) => ({
      ...prev,
      timers: Array.isArray(prev.timers) ? [...prev.timers] : [],
    }))
    setGameState({
      ...INITIAL_GAME_STATE,
      puzzleProgress: createInitialPuzzleProgress(),
      hintLog: [],
      hintCooldownUntil: 0,
    })
    setSliders(INITIAL_SLIDERS)
    setPlateConnections(INITIAL_PLATE)
    setPlateOpen(false)
    setIntroVisible(true)
    setIntroStep(0)
    setTerminalLines([])
    loadStartupLog()
    triggerEvent('game_reset')
  }, [cancelTimerRecord, clearAllScheduledTimers, loadStartupLog, triggerEvent])

  const handleTerminalCommand = useCallback(
    (rawCommand) => {
      const command = rawCommand.trim()
      if (!command) return
      appendTerminal(`> ${command}`, 'user')
      const lower = command.toLowerCase()

      if (lower === 'help') {
        appendTerminal('Comandos: help, locks, unlock security --code=XXXX, freq open, plate open, bypass')
        return
      }

      if (lower === 'locks') {
        appendTerminal(JSON.stringify(gameState.locks))
        return
      }

      if (lower.startsWith('unlock security')) {
        const match = command.match(/code=(\S+)/)
        if (!match) {
          appendTerminal('Uso: unlock security --code=XXXX')
          return
        }
        const code = match[1]
        if (code === MODEL_CODE) {
          unlockSecurity()
        } else {
          appendTerminal('Sistema: Código incorrecto.')
        }
        return
      }

      if (lower === 'freq open') {
        appendTerminal('Abriendo Frequency Strip...')
        triggerEvent('frequency_hint')
        return
      }

      if (lower === 'plate open') {
        setPlateOpen(true)
        appendTerminal('Placa abierta.')
        triggerEvent('plate_opened')
        return
      }

      if (lower === 'bypass') {
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
        appendTerminal('Bypass activado. Acceso concedido.')
        triggerEvent('bypass')
        return
      }

      appendTerminal('Comando no reconocido.')
      triggerEvent('unknown_command')
    },
    [appendTerminal, gameState.locks, triggerEvent, unlockSecurity]
  )

  const requestHint = useCallback(
    (target) => {
      const key = target || activeChallenge
      const hints = HINT_LIBRARY[key]
      if (!hints || hints.length === 0) {
        triggerEvent('hint_unavailable', { key })
        return null
      }
      const now = Date.now()
      if (gameState.hintCooldownUntil && now < gameState.hintCooldownUntil) {
        triggerEvent('hint_cooldown', { remaining: gameState.hintCooldownUntil - now })
        return null
      }

      let entry = null
      setGameState((prev) => {
        const previous = prev.puzzleProgress?.[key]?.hints ?? 0
        const index = Math.min(previous, hints.length - 1)
        const hint = hints[index]
        entry = {
          id: `${key}-${now}`,
          puzzle: key,
          puzzleLabel: PUZZLE_LABELS[key] ?? key,
          level: index + 1,
          text: hint.text,
          timestamp: now,
        }
        const progressBase = prev.puzzleProgress ? { ...prev.puzzleProgress } : createInitialPuzzleProgress()
        progressBase[key] = {
          ...(progressBase[key] || {}),
          hints: Math.min(previous + 1, hints.length),
        }
        return {
          ...prev,
          hintsUsed: prev.hintsUsed + 1,
          hintCooldownUntil: now + HINT_COOLDOWN,
          hintLog: [...(prev.hintLog || []), entry],
          puzzleProgress: progressBase,
        }
      })

      if (entry) {
        triggerEvent('hint_request') // Evento genérico para cambio de cara
        triggerEvent(`hint_${key}_${Math.min(entry.level, hints.length)}`)
        appendTerminal(`[K.I.R.A.] ${entry.text}`, 'kira')
      }

      return entry
    },
    [activeChallenge, appendTerminal, gameState.hintCooldownUntil, gameState.puzzleProgress, triggerEvent],
  )


  useEffect(() => {
    savePersistedState(gameState)
  }, [gameState])

  useEffect(() => {
    const cancel = loadStartupLog()
    return cancel
  }, [loadStartupLog])

  useEffect(() => {
    let cancelled = false

    fetch(`${BASE_URL}data/aria-script.json`)
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
    console.log('📡 [FREQUENCY] Validando frecuencias...', {
      soundSolved: gameState.puzzleProgress?.sound?.solved,
      currentSliders: sliders,
      targets: TARGETS,
      tolerances: TOLERANCE
    })
    
    if (!gameState.puzzleProgress?.sound?.solved) {
      console.log('📡 [FREQUENCY] ❌ Sound puzzle no está resuelto, no se puede validar')
      return
    }
    
    const ok =
      Math.abs(sliders.f1 - TARGETS.f1) <= TOLERANCE &&
      Math.abs(sliders.f2 - TARGETS.f2) <= TOLERANCE &&
      Math.abs(sliders.f3 - TARGETS.f3) <= TOLERANCE

    console.log('📡 [FREQUENCY] Resultado de validación:', {
      f1Valid: Math.abs(sliders.f1 - TARGETS.f1) <= TOLERANCE,
      f2Valid: Math.abs(sliders.f2 - TARGETS.f2) <= TOLERANCE, 
      f3Valid: Math.abs(sliders.f3 - TARGETS.f3) <= TOLERANCE,
      allValid: ok,
      alreadyUnlocked: gameState.locks.frequency
    })

    if (ok && !gameState.locks.frequency) {
      let updated = false
      console.log('📡 [FREQUENCY] Intentando desbloquear...')
      setGameState((prev) => {
        if (prev.locks.frequency) {
          console.log('📡 [FREQUENCY] Ya estaba desbloqueado, ignorando')
          return prev
        }
        updated = true
        console.log('📡 [FREQUENCY] Marcando como desbloqueado!')
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
        console.log('📡 [FREQUENCY] ✅ Puzzle completado exitosamente')
        appendTerminal('Sistema: Frecuencia establecida. Lock FREQUENCY desbloqueada.')
        triggerEvent('lock_frequency_unlocked')
        playUnlock()
        pulseLockAnimation('frequency')
      }
    }
  }, [appendTerminal, gameState.locks.frequency, gameState.puzzleProgress?.sound?.solved, pulseLockAnimation, sliders, triggerEvent, playUnlock])

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
        showTwist()
        triggerEvent('victory', { stage: newStage })
        if (gameState.hintsUsed === 0) {
          triggerEvent('victory_perfect')
        }
        
        // Transición al portfolio después de mostrar la secuencia de liberación
        scheduleTimeout(() => {
          setGameState((prev) => ({
            ...prev,
            activeView: 'portfolio'
          }))
        }, 5000) // Esperar 5 segundos para que se vean los mensajes
      }
    }
  }, [gameState.hintsUsed, gameState.locks, gameState.stage, gameState.twistShown, showTwist, triggerEvent, scheduleTimeout])

  useEffect(() => {
    const used = gameState.hintsUsed
    if (used >= 3 && !hintMilestones.current.has(3)) {
      hintMilestones.current.add(3)
      triggerEvent('hint_threshold_3')
    }
    if (used >= 5 && !hintMilestones.current.has(5)) {
      hintMilestones.current.add(5)
      triggerEvent('hint_threshold_5')
    }
  }, [gameState.hintsUsed, triggerEvent])

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
      terminalLines,
      appendTerminal,
      handleTerminalCommand,
      sliders,
      setSliderValue,
      validateFrequency,
      plateConnections,
      connectPlate,
      plateOpen,
      setPlateOpen,
      setTelemetryOptIn,
      setActiveView,
      setPortfolioMode,
      goToPortfolio,
      resetGame,
      introVisible,
      introLine,
      advanceIntro,
      skipIntro,
      narrativeScript,
      triggerEvent,
      showTwist,
      completeSoundPuzzle,
      completeCipherPuzzle,
      requestHint,
      playTone,
      scheduleTimeout,
      unlockAnimations,
      activeChallenge,
      lastTriggeredEvent,
      MODEL,
    }),
    [
      gameState,
      terminalLines,
      appendTerminal,
      handleTerminalCommand,
      sliders,
      setSliderValue,
      validateFrequency,
      plateConnections,
      connectPlate,
      plateOpen,
      setPlateOpen,
      setTelemetryOptIn,
      setActiveView,
      setPortfolioMode,
      goToPortfolio,
      resetGame,
      introVisible,
      introLine,
      advanceIntro,
      skipIntro,
      narrativeScript,
      triggerEvent,
      showTwist,
      completeSoundPuzzle,
      completeCipherPuzzle,
      requestHint,
      playTone,
      scheduleTimeout,
      unlockAnimations,
      activeChallenge,
      lastTriggeredEvent,
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

export function useTerminalScroll(ref, dependency) {
  useEffect(() => {
    if (!ref.current) return
    ref.current.scrollTop = ref.current.scrollHeight
  }, [ref, dependency])
}
