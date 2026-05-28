import { useRef, useEffect, useState, useCallback, useMemo } from 'react'

// Colors tuned to match the dark purple/indigo theme of the portfolio
const SKILL_COLORS: Record<string, string> = {
  'React': '#7DD3FC', 'Python': '#6B8FCC', 'TypeScript': '#6E9FD6',
  'Tailwind': '#67C9E8', 'Ignition Automation': '#E08850', 'C#': '#A87DB8',
  'Unity': '#6B6B80', 'MATLAB': '#D0825A', 'VS Copilot': '#6B6B80',
  'Claude': '#D4896A', 'ComfyUI': '#818CF8', 'GitHub': '#8B8BA0',
  'Canva': '#5CC4C8', 'Adobe Photoshop': '#6AAED8', 'Adobe Illustrator': '#E0A040',
  'Next.js': '#8B8BA0', 'Node.js': '#6BBF7B', 'Supabase': '#6DD4A8',
  'Godot 4': '#7AAFCF', 'Gemini AI': '#7BA4E0',
  'FastAPI': '#5DBFA4', 'Whisper STT': '#B57BD4', 'LightGBM': '#D8B96A',
}

const DEFAULT_COLOR = '#a78bfa'

const ALL_SKILLS = [
  'React', 'Next.js', 'TypeScript', 'Node.js', 'Python', 'FastAPI', 'Tailwind',
  'Supabase', 'Godot 4', 'C#', 'Unity', 'Ignition Automation', 'MATLAB',
  'VS Copilot', 'Claude', 'Gemini AI', 'ComfyUI', 'Whisper STT', 'LightGBM',
  'GitHub', 'Canva', 'Adobe Photoshop', 'Adobe Illustrator',
]

class Pill {
  x: number; y: number; width: number; height: number
  vx: number; vy: number; label: string; color: string
  mass: number; friction: number

  constructor(x: number, y: number, width: number, height: number, label: string, color: string) {
    this.x = x; this.y = y; this.width = width; this.height = height
    this.vx = (Math.random() - 0.5) * 1.5
    this.vy = (Math.random() - 0.5) * 1.5
    this.label = label; this.color = color
    this.mass = width * 0.5; this.friction = 0.992
  }

  get left() { return this.x - this.width / 2 }
  get right() { return this.x + this.width / 2 }
  get top() { return this.y - this.height / 2 }
  get bottom() { return this.y + this.height / 2 }

  update(cw: number, ch: number, mx: number, my: number, active: boolean) {
    if (active) {
      const dx = this.x - mx, dy = this.y - my
      const distSq = dx * dx + dy * dy
      if (distSq < 10000 && distSq > 0) {
        const dist = Math.sqrt(distSq)
        const force = (100 - dist) / 100 * 0.6
        this.vx += (dx / dist) * force
        this.vy += (dy / dist) * force
      }
    }
    this.x += this.vx; this.y += this.vy
    this.vx *= this.friction; this.vy *= this.friction
    const hw = this.width / 2, hh = this.height / 2
    if (this.x - hw < 0) { this.x = hw; this.vx = Math.abs(this.vx) * 0.7 }
    if (this.x + hw > cw) { this.x = cw - hw; this.vx = -Math.abs(this.vx) * 0.7 }
    if (this.y - hh < 0) { this.y = hh; this.vy = Math.abs(this.vy) * 0.7 }
    if (this.y + hh > ch) { this.y = ch - hh; this.vy = -Math.abs(this.vy) * 0.7 }
  }

  checkCollision(other: Pill) {
    const ox = Math.min(this.right, other.right) - Math.max(this.left, other.left)
    const oy = Math.min(this.bottom, other.bottom) - Math.max(this.top, other.top)
    if (ox > 0 && oy > 0) {
      const tm = this.mass + other.mass
      if (ox < oy) {
        const s = this.x < other.x ? -1 : 1
        this.x += s * (ox / 2 + 0.5); other.x -= s * (ox / 2 + 0.5)
        const v1 = this.vx * (this.mass - other.mass * 0.6) / tm + other.vx * other.mass * 1.6 / tm
        const v2 = other.vx * (other.mass - this.mass * 0.6) / tm + this.vx * this.mass * 1.6 / tm
        this.vx = v1 * 0.6; other.vx = v2 * 0.6
      } else {
        const s = this.y < other.y ? -1 : 1
        this.y += s * (oy / 2 + 0.5); other.y -= s * (oy / 2 + 0.5)
        const v1 = this.vy * (this.mass - other.mass * 0.6) / tm + other.vy * other.mass * 1.6 / tm
        const v2 = other.vy * (other.mass - this.mass * 0.6) / tm + this.vy * this.mass * 1.6 / tm
        this.vy = v1 * 0.6; other.vy = v2 * 0.6
      }
    }
  }
}

