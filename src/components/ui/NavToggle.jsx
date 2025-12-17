import React from 'react'
import { useGame } from '../../context/GameContext'

/**
 * NavToggle - Botones unificados de navegación Game/CV
 * Este componente se usa tanto en el layout del juego como en el portfolio
 * para mantener estilos y funcionalidad consistentes.
 */
const NavToggle = ({ variant = 'default' }) => {
    const { gameState, setActiveView, triggerBypass, resetGame } = useGame()
    const isPortfolio = gameState?.activeView === 'portfolio'
    const portfolioUnlocked = gameState?.portfolioUnlocked

    // Variantes de estilo
    const variants = {
        default: 'flex flex-col gap-2 w-full',
        horizontal: 'flex flex-row gap-2 w-full',
        compact: 'flex flex-col gap-1.5 w-full'
    }

    const containerClass = variants[variant] || variants.default

    return (
        <div className={containerClass}>
            {/* Botones principales de navegación */}
            <div className="flex gap-2 w-full">
                <button
                    onClick={() => setActiveView('game')}
                    className={`nav-toggle-btn flex-1 ${!isPortfolio ? 'nav-toggle-btn-active' : ''}`}
                    title="Ir al Juego"
                >
                    <span className="nav-toggle-icon">🎮</span>
                    <span className="nav-toggle-label">Game</span>
                </button>

                <button
                    onClick={() => portfolioUnlocked && setActiveView('portfolio')}
                    className={`nav-toggle-btn flex-1 ${isPortfolio ? 'nav-toggle-btn-active' : ''} ${!portfolioUnlocked ? 'nav-toggle-btn-locked' : ''}`}
                    title={portfolioUnlocked ? "Ir al Portfolio" : "Completa el juego para desbloquear"}
                    disabled={!portfolioUnlocked}
                >
                    {!portfolioUnlocked && <span className="nav-toggle-lock">🔒</span>}
                    <span className="nav-toggle-icon">📄</span>
                    <span className="nav-toggle-label">CV</span>
                </button>
            </div>

            {/* Controles adicionales (solo en vista de juego) */}
            {!isPortfolio && (
                <div className="flex gap-2 w-full mt-2">
                    <button
                        onClick={triggerBypass}
                        className="nav-control-btn nav-control-skip flex-1"
                        title="Saltar Puzzles"
                    >
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                        SALTAR
                    </button>
                    <button
                        onClick={resetGame}
                        className="nav-control-btn nav-control-reset flex-1"
                        title="Reiniciar Juego"
                    >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                            <path d="M3 3v5h5" />
                        </svg>
                        RESET
                    </button>
                </div>
            )}
        </div>
    )
}

export default NavToggle
