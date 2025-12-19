import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react'
import skillsData from '../../../../data/portfolio/skills.json'

// Brand colors for each skill - verified official colors
const SKILL_COLORS = {
    // Development
    'React': '#61DAFB',
    'Python': '#3776AB',
    'TypeScript': '#3178C6',
    'Tailwind': '#38BDF8',
    'Ignition Automotion': '#F26522',
    'C#': '#9B4F96',
    'Unity': '#000000',
    'MATLAB': '#E16737',

    // AI & Tools
    'VS Copilot': '#000000',
    'Claude': '#D97757',
    'ComfyUI': '#6366F1',
    'GitHub': '#181717',

    // Design
    'Canva': '#00C4CC',
    'Adobe Photoshop': '#31A8FF',
    'Adobe Illustrator': '#FF9A00',
}

// Default color for skills not in the map
const DEFAULT_COLOR = '#8b5cf6'

// Pill-shaped bubble class with AABB collision
class Pill {
    constructor(x, y, width, height, label, color) {
        this.x = x
        this.y = y
        this.width = width
        this.height = height
        this.vx = (Math.random() - 0.5) * 1.5
        this.vy = (Math.random() - 0.5) * 1.5
        this.label = label
        this.color = color
        this.mass = width * 0.5
        this.friction = 0.992
    }

    // Get bounding box edges
    get left() { return this.x - this.width / 2 }
    get right() { return this.x + this.width / 2 }
    get top() { return this.y - this.height / 2 }
    get bottom() { return this.y + this.height / 2 }

    update(containerWidth, containerHeight, mouseX, mouseY, mouseActive) {
        // Mouse repulsion
        if (mouseActive) {
            const dx = this.x - mouseX
            const dy = this.y - mouseY
            const distSq = dx * dx + dy * dy
            const minDist = 100

            if (distSq < minDist * minDist && distSq > 0) {
                const dist = Math.sqrt(distSq)
                const force = (minDist - dist) / minDist * 0.6
                this.vx += (dx / dist) * force
                this.vy += (dy / dist) * force
            }
        }

        // Apply velocity
        this.x += this.vx
        this.y += this.vy

        // Apply friction
        this.vx *= this.friction
        this.vy *= this.friction

        // Bounce off walls
        const halfW = this.width / 2
        const halfH = this.height / 2

        if (this.x - halfW < 0) {
            this.x = halfW
            this.vx = Math.abs(this.vx) * 0.7
        }
        if (this.x + halfW > containerWidth) {
            this.x = containerWidth - halfW
            this.vx = -Math.abs(this.vx) * 0.7
        }
        if (this.y - halfH < 0) {
            this.y = halfH
            this.vy = Math.abs(this.vy) * 0.7
        }
        if (this.y + halfH > containerHeight) {
            this.y = containerHeight - halfH
            this.vy = -Math.abs(this.vy) * 0.7
        }
    }

    // Simple AABB collision detection
    checkCollision(other) {
        // Check if rectangles overlap
        const overlapX = Math.min(this.right, other.right) - Math.max(this.left, other.left)
        const overlapY = Math.min(this.bottom, other.bottom) - Math.max(this.top, other.top)

        if (overlapX > 0 && overlapY > 0) {
            // Determine separation axis (use the smaller overlap)
            if (overlapX < overlapY) {
                // Separate horizontally
                const sign = this.x < other.x ? -1 : 1
                const separation = overlapX / 2 + 0.5
                this.x += sign * separation
                other.x -= sign * separation

                // Exchange velocities with restitution
                const totalMass = this.mass + other.mass
                const v1 = this.vx * (this.mass - other.mass * 0.6) / totalMass + other.vx * other.mass * 1.6 / totalMass
                const v2 = other.vx * (other.mass - this.mass * 0.6) / totalMass + this.vx * this.mass * 1.6 / totalMass
                this.vx = v1 * 0.6
                other.vx = v2 * 0.6
            } else {
                // Separate vertically
                const sign = this.y < other.y ? -1 : 1
                const separation = overlapY / 2 + 0.5
                this.y += sign * separation
                other.y -= sign * separation

                // Exchange velocities with restitution
                const totalMass = this.mass + other.mass
                const v1 = this.vy * (this.mass - other.mass * 0.6) / totalMass + other.vy * other.mass * 1.6 / totalMass
                const v2 = other.vy * (other.mass - this.mass * 0.6) / totalMass + this.vy * this.mass * 1.6 / totalMass
                this.vy = v1 * 0.6
                other.vy = v2 * 0.6
            }
        }
    }
}

