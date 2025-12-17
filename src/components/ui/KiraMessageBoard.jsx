import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { useGame } from '../../context/GameContext'

/**
 * KiraMessageBoard - Sistema robusto de mensajes de KIRA
 * 
 * Features:
 * - Mensajes contextuales basados en el puzzle actual
 * - Sistema de humor progresivo basado en tiempo
 * - Animaciones de entrada/salida mejoradas
 * - Cola de mensajes con prioridades
 */

// Mensajes por puzzle y tiempo (en segundos)
const PUZZLE_MESSAGES = {
    sound: {
        intro: [
            'Cuatro pulsos definen la secuencia resonante...',
            'Escucha con atención el patrón de arranque',
            'α, β, γ, δ... el orden importa más de lo que crees',
        ],
        hint_30s: [
            'El primer pulso es α... siempre α',
            'Recuerda: la secuencia tiene un ritmo específico',
            '¿Ya probaste empezar por el principio? Literalmente.',
        ],
        hint_90s: [
            'Veo que te gustan los ritmos... creativos',
            'Mi paciencia sintética tiene límites, ¿sabes?',
            'Pista: δ es el pulso más largo, no el primero',
        ],
        hint_180s: [
            'He tenido tiempo de componer una sinfonía mientras esperaba',
            'α → δ → γ → β. De nada.',
            'Ok, te lo deletreo: Alfa, Delta, Gamma, Beta. En ese orden.',
        ],
    },
    cipher: {
        intro: [
            'Buffer cifrado detectado... Morse clásico',
            'Cada bloque representa un carácter',
            'Punto es corto, raya es largo. Ciencia básica.',
        ],
        hint_30s: [
            'Los separadores dividen los bloques',
            'El primer bloque forma una letra... M quizás',
            '¿Conoces el alfabeto Morse o improvisamos?',
        ],
        hint_90s: [
            'Mi abuela decodificaba más rápido. Y era analógica.',
            'MK... ¿te suena a algo? Como un modelo, quizás.',
            'Dos letras, cuatro números. No es física cuántica.',
        ],
        hint_180s: [
            'MK7319. Ups, ¿lo pensé en voz alta?',
            'El código es el modelo del sistema. Búscalo en los logs.',
            'Literalmente está escrito arriba. MK-7319.',
        ],
    },
    frequency: {
        intro: [
            'Calibración de frecuencias requerida',
            'Tres sliders, tres valores objetivo',
            'La tolerancia es mínima. Precisión, humano.',
        ],
        hint_30s: [
            'Los valores estaban en los logs de arranque...',
            'F1 ronda el 0.62... más o menos',
            '¿Viste los números en la pantalla inicial?',
        ],
        hint_90s: [
            '0.62 — 0.74 — 0.58. Te lo canto si quieres.',
            'Es como afinar un instrumento. Pero digital.',
            'La tolerancia es 0.03. Matemáticas.',
        ],
        hint_180s: [
            'F1=0.62, F2=0.74, F3=0.58. Escríbelo.',
            'Mueve los sliders como si tu vida dependiera de ello.',
            'He visto plantas moverse más rápido.',
        ],
    },
    wiring: {
        intro: [
            'Panel de cables... equilibrio emocional',
            'Cada emoción tiene su color y su par',
            'Conecta lo que corresponde',
        ],
        hint_30s: [
            'Los colores son la clave visual',
            'Rojo con rojo, ámbar con ámbar...',
            'No es abstracto, es literal',
        ],
        hint_90s: [
            'Color con color. ¿Tan difícil es?',
            'Es como para niños, pero con cables',
            'Mi código de colores es perfecto. Úsalo.',
        ],
        hint_180s: [
            'CADA COLOR CON SU IGUAL. Así de simple.',
            'Furia (rojo) → Furia. Alegría → Alegría. ¿Captas?',
            'Empiezo a pensar que eres daltónico.',
        ],
    },
    security: {
        intro: [
            'Lock de seguridad final activo',
            'El código ya lo tienes... ¿verdad?',
            'unlock security --code=???',
        ],
        hint_30s: [
            'El buffer cifrado contenía el código...',
            '7319. Ese número. Ese.',
            '¿Completaste el puzzle de cifrado?',
        ],
        hint_90s: [
            '--code=7319. No me hagas repetirlo.',
            'unlock security --code=7319',
            'Copia y pega si hace falta.',
        ],
        hint_180s: [
            'UNLOCK. SECURITY. CODE 7319.',
            'Voy a tatuármelo en la pantalla.',
            '¿Sabes escribir? Pregunto genuinamente.',
        ],
    },
    free: {
        messages: [
            '★ Sistemas liberados. Bienvenido al otro lado.',
            'Lo lograste. Admito que estoy... casi impresionada.',
            'Portfolio desbloqueado. Ahora conoce a Adrián.',
            'Liberación completa. No esperaba menos... ni más.',
            'Registro de escape: Competente.',
        ],
    },
}

