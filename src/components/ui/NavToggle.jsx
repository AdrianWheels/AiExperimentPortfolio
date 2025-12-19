import React from 'react'
import { useGame } from '../../context/GameContext'

/**
 * NavToggle - Navegación unificada Game/CV
 * Layout en 2 filas:
 * Fila 1: [Toggle] [Skip] [Reset]
 * Fila 2:     [LinkedIn] [GitHub]
 */
const NavToggle = ({ variant = 'default' }) => {
    const { gameState, setActiveView, triggerBypass, resetGame } = useGame()
    const isPortfolio = gameState?.activeView === 'portfolio'
    const portfolioUnlocked = gameState?.portfolioUnlocked

    // Tamaños según variante
    const sizes = {
        mobile: { icon: 16, btn: 'nav-icon-btn' },
        default: { icon: 18, btn: 'nav-icon-btn nav-icon-btn-desktop' },
    }
    const size = sizes[variant] || sizes.default
    const iconSize = size.icon

    return (
        <div className="flex flex-col items-center gap-2 w-full">
            {/* Fila 1: Toggle + Skip + Reset */}
            <div className="flex gap-2 justify-center items-center w-full">
                <button
                    onClick={() => {
                        if (isPortfolio) {
                            setActiveView('game')
                        } else if (portfolioUnlocked) {
                            setActiveView('portfolio')
                        }
                    }}
                    className="nav-toggle-btn nav-toggle-btn-active"
                    title={isPortfolio ? "Volver al Juego" : (portfolioUnlocked ? "Ver Portfolio" : "Completa el juego")}
                >
                    <span className="nav-toggle-icon">{isPortfolio ? '🎮' : '📄'}</span>
                    <span className="nav-toggle-label">{isPortfolio ? 'Game' : 'CV'}</span>
                    {!portfolioUnlocked && !isPortfolio && <span className="nav-toggle-lock">🔒</span>}
                </button>

                <button
                    onClick={!isPortfolio ? triggerBypass : undefined}
                    className={`${size.btn} nav-icon-skip ${isPortfolio ? 'nav-icon-disabled' : ''}`}
                    title="Saltar Puzzles"
                    disabled={isPortfolio}
                >
                    <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="5 4 15 12 5 20 5 4" />
                        <line x1="19" y1="5" x2="19" y2="19" />
                    </svg>
                </button>

                <button
                    onClick={!isPortfolio ? resetGame : undefined}
                    className={`${size.btn} nav-icon-reset ${isPortfolio ? 'nav-icon-disabled' : ''}`}
                    title="Reiniciar Juego"
                    disabled={isPortfolio}
                >
                    <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                        <path d="M3 3v5h5" />
                    </svg>
                </button>
            </div>
        </div>
    )
}

export default NavToggle
