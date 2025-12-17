import React, { useState, useEffect } from 'react'

const ProjectCard = ({ project, images, onSelect, autoSlideDelay }) => {
    const [isHovered, setIsHovered] = useState(false)
    const [isAutoSliding, setIsAutoSliding] = useState(false)

    const primaryImage = images?.[0] || null
    const hasImages = images && images.length > 0

    // Auto-slide animation with staggered timing (3-13 seconds)
    useEffect(() => {
        if (!autoSlideDelay || !hasImages) return

        const triggerAutoSlide = () => {
            if (!isHovered) {
                setIsAutoSliding(true)
                // Reset after animation completes
                setTimeout(() => {
                    setIsAutoSliding(false)
                }, 1200)
            }
        }

        // Initial delay before starting auto-slide
        const initialDelay = setTimeout(() => {
            triggerAutoSlide()
        }, autoSlideDelay)

        // Recurring interval for auto-slide (increased to 13s max)
        const interval = setInterval(() => {
            triggerAutoSlide()
        }, autoSlideDelay + 8000 + Math.random() * 5000)

        return () => {
            clearTimeout(initialDelay)
            clearInterval(interval)
        }
    }, [autoSlideDelay, isHovered, hasImages])

    const handleClick = () => {
        // Simple click handler - let modal handle its own animation
        onSelect(project)
    }

    const showImageSlide = isHovered || isAutoSliding

    return (
        <div
            className="project-card-container group"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={handleClick}
        >
            {/* Default content: Project info (always visible as base) */}
            <div className="project-card-content">
                <div className="project-card-content-inner">
                    <div className="project-card-header">
                        <h4 className="project-card-title">{project.name}</h4>
                        <span className="project-card-year">{project.year}</span>
                    </div>

                    <p className="project-card-description">
                        {project.description.normal}
                    </p>

                    <div className="project-card-tags">
                        {project.tags.slice(0, 3).map(tag => (
                            <span key={tag} className="project-card-tag">
                                {tag}
                            </span>
                        ))}
                    </div>

                    <div className="project-card-cta">
                        <span className="text-xs text-purple-400 font-medium">Ver proyecto →</span>
                    </div>
                </div>
            </div>

            {/* Sliding image overlay (slides from left on hover) */}
            {hasImages && (
                <div className={`project-card-image-slide ${showImageSlide ? 'active' : ''}`}>
                    <img
                        src={primaryImage}
                        alt={project.name}
                        className="project-card-image"
                        loading="lazy"
                    />
                    <div className="project-card-image-gradient" />
                    <div className="project-card-image-label">
                        <h4 className="project-card-static-title">{project.name}</h4>
                    </div>
                </div>
            )}

            {/* Placeholder when no image */}
            {!hasImages && (
                <div className="project-card-placeholder-icon">
                    <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                </div>
            )}
        </div>
    )
}

export default ProjectCard