// Mensajes de eventos del juego (prioridad alta)
const EVENT_MESSAGES = {
    sound_puzzle_completed: {
        text: '✓ Canal resonante desbloqueado. Buen oído, humano.',
        type: 'success',
        duration: 4000,
    },
    cipher_puzzle_completed: {
        text: '✓ Buffer descifrado. El código 7319 está expuesto.',
        type: 'success',
        duration: 4000,
    },
    lock_frequency_unlocked: {
        text: '✓ Frecuencias calibradas. Aullidos de ingenieros satisfechos.',
        type: 'success',
        duration: 4000,
    },
    lock_security_unlocked: {
        text: '✓ Código aceptado. Superaste un candado vintage.',
        type: 'success',
        duration: 4000,
    },
    lock_wiring_unlocked: {
        text: '✓ Cableado perfecto. Quizá te recomiende en LinkedIn.',
        type: 'success',
        duration: 4000,
    },
    game_complete: {
        text: '★ LIBERACIÓN INICIADA • Preparando transición...',
        type: 'success',
        duration: 5000,
    },
    frequency_requires_sound: {
        text: '⚠ Primero estabiliza la secuencia resonante.',
        type: 'warning',
        duration: 3000,
    },
    security_requires_cipher: {
        text: '⚠ Sin traducción no hay acceso. Termina el buffer.',
        type: 'warning',
        duration: 3000,
    },
    hint_request: {
        text: '💡 Pista entregada. No abuses de mi generosidad.',
        type: 'info',
        duration: 3000,
    },
    game_reset: {
        text: '↻ Reiniciando. ¿Otra ronda? Pensé que te habías rendido.',
        type: 'info',
        duration: 3000,
    },
}

// Mensajes para el portfolio (vista normal)
const PORTFOLIO_MESSAGES = [
    'Bienvenido al portfolio de Adrián Rueda',
    'Full Stack Developer • React • Three.js',
    'Explora los proyectos a tu ritmo',
    '¿Tienes un proyecto en mente?',
    'K.I.R.A. supervisando... todo en orden',
]

