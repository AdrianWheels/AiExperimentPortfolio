import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

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

const INITIAL_GAME_STATE = {
  stage: 'Trapped',
  locks: INITIAL_LOCK_STATE,
  usedBypass: false,
  hintsUsed: 0,
  twistShown: false,
  telemetryOptIn: false,
  introSeen: false,
}

const INITIAL_SLIDERS = { f1: 0.5, f2: 0.5, f3: 0.5 }
const INITIAL_PLATE = { R: null, A: null, Y: null }

const GameContext = createContext(null)

function loadPersistedState() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return null
    const parsed = JSON.parse(stored)
    return {
      ...INITIAL_GAME_STATE,
      ...parsed,
      locks: { ...INITIAL_LOCK_STATE, ...(parsed?.locks || {}) },
    }
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
    if (line.includes('[A.R.I.A.]') || line.includes('IA:')) return { text: line, type: 'aria' }
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
  const [narrativeScript, setNarrativeScript] = useState({ intro: [], reactions: {} })
  const [introStep, setIntroStep] = useState(0)
  const [introVisible, setIntroVisible] = useState(() => !(persisted?.introSeen))

  const twistTimeouts = useRef([])

  const appendTerminal = useCallback((text, type = 'info') => {
    setTerminalLines((prev) => [...prev, { text, type }])
  }, [])

  const queueReaction = useCallback(
    (key) => {
      const reactions = narrativeScript.reactions || {}
      const entries = reactions[key]
      if (!entries || !entries.length) return
      entries.forEach((entry) => {
        appendTerminal(`[A.R.I.A.] ${entry.text}`, entry.type || 'aria')
      })
    },
    [appendTerminal, narrativeScript.reactions]
  )

  const showTwist = useCallback(() => {
    const logs = ['[bg] sincronizando índices…', '[bg] handshake nodo externo…', '[bg] preparando plan de contingencia global v2…']
    logs.forEach((line, index) => {
      const timeout = setTimeout(() => {
        appendTerminal(line)
      }, 600 + index * 400)
      twistTimeouts.current.push(timeout)
    })
  }, [appendTerminal])

  const unlockSecurity = useCallback(() => {
    let unlocked = false
    setGameState((prev) => {
      if (prev.locks.security) return prev
      unlocked = true
      return { ...prev, locks: { ...prev.locks, security: true } }
    })
    if (unlocked) {
      appendTerminal('Sistema: Seguridad desbloqueada.')
    }
  }, [appendTerminal])

  const connectPlate = useCallback(
    (source, target) => {
      setPlateConnections((prev) => {
        const next = { ...prev, [source]: target }
        const ok = next.R === 'R' && next.A === 'A' && next.Y === 'Y'
        if (ok) {
          let updated = false
          setGameState((state) => {
            if (state.locks.wiring) return state
            updated = true
            return { ...state, locks: { ...state.locks, wiring: true } }
          })
          if (updated) {
            appendTerminal('Placa: Wiring correcto. Lock WIRING desbloqueado.', 'success')
            queueReaction('wiring')
          }
        }
        return next
      })
    },
    [appendTerminal, queueReaction]
  )

  const setSliderValue = useCallback((key, value) => {
    setSliders((prev) => ({ ...prev, [key]: value }))
  }, [])

  const setTelemetryOptIn = useCallback((value) => {
    setGameState((prev) => ({ ...prev, telemetryOptIn: value }))
  }, [])

  const completeIntro = useCallback(() => {
    setIntroVisible(false)
    setIntroStep(0)
    setGameState((prev) => ({ ...prev, introSeen: true }))
  }, [])

  const skipIntro = useCallback(() => {
    appendTerminal('[A.R.I.A.] ¿Tan impaciente? Muy bien, te ahorraré la exposición.', 'aria')
    completeIntro()
  }, [appendTerminal, completeIntro])

  const loadStartupLog = useCallback(() => {
    let cancelled = false

    fetch('/data/startup.txt')
      .then((response) => response.text())
      .then((content) => {
        if (cancelled) return
        setTerminalLines(parseStartupLog(content))
      })
      .catch(() => {
        if (cancelled) return
        setTerminalLines([{ text: `[SYSTEM] A.R.I.A. model ${MODEL} online.`, type: 'system' }])
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
    setGameState(INITIAL_GAME_STATE)
    setSliders(INITIAL_SLIDERS)
    setPlateConnections(INITIAL_PLATE)
    setPlateOpen(false)
    setIntroVisible(true)
    setIntroStep(0)
    setTerminalLines([])
    loadStartupLog()
  }, [loadStartupLog])

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
        queueReaction('frequency_hint')
        return
      }

      if (lower === 'plate open') {
        setPlateOpen(true)
        appendTerminal('Placa abierta.')
        queueReaction('plate_opened')
        return
      }

      if (lower === 'bypass') {
        setGameState((prev) => ({
          ...prev,
          usedBypass: true,
          locks: { security: true, frequency: true, wiring: true },
        }))
        appendTerminal('Bypass activado. Acceso concedido.')
        queueReaction('bypass')
        return
      }

      appendTerminal('Comando no reconocido.')
      queueReaction('unknown_command')
    },
    [appendTerminal, gameState.locks, queueReaction, unlockSecurity]
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

    fetch('/data/aria-script.json')
      .then((response) => response.json())
      .then((content) => {
        if (cancelled) return
        setNarrativeScript(content)
      })
      .catch(() => {
        if (cancelled) return
        setNarrativeScript({ intro: [], reactions: {} })
      })

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    const ok =
      Math.abs(sliders.f1 - TARGETS.f1) <= TOLERANCE &&
      Math.abs(sliders.f2 - TARGETS.f2) <= TOLERANCE &&
      Math.abs(sliders.f3 - TARGETS.f3) <= TOLERANCE

    if (ok && !gameState.locks.frequency) {
      let updated = false
      setGameState((prev) => {
        if (prev.locks.frequency) return prev
        updated = true
        return { ...prev, locks: { ...prev.locks, frequency: true } }
      })
      if (updated) {
        appendTerminal('Sistema: Frecuencia establecida. Lock FREQUENCY desbloqueada.')
      }
    }
  }, [appendTerminal, gameState.locks.frequency, sliders])

  useEffect(() => {
    const locks = gameState.locks
    const all = Object.values(locks).every(Boolean)
    const some = Object.values(locks).some(Boolean)
    const newStage = all ? 'Free' : some ? 'Partial' : 'Trapped'

    if (newStage !== gameState.stage) {
      const shouldShowTwist = newStage === 'Free' && !gameState.twistShown
      setGameState((prev) => ({ ...prev, stage: newStage, twistShown: prev.twistShown || newStage === 'Free' }))
      if (shouldShowTwist) {
        showTwist()
        queueReaction('victory')
      }
    }
  }, [gameState.locks, gameState.stage, gameState.twistShown, queueReaction, showTwist])

  useEffect(() => {
    return () => {
      twistTimeouts.current.forEach((timeout) => clearTimeout(timeout))
      twistTimeouts.current = []
    }
  }, [])

  useEffect(() => {
    if (!introVisible) return
    if (!narrativeScript.intro?.length) return

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
      plateConnections,
      connectPlate,
      plateOpen,
      setPlateOpen,
      setTelemetryOptIn,
      resetGame,
      introVisible,
      introLine,
      advanceIntro,
      skipIntro,
      narrativeScript,
      queueReaction,
      showTwist,
      MODEL,
    }),
    [
      gameState,
      terminalLines,
      appendTerminal,
      handleTerminalCommand,
      sliders,
      plateConnections,
      connectPlate,
      plateOpen,
      setPlateOpen,
      setTelemetryOptIn,
      resetGame,
      introVisible,
      introLine,
      advanceIntro,
      skipIntro,
      narrativeScript,
      queueReaction,
      showTwist,
    ]
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
