import React, { useMemo } from 'react'
import { useGame } from '../../context/GameContext'
import profileData from '../../../data/portfolio/profile.json'
import experienceData from '../../../data/portfolio/experience.json'
import skillsData from '../../../data/portfolio/skills.json'
import projectsData from '../../../data/portfolio/projects.json'
import PortfolioHero from './PortfolioHero'
import PortfolioSkills from './PortfolioSkills'
import PortfolioProjects from './PortfolioProjects'
import PortfolioTimeline from './PortfolioTimeline'

function resolveModeCopy(value, mode) {
  if (value == null) return ''
  if (typeof value === 'string') return value
  if (typeof value === 'object') {
    if (value[mode]) return value[mode]
    if (value.normal) return value.normal
    const first = Object.values(value)[0]
    return typeof first === 'string' ? first : ''
  }
  return ''
}

export default function PortfolioView() {
  const { gameState, setPortfolioMode, setActiveView } = useGame()
  const mode = gameState.portfolioMode || 'normal'
  const isHacked = mode === 'hacked'

  const handleModeToggle = () => {
    setPortfolioMode(isHacked ? 'normal' : 'hacked')
  }

  const handleBackToGame = () => {
    setActiveView('game')
  }

  const shellClass = isHacked
    ? 'relative rounded-[28px] border border-purple-700/60 bg-gradient-to-br from-purple-950/80 via-slate-950 to-black shadow-[0_0_32px_rgba(168,85,247,0.25)]'
    : 'relative rounded-[28px] border border-slate-700/50 bg-slate-900/70 backdrop-blur-md shadow-[0_0_28px_rgba(59,130,246,0.18)]'

  const description = useMemo(
    () => resolveModeCopy(profileData.summary, mode),
    [mode],
  )

  const tagline = useMemo(
    () => resolveModeCopy(profileData.tagline, mode),
    [mode],
  )

  return (
    <div className="w-full px-4 py-8">
      <div className={shellClass}>
        <div
          className={`absolute inset-0 pointer-events-none ${
            isHacked
              ? 'bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.18),transparent_45%),radial-gradient(circle_at_80%_10%,rgba(236,72,153,0.25),transparent_55%),radial-gradient(circle_at_50%_100%,rgba(14,116,144,0.2),transparent_60%)]'
              : 'bg-[radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.14),transparent_45%),radial-gradient(circle_at_80%_10%,rgba(59,130,246,0.25),transparent_55%),radial-gradient(circle_at_50%_100%,rgba(16,185,129,0.12),transparent_60%)]'
          }`}
        />
        <div className={`relative z-10 px-8 pb-12 pt-10 ${isHacked ? 'text-violet-100' : 'text-slate-100'}`}>
          <PortfolioHero
            name={profileData.name}
            alias={profileData.alias}
            tagline={tagline}
            summary={description}
            location={profileData.location}
            availability={profileData.availability}
            contact={profileData.contact}
            social={profileData.social}
            highlights={isHacked ? profileData.hackedHighlights ?? [] : profileData.highlights ?? []}
            mode={mode}
            onModeToggle={handleModeToggle}
            onBackToGame={handleBackToGame}
          />

          <div className="mt-10 grid gap-8 xl:grid-cols-[2fr_1fr]">
            <PortfolioProjects
              projects={projectsData.featured || []}
              experiments={projectsData.experiments || []}
              mode={mode}
            />
            <PortfolioSkills core={skillsData.core || []} toolbelt={skillsData.toolbelt || []} soft={skillsData.soft || []} mode={mode} />
          </div>

          <div className="mt-10">
            <PortfolioTimeline
              timeline={experienceData.timeline || []}
              education={experienceData.education || []}
              certifications={experienceData.certifications || []}
              mode={mode}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