// Helper to draw a rounded rectangle (pill shape)
function drawPill(ctx, x, y, width, height, color) {
    const radius = height / 2
    const left = x - width / 2
    const top = y - height / 2

    // Create gradient for 3D effect
    const gradient = ctx.createLinearGradient(left, top, left, top + height)
    gradient.addColorStop(0, lightenColor(color, 30))
    gradient.addColorStop(0.5, color)
    gradient.addColorStop(1, darkenColor(color, 20))

    ctx.beginPath()
    ctx.moveTo(left + radius, top)
    ctx.lineTo(left + width - radius, top)
    ctx.arc(left + width - radius, top + radius, radius, -Math.PI / 2, Math.PI / 2)
    ctx.lineTo(left + radius, top + height)
    ctx.arc(left + radius, top + radius, radius, Math.PI / 2, -Math.PI / 2)
    ctx.closePath()

    ctx.fillStyle = gradient
    ctx.fill()

    // Border
    ctx.strokeStyle = lightenColor(color, 40) + '80'
    ctx.lineWidth = 1
    ctx.stroke()
}

// Color manipulation helpers
function lightenColor(hex, percent) {
    const num = parseInt(hex.replace('#', ''), 16)
    const amt = Math.round(2.55 * percent)
    const R = Math.min(255, (num >> 16) + amt)
    const G = Math.min(255, ((num >> 8) & 0x00FF) + amt)
    const B = Math.min(255, (num & 0x0000FF) + amt)
    return `#${(1 << 24 | R << 16 | G << 8 | B).toString(16).slice(1)}`
}

function darkenColor(hex, percent) {
    const num = parseInt(hex.replace('#', ''), 16)
    const amt = Math.round(2.55 * percent)
    const R = Math.max(0, (num >> 16) - amt)
    const G = Math.max(0, ((num >> 8) & 0x00FF) - amt)
    const B = Math.max(0, (num & 0x0000FF) - amt)
    return `#${(1 << 24 | R << 16 | G << 8 | B).toString(16).slice(1)}`
}

