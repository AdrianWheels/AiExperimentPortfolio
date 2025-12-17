import React from 'react'
import { useGame } from '../../context/GameContext'
import KiraAvatar from './KiraAvatar'

export default function IntroCinematic() {
  const {
    introVisible,
    introLine,
    skipIntro,
    goToPortfolio
  } = useGame()

  if (!introVisible || !introLine) return null

  const handleGoToPortfolio = () => {
    goToPortfolio()
  }

  const goToGame = () => {
    skipIntro()
  }

  return (
    <div className="intro-cinematic-overlay">
      <div className="intro-cinematic-container">
        {/* Avatar circular con anillos */}
        <div className="intro-kira-orb">
          {/* Anillos decorativos */}
          <div className="intro-ring intro-ring-outer" />
          <div className="intro-ring intro-ring-middle" />
          <div className="intro-ring intro-ring-inner" />

          {/* Glow effect */}
          <div className="intro-kira-glow" />

          {/* Avatar de KIRA */}
          <div className="intro-kira-avatar">
            <KiraAvatar size="large" />
          </div>
        </div>

        {/* Speaker label */}
        <div className="intro-speaker">
          {introLine.speaker || 'K.I.R.A.'}
        </div>

        {/* Mensaje principal */}
        <p className="intro-message">
          {introLine.text}
        </p>

        {/* Subtexto */}
        {introLine.subtext && (
          <p className="intro-subtext">
            {introLine.subtext}
          </p>
        )}

        {/* Botones de acción */}
        <div className="intro-actions">
          <button
            className="intro-btn intro-btn-primary"
            onClick={handleGoToPortfolio}
          >
            <span className="intro-btn-icon">📋</span>
            Ver Portfolio
          </button>
          <button
            className="intro-btn intro-btn-secondary"
            onClick={goToGame}
          >
            <span className="intro-btn-icon">🎮</span>
            Jugar
          </button>
        </div>

        {/* Texto decorativo inferior */}
        <div className="intro-footer-text">
          SISTEMA DE SEGURIDAD ACTIVO
        </div>
      </div>
    </div>
  )
}