function drawPill(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string) {
  const r = h / 2, l = x - w / 2, t = y - h / 2
  ctx.beginPath()
  ctx.moveTo(l + r, t); ctx.lineTo(l + w - r, t)
  ctx.arc(l + w - r, t + r, r, -Math.PI / 2, Math.PI / 2)
  ctx.lineTo(l + r, t + h); ctx.arc(l + r, t + r, r, Math.PI / 2, -Math.PI / 2)
  ctx.closePath()
  // Flat fill with the color
  ctx.fillStyle = color
  ctx.fill()
  // Subtle border slightly lighter
  ctx.strokeStyle = 'rgba(255,255,255,0.15)'
  ctx.lineWidth = 1
  ctx.stroke()
}

export default function SkillBubbles({ title = 'Core Skills' }: { title?: string }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const pillsRef = useRef<Pill[]>([])
  const mouseRef = useRef({ x: 0, y: 0, active: false })
  const animRef = useRef<number>(0)
  const [dims, setDims] = useState({ width: 0, height: 0 })

  const initPills = useCallback((w: number, h: number) => {
    const canvas = canvasRef.current
    if (!canvas) return []
    const ctx = canvas.getContext('2d')!
    const pills: Pill[] = []
    const fs = 11, px = 16, py = 8, ph = fs + py * 2
    ctx.font = `600 ${fs}px Inter, system-ui, sans-serif`
    ALL_SKILLS.forEach((label) => {
      const color = SKILL_COLORS[label] || DEFAULT_COLOR
      const tw = ctx.measureText(label).width, pw = tw + px * 2
      const m = Math.max(pw, ph) / 2 + 10
      pills.push(new Pill(m + Math.random() * (w - m * 2), m + Math.random() * (h - m * 2), pw, ph, label, color))
    })
    return pills
  }, [])

  const animate = useCallback(() => {
    const canvas = canvasRef.current, ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    const { width: w, height: h } = dims
    ctx.clearRect(0, 0, w, h)
    const pills = pillsRef.current
    const { x: mx, y: my, active } = mouseRef.current
    for (const p of pills) p.update(w, h, mx, my, active)
    for (let i = 0; i < pills.length; i++) for (let j = i + 1; j < pills.length; j++) pills[i].checkCollision(pills[j])
    const fs = 11
    for (const p of pills) {
      // No glow shadow — flat style
      ctx.shadowBlur = 0; ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 0
      drawPill(ctx, p.x, p.y, p.width, p.height, p.color)
      // Text
      ctx.fillStyle = '#fff'
      ctx.font = `600 ${fs}px Inter, system-ui, sans-serif`
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 3; ctx.shadowOffsetY = 1
      ctx.fillText(p.label, p.x, p.y); ctx.shadowBlur = 0; ctx.shadowOffsetY = 0
    }
    animRef.current = requestAnimationFrame(animate)
  }, [dims])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const update = () => { const r = el.getBoundingClientRect(); setDims({ width: r.width, height: r.height }) }
    const ro = new ResizeObserver(update); ro.observe(el); update()
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    if (dims.width > 0 && dims.height > 0 && pillsRef.current.length === 0)
      pillsRef.current = initPills(dims.width, dims.height)
  }, [dims.width, dims.height, initPills])

  useEffect(() => {
    if (dims.width > 0 && dims.height > 0) animRef.current = requestAnimationFrame(animate)
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current) }
  }, [animate, dims])

  const onMouse = useCallback((e: React.MouseEvent) => {
    const r = canvasRef.current?.getBoundingClientRect()
    if (r) mouseRef.current = { x: e.clientX - r.left, y: e.clientY - r.top, active: true }
  }, [])
  const onLeave = useCallback(() => { mouseRef.current = { ...mouseRef.current, active: false } }, [])
  const onTouch = useCallback((e: React.TouchEvent) => {
    e.preventDefault()
    const r = canvasRef.current?.getBoundingClientRect()
    if (r && e.touches[0]) mouseRef.current = { x: e.touches[0].clientX - r.left, y: e.touches[0].clientY - r.top, active: true }
  }, [])

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-bold tracking-widest text-gray-400 uppercase">{title}</h3>
      </div>
      <div ref={containerRef} className="flex-1 relative overflow-hidden rounded-xl bg-gradient-to-b from-black/30 to-black/10" style={{ minHeight: '200px' }}>
        <canvas ref={canvasRef} width={dims.width} height={dims.height}
          onMouseMove={onMouse} onMouseLeave={onLeave} onTouchMove={onTouch} onTouchEnd={onLeave}
          className="absolute inset-0 w-full h-full cursor-pointer" style={{ touchAction: 'none' }} />
      </div>
    </div>
  )
}