const SkillBubbles = () => {
    const containerRef = useRef(null)
    const canvasRef = useRef(null)
    const pillsRef = useRef([])
    const mouseRef = useRef({ x: 0, y: 0, active: false })
    const animationRef = useRef(null)
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 })

    // Get all skills - memoized to prevent recreation on every render
    const allSkills = useMemo(() =>
        skillsData.core.flatMap(category => category.items)
        , []) // Empty deps - skills data is static JSON import

    // Measure text and initialize pills
    const initPills = useCallback((width, height) => {
        const canvas = canvasRef.current
        if (!canvas) return []

        const ctx = canvas.getContext('2d')
        const pills = []
        const fontSize = 11
        const paddingX = 16
        const paddingY = 8
        const pillHeight = fontSize + paddingY * 2

        ctx.font = `600 ${fontSize}px Inter, system-ui, sans-serif`

        allSkills.forEach((skill) => {
            const color = SKILL_COLORS[skill.label] || DEFAULT_COLOR
            const textWidth = ctx.measureText(skill.label).width
            const pillWidth = textWidth + paddingX * 2

            // Random initial position with margin
            const margin = Math.max(pillWidth, pillHeight) / 2 + 10
            const x = margin + Math.random() * (width - margin * 2)
            const y = margin + Math.random() * (height - margin * 2)

            pills.push(new Pill(x, y, pillWidth, pillHeight, skill.label, color))
        })

        return pills
    }, [allSkills])

    // Animation loop
    const animate = useCallback(() => {
        const canvas = canvasRef.current
        const ctx = canvas?.getContext('2d')
        if (!canvas || !ctx) return

        const { width, height } = dimensions
        ctx.clearRect(0, 0, width, height)

        const pills = pillsRef.current
        const { x: mouseX, y: mouseY, active: mouseActive } = mouseRef.current

        // Update all pills
        for (const pill of pills) {
            pill.update(width, height, mouseX, mouseY, mouseActive)
        }

        // Check collisions between all pairs
        for (let i = 0; i < pills.length; i++) {
            for (let j = i + 1; j < pills.length; j++) {
                pills[i].checkCollision(pills[j])
            }
        }

        // Draw pills
        const fontSize = 11
        for (const pill of pills) {
            const { x, y, width: pw, height: ph, label, color } = pill

            // Glow effect
            ctx.shadowColor = color
            ctx.shadowBlur = 12
            ctx.shadowOffsetX = 0
            ctx.shadowOffsetY = 0

            // Draw pill shape
            drawPill(ctx, x, y, pw, ph, color)

            // Reset shadow for text
            ctx.shadowBlur = 0

            // Text label
            ctx.fillStyle = '#ffffff'
            ctx.font = `600 ${fontSize}px Inter, system-ui, sans-serif`
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'

            // Text shadow for readability
            ctx.shadowColor = 'rgba(0, 0, 0, 0.5)'
            ctx.shadowBlur = 2
            ctx.shadowOffsetY = 1
            ctx.fillText(label, x, y)
            ctx.shadowBlur = 0
            ctx.shadowOffsetY = 0
        }

        animationRef.current = requestAnimationFrame(animate)
    }, [dimensions])

    // Handle resize
    useEffect(() => {
        const container = containerRef.current
        if (!container) return

        const updateDimensions = () => {
            const rect = container.getBoundingClientRect()
            setDimensions({ width: rect.width, height: rect.height })
        }

        const resizeObserver = new ResizeObserver(updateDimensions)
        resizeObserver.observe(container)
        updateDimensions()

        return () => resizeObserver.disconnect()
    }, [])

    // Initialize pills only once when dimensions are available
    // Guard prevents re-initialization when parent re-renders (e.g., KiraMessageBoard updates)
    useEffect(() => {
        if (dimensions.width > 0 && dimensions.height > 0 && pillsRef.current.length === 0) {
            pillsRef.current = initPills(dimensions.width, dimensions.height)
        }
    }, [dimensions.width, dimensions.height, initPills])

    // Start animation
    useEffect(() => {
        if (dimensions.width > 0 && dimensions.height > 0) {
            animationRef.current = requestAnimationFrame(animate)
        }
        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current)
            }
        }
    }, [animate, dimensions])

    // Mouse event handlers
    const handleMouseMove = useCallback((e) => {
        const rect = canvasRef.current?.getBoundingClientRect()
        if (rect) {
            mouseRef.current = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top,
                active: true
            }
        }
    }, [])

    const handleMouseLeave = useCallback(() => {
        mouseRef.current = { ...mouseRef.current, active: false }
    }, [])

    const handleTouchMove = useCallback((e) => {
        e.preventDefault()
        const rect = canvasRef.current?.getBoundingClientRect()
        if (rect && e.touches[0]) {
            mouseRef.current = {
                x: e.touches[0].clientX - rect.left,
                y: e.touches[0].clientY - rect.top,
                active: true
            }
        }
    }, [])

    return (
        <div className="h-full flex flex-col">
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold tracking-widest text-gray-400 uppercase">Core Skills</h3>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-purple-500 opacity-50">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
            </div>

            <div
                ref={containerRef}
                className="flex-1 relative overflow-hidden rounded-xl bg-gradient-to-b from-black/30 to-black/10"
                style={{ minHeight: '200px' }}
            >
                <canvas
                    ref={canvasRef}
                    width={dimensions.width}
                    height={dimensions.height}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleMouseLeave}
                    className="absolute inset-0 w-full h-full cursor-pointer"
                    style={{ touchAction: 'none' }}
                />
            </div>
        </div>
    )
}

export default SkillBubbles
