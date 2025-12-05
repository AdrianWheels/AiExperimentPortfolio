import React from 'react'
import AriaAvatar from '../narrative/AriaAvatar'

/**
 * BentoScene - Layout simple:
 * - 4 paneles cuadrados en grid 2x2
 * - Círculo central que "muerde" los paneles con KIRA dentro
 * - Texto circular alrededor del orbe
 */
export default function BentoScene() {
  return (
    <div className="bento-scene">
      {/* SVG para definir la máscara circular */}
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          <clipPath id="clip-tl" clipPathUnits="objectBoundingBox">
            <path d="M0,0 L1,0 L1,0.6 Q0.6,0.6 0.6,1 L0,1 Z"/>
          </clipPath>
          <clipPath id="clip-tr" clipPathUnits="objectBoundingBox">
            <path d="M0,0 L1,0 L1,1 L0.4,1 Q0.4,0.6 0,0.6 L0,0 Z"/>
          </clipPath>
          <clipPath id="clip-bl" clipPathUnits="objectBoundingBox">
            <path d="M0,0 L0.6,0 Q0.6,0.4 1,0.4 L1,1 L0,1 Z"/>
          </clipPath>
          <clipPath id="clip-br" clipPathUnits="objectBoundingBox">
            <path d="M0.4,0 Q0.4,0.4 0,0.4 L0,1 L1,1 L1,0 Z"/>
          </clipPath>
        </defs>
      </svg>

      {/* Grid de 4 paneles */}
      <div className="bento-scene-grid">
        <div className="bento-scene-panel panel-tl">
          <span className="panel-label">Panel 1</span>
        </div>
        <div className="bento-scene-panel panel-tr">
          <span className="panel-label">Panel 2</span>
        </div>
        <div className="bento-scene-panel panel-bl">
          <span className="panel-label">Panel 3</span>
        </div>
        <div className="bento-scene-panel panel-br">
          <span className="panel-label">Panel 4</span>
        </div>
        
        {/* Círculo central con KIRA dentro */}
        <div className="bento-scene-center">
          {/* Texto circular SVG */}
          <svg className="circular-text-svg" viewBox="0 0 200 200">
            <defs>
              {/* Path para texto superior (arco de arriba) */}
              <path 
                id="textPathTop" 
                d="M 30, 100 A 70,70 0 0,1 170,100"
                fill="none"
              />
              {/* Path para texto inferior (arco de abajo) */}
              <path 
                id="textPathBottom" 
                d="M 170, 100 A 70,70 0 0,1 30,100"
                fill="none"
              />
            </defs>
            
            {/* Texto superior */}
            <text className="circular-text">
              <textPath href="#textPathTop" startOffset="50%" textAnchor="middle">
                NEURAL LINK ACTIVE
              </textPath>
            </text>
            
            {/* Texto inferior */}
            <text className="circular-text">
              <textPath href="#textPathBottom" startOffset="50%" textAnchor="middle">
                • K.I.R.A. SYSTEM •
              </textPath>
            </text>
          </svg>
          
          {/* Avatar de KIRA */}
          <div className="kira-center-avatar">
            <AriaAvatar size="medium" />
          </div>
        </div>
      </div>
    </div>
  )
}