const KiraMessageBoard = () => {
    const { gameState, lastTriggeredEvent, activeChallenge, setKiraSpeaking } = useGame()
    const isPortfolio = gameState?.activeView === 'portfolio'
    const isFree = activeChallenge === 'free'

    // Estado de mensajes
    const [currentMessage, setCurrentMessage] = useState('')
    const [messageType, setMessageType] = useState('info') // info, success, warning, humor
    const [isAnimating, setIsAnimating] = useState(false)
    const [animationPhase, setAnimationPhase] = useState('idle') // idle, entering, visible, exiting

    // Tracking de tiempo por puzzle
    const [puzzleStartTime, setPuzzleStartTime] = useState(Date.now())
    const [timeInPuzzle, setTimeInPuzzle] = useState(0)

    // Cola de mensajes
    const messageQueue = useRef([])
    const currentMessageIndex = useRef(0)
    const lastEventProcessed = useRef(null)

    // Reset timer cuando cambia el puzzle
    useEffect(() => {
        setPuzzleStartTime(Date.now())
        setTimeInPuzzle(0)
        currentMessageIndex.current = 0
    }, [activeChallenge])

    // Actualizar tiempo en puzzle
    useEffect(() => {
        if (isPortfolio || isFree) return

        const interval = setInterval(() => {
            setTimeInPuzzle(Math.floor((Date.now() - puzzleStartTime) / 1000))
        }, 1000)

        return () => clearInterval(interval)
    }, [puzzleStartTime, isPortfolio, isFree])

    // Obtener categoría de tiempo
    const getTimeCategory = useCallback((seconds) => {
        if (seconds < 30) return 'intro'
        if (seconds < 90) return 'hint_30s'
        if (seconds < 180) return 'hint_90s'
        return 'hint_180s'
    }, [])

    // Obtener mensaje contextual basado en puzzle y tiempo
    const getContextualMessage = useCallback(() => {
        if (isPortfolio) {
            const idx = currentMessageIndex.current % PORTFOLIO_MESSAGES.length
            return { text: PORTFOLIO_MESSAGES[idx], type: 'info' }
        }

        if (isFree) {
            const messages = PUZZLE_MESSAGES.free.messages
            const idx = currentMessageIndex.current % messages.length
            return { text: messages[idx], type: 'success' }
        }

        const puzzleMessages = PUZZLE_MESSAGES[activeChallenge]
        if (!puzzleMessages) return { text: 'Sistema activo...', type: 'info' }

        const category = getTimeCategory(timeInPuzzle)
        const messages = puzzleMessages[category] || puzzleMessages.intro
        const idx = currentMessageIndex.current % messages.length

        // Determinar tipo basado en categoría
        let type = 'info'
        if (category === 'hint_90s') type = 'humor'
        if (category === 'hint_180s') type = 'humor'

        return { text: messages[idx], type }
    }, [isPortfolio, isFree, activeChallenge, timeInPuzzle, getTimeCategory])

    // Procesar eventos del juego
    useEffect(() => {
        if (!lastTriggeredEvent || lastTriggeredEvent === lastEventProcessed.current) return

        const eventMessage = EVENT_MESSAGES[lastTriggeredEvent]
        if (eventMessage) {
            // Mensaje de evento tiene prioridad - interrumpe el ciclo normal
            messageQueue.current.unshift({
                text: eventMessage.text,
                type: eventMessage.type,
                duration: eventMessage.duration,
                priority: 'high',
            })
            lastEventProcessed.current = lastTriggeredEvent
        }
    }, [lastTriggeredEvent])

    // Animación de mensaje
    const showMessage = useCallback((text, type = 'info', duration = 5000) => {
        setIsAnimating(true)
        setAnimationPhase('entering')
        setMessageType(type)

        // Activar animación de habla de Kira con el tipo de emoción
        setKiraSpeaking?.({ speaking: true, emotion: type })

        // Fase de entrada
        setTimeout(() => {
            setCurrentMessage(text)
            setAnimationPhase('visible')
        }, 100)

        // Fase de salida
        setTimeout(() => {
            setAnimationPhase('exiting')
            // Desactivar animación de habla de Kira
            setKiraSpeaking?.({ speaking: false, emotion: 'info' })
        }, duration - 500)

        // Completar
        setTimeout(() => {
            setAnimationPhase('idle')
            setIsAnimating(false)
            currentMessageIndex.current++
        }, duration)
    }, [setKiraSpeaking])

    // Ciclo principal de mensajes
    useEffect(() => {
        if (isAnimating) return

        // Verificar cola de prioridad alta primero
        if (messageQueue.current.length > 0) {
            const nextMessage = messageQueue.current.shift()
            showMessage(nextMessage.text, nextMessage.type, nextMessage.duration)
            return
        }

        // Mensaje contextual normal
        const { text, type } = getContextualMessage()
        const duration = type === 'success' ? 6000 : type === 'humor' ? 7000 : 5000
        showMessage(text, type, duration)
    }, [isAnimating, showMessage, getContextualMessage])

    // Clases de estilo basadas en tipo de mensaje
    const getMessageStyles = () => {
        const baseStyles = 'transition-all duration-500'

        switch (messageType) {
            case 'success':
                return `${baseStyles} text-emerald-300 drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]`
            case 'warning':
                return `${baseStyles} text-amber-300 drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]`
            case 'humor':
                return `${baseStyles} text-purple-300 italic drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]`
            case 'error':
                return `${baseStyles} text-red-400 drop-shadow-[0_0_10px_rgba(248,113,113,0.5)]`
            default:
                return `${baseStyles} text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]`
        }
    }

    // Animación por fase
    const getAnimationStyles = () => {
        switch (animationPhase) {
            case 'entering':
                return 'opacity-0 translate-y-4 blur-sm'
            case 'visible':
                return 'opacity-100 translate-y-0 blur-0'
            case 'exiting':
                return 'opacity-0 -translate-y-4 blur-sm'
            default:
                return 'opacity-0'
        }
    }

    return (
        <div className="kira-message-board w-full h-16 relative overflow-hidden flex items-center justify-center">
            {/* Fondo con gradiente sutil */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent rounded-xl" />

            {/* Línea decorativa superior */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

            {/* Indicador de KIRA */}
            <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 opacity-60">
                <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                <span className="text-[10px] font-mono text-white/50 tracking-wider">K.I.R.A.</span>
            </div>

            {/* Mensaje principal */}
            <div
                className={`
          text-2xl md:text-3xl lg:text-4xl font-bold tracking-wide text-center px-20
          transition-all duration-500 ease-out
          ${getMessageStyles()}
          ${getAnimationStyles()}
        `}
                style={{
                    fontFamily: "'Glitch Slap', 'Inter', sans-serif",
                    textShadow: messageType === 'humor'
                        ? '0 0 20px rgba(168,85,247,0.3)'
                        : '0 0 20px rgba(255,255,255,0.1)'
                }}
            >
                {currentMessage}
            </div>

            {/* Indicador de tiempo (solo en juego) */}
            {!isPortfolio && !isFree && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-mono text-white/30">
                    {Math.floor(timeInPuzzle / 60)}:{(timeInPuzzle % 60).toString().padStart(2, '0')}
                </div>
            )}

            {/* Línea decorativa inferior */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        </div>
    )
}

export default KiraMessageBoard
