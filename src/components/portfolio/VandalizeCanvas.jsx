import React, { useEffect, useMemo, useRef } from 'react'

const JINX = {
  bg: '#0b0c10',
  fg: '#e6e6e6',
  cyan: '#00e5ff',
  pink: '#ff3ea5',
}

function mulberry32(a) {
  return function () {
    let t = (a += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function hashString(s) {
  let h = (2166136261 >>> 0)
  for (let i = 0; i < s.length; i += 1) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

export default function VandalizeCanvas({ name = 'Adrián Rueda', replacement = 'A.R.I.A' }) {
  const canvasRef = useRef(null)
  const svgCyanRef = useRef(null)
  const svgPinkRef = useRef(null)
  const nameRef = useRef(null)
  const struckRef = useRef(false)
  const rngRef = useRef(() => Math.random())
  const replacementRef = useRef(null)

  const seed = useMemo(() => hashString(`${name}|v1-fixed`), [name])

  useEffect(() => {
    const handleResize = () => {
      resizeCanvas()
      positionStrike()
      clearCanvas()
      struckRef.current = false
      requestAnimationFrame(() => {
        vandalizeOnce()
      })
    }

    window.addEventListener('resize', handleResize)
    resizeCanvas()
    positionStrike()
    clearCanvas()
    struckRef.current = false
    const frame = requestAnimationFrame(() => {
      vandalizeOnce()
    })

    return () => {
      window.removeEventListener('resize', handleResize)
      cancelAnimationFrame(frame)
      clearCanvas(true)
    }
  }, [seed])

  function setRng(source) {
    rngRef.current = source
  }

  function R() {
    return rngRef.current()
  }

  function rand(min, max) {
    return R() * (max - min) + min
  }

  function resizeCanvas() {
    const canvas = canvasRef.current
    if (!canvas) return

    const dpr = window.devicePixelRatio || 1
    const docW = Math.max(document.documentElement.scrollWidth, window.innerWidth)
    const docH = Math.max(document.documentElement.scrollHeight, window.innerHeight)
    canvas.width = Math.floor(docW * dpr)
    canvas.height = Math.floor(docH * dpr)
    canvas.style.width = `${docW}px`
    canvas.style.height = `${docH}px`
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
  }

  function clearCanvas(force = false) {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(
      0,
      0,
      canvas.width / (window.devicePixelRatio || 1),
      canvas.height / (window.devicePixelRatio || 1),
    )

    const cyan = svgCyanRef.current
    const pink = svgPinkRef.current
    if (cyan) {
      cyan.style.strokeOpacity = '0'
      cyan.style.strokeDashoffset = ''
    }
    if (pink) {
      pink.style.strokeOpacity = '0'
      pink.style.strokeDashoffset = ''
    }

    const replacementNode = replacementRef.current
    if (replacementNode) {
      replacementNode.setAttribute('style', 'opacity:0; pointer-events:none;')
    }

    if (force) {
      struckRef.current = false
    }
  }

  function jitterPolyline(x1, y1, x2, y2, segments = 24, amp = 1.5) {
    const points = []
    const dx = x2 - x1
    const dy = y2 - y1
    const len = Math.hypot(dx, dy) || 1
    const nx = -dy / len
    const ny = dx / len

    for (let i = 0; i <= segments; i += 1) {
      const t = i / segments
      const x = x1 + dx * t
      const y = y1 + dy * t
      const a = (Math.sin(t * 6.283 + R() * 2) * 0.5 + (R() - 0.5)) * amp
      points.push([x + nx * a, y + ny * a])
    }

    return points
  }

  function strokePolyline(ctx, points, color, width, alpha = 1) {
    ctx.save()
    ctx.globalAlpha = alpha
    ctx.strokeStyle = color
    ctx.lineWidth = width
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.beginPath()
    for (let i = 0; i < points.length; i += 1) {
      const [x, y] = points[i]
      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    }
    ctx.stroke()
    ctx.restore()
  }

  function texturedStroke(ctx, x1, y1, x2, y2, color, baseWidth) {
    ctx.save()
    ctx.strokeStyle = color
    ctx.lineWidth = baseWidth
    ctx.lineCap = 'round'
    ctx.shadowColor = color
    ctx.shadowBlur = baseWidth * 0.45
    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.stroke()
    ctx.restore()

    const pts1 = jitterPolyline(x1, y1, x2, y2, Math.max(18, Math.floor(baseWidth * 2)), 1.6)
    const pts2 = jitterPolyline(x1, y1, x2, y2, Math.max(18, Math.floor(baseWidth * 2)), 2.2)
    strokePolyline(ctx, pts1, color, baseWidth * 0.65, 0.85)
    strokePolyline(ctx, pts2, color, baseWidth * 0.35, 0.8)

    const dots = Math.floor(40 + baseWidth * 3)
    for (let i = 0; i < dots; i += 1) {
      const t = R()
      const x = x1 + (x2 - x1) * t
      const y = y1 + (y2 - y1) * t + (R() - 0.5) * 10
      const r = rand(0, baseWidth * 0.7)
      const ang = rand(0, Math.PI * 2)
      const px = x + Math.cos(ang) * r * 0.6
      const py = y + Math.sin(ang) * r * 0.6
      ctx.save()
      ctx.globalAlpha = rand(0.05, 0.18)
      ctx.fillStyle = color
      ctx.shadowColor = color
      ctx.shadowBlur = rand(1, 4)
      ctx.beginPath()
      ctx.arc(px, py, rand(0.6, 1.8), 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()
    }
  }

  function splatter(ctx, x, y, color, radius = 42) {
    const blobs = Math.floor(rand(6, 14))
    for (let i = 0; i < blobs; i += 1) {
      const ang = R() * Math.PI * 2
      const dist = Math.pow(R(), 0.55) * radius
      const px = x + Math.cos(ang) * dist
      const py = y + Math.sin(ang) * dist
      const rr = rand(0.8, 6)
      ctx.save()
      ctx.globalAlpha = rand(0.35, 0.85)
      ctx.fillStyle = color
      ctx.shadowColor = color
      ctx.shadowBlur = rand(2, 8)
      ctx.beginPath()
      ctx.arc(px, py, rr, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()
      if (R() > 0.65) {
        ctx.save()
        ctx.globalAlpha = rand(0.25, 0.55)
        ctx.strokeStyle = color
        ctx.lineWidth = rand(1, 2.5)
        ctx.beginPath()
        ctx.moveTo(px, py)
        ctx.lineTo(px + rand(-1, 1), py + rand(12, 28))
        ctx.stroke()
        ctx.restore()
      }
    }
  }

  function positionStrike() {
    const el = nameRef.current
    const cyan = svgCyanRef.current
    const pink = svgPinkRef.current
    const svgRoot = document.getElementById('v-strike-svg')
    if (!el || !cyan || !pink || !svgRoot) return
    const rect = el.getBoundingClientRect()
    const pad = 8
    const sx = window.scrollX || window.pageXOffset
    const sy = window.scrollY || window.pageYOffset
    svgRoot.style.left = `${rect.left - pad + sx}px`
    svgRoot.style.top = `${rect.top - pad + sy}px`
    svgRoot.setAttribute('width', `${rect.width + pad * 2}`)
    svgRoot.setAttribute('height', `${rect.height + pad * 2}`)
    const y = rect.height / 2 + pad
    const wobble = (offset) =>
      `M 8 ${y + offset - 6} C ${rect.width * 0.25} ${y + offset - 8}, ${rect.width * 0.75} ${y + offset - 4}, ${rect.width + pad - 8} ${y + offset - 2}`
    cyan.setAttribute('d', wobble(0))
    pink.setAttribute('d', wobble(0))
    pink.setAttribute('stroke-opacity', '0')
    const len = typeof cyan.getTotalLength === 'function' ? cyan.getTotalLength() : 300
    cyan.style.strokeOpacity = '0.35'
    cyan.style.strokeDasharray = `${len}`
    cyan.style.strokeDashoffset = `${len}`
    cyan.style.transition = 'stroke-dashoffset 450ms cubic-bezier(.2,.8,.2,1)'
  }

  function drawCanvasStrike(ctx, rect) {
    const sx = window.scrollX || window.pageXOffset
    const sy = window.scrollY || window.pageYOffset
    const x1 = rect.left - 20 + sx
    const x2 = rect.right + 40 + sx
    const midY = rect.top + rect.height * 0.45 + sy
    const tilt = (x2 - x1) * Math.tan((-7 * Math.PI) / 180)
    const y1 = midY - tilt / 2
    const y2 = midY + tilt / 2
    texturedStroke(ctx, x1, y1, x2, y2, JINX.pink, 9)
    for (let i = 0; i < 45; i += 1) {
      const t = R()
      const xx = x1 + (x2 - x1) * t
      const yy = y1 + (y2 - y1) * t + (R() - 0.5) * 10
      ctx.save()
      ctx.globalAlpha = 0.06 + R() * 0.08
      ctx.fillStyle = JINX.cyan
      ctx.shadowColor = JINX.cyan
      ctx.shadowBlur = 1 + R() * 3
      ctx.beginPath()
      ctx.arc(xx, yy, 0.6 + R() * 1.2, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()
    }
  }

  function paintDivCorners(ctx) {
    const nodes = Array.from(document.querySelectorAll('.rounded-2xl'))
    nodes.forEach((node, index) => {
      const prev = rngRef.current
      setRng(mulberry32((seed + index * 1013904223) >>> 0))
      if (R() < 0.35) {
        setRng(prev)
        return
      }
      const r = node.getBoundingClientRect()
      const sx = window.scrollX || window.pageXOffset
      const sy = window.scrollY || window.pageYOffset
      const corners = [
        { x: r.left + 10 + sx, y: r.top + 10 + sy, col: JINX.cyan },
        { x: r.right - 10 + sx, y: r.top + 10 + sy, col: R() > 0.5 ? JINX.pink : JINX.cyan },
        { x: r.left + 10 + sx, y: r.bottom - 10 + sy, col: R() > 0.5 ? JINX.pink : JINX.cyan },
        { x: r.right - 10 + sx, y: r.bottom - 10 + sy, col: JINX.pink },
      ]
      corners.forEach((corner) => {
        if (R() > 0.45) {
          splatter(ctx, corner.x, corner.y, corner.col, 28)
        }
      })
      setRng(prev)
    })
  }

  function vandalizeOnce() {
    setRng(mulberry32(seed))
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    positionStrike()
    const firstRect = nameRef.current?.getBoundingClientRect()
    if (!firstRect) return

    if (!struckRef.current) {
      requestAnimationFrame(() => {
        const cyan = svgCyanRef.current
        if (cyan) {
          cyan.style.strokeDashoffset = '0'
        }
      })
      drawCanvasStrike(ctx, firstRect)
      struckRef.current = true
    }

    const replacementNode = replacementRef.current
    if (replacementNode) {
      const container = nameRef.current.closest('div')
      const parentRect = container ? container.getBoundingClientRect() : firstRect
      const h1 = nameRef.current.parentElement
      const computed = h1 ? window.getComputedStyle(h1) : null
      const basePx = computed ? parseFloat(computed.fontSize || '64') : 64
      const scaled = Math.round(basePx * 1.18)
      const left = firstRect.left - parentRect.left + firstRect.width / 2
      const top = firstRect.bottom - parentRect.top + 10
      replacementNode.setAttribute(
        'style',
        `position:absolute; left:${left}px; transform:translateX(-50%) rotate(-1.5deg); top:${top}px; z-index:62; pointer-events:none; transition:opacity .2s; opacity:1; color:#a3d8ff; font-family: Impact, Haettenschweiler, 'Arial Black', sans-serif; font-weight:900; font-size:${scaled}px; line-height:${computed?.lineHeight || '1'}; letter-spacing:0.08em; text-shadow:0 1px 0 rgba(0,0,0,.2), 0 0 3px rgba(163,216,255,.55);`,
      )
      replacementNode.textContent = replacement.toUpperCase()
      const sx = window.scrollX || window.pageXOffset
      const sy = window.scrollY || window.pageYOffset
      const yspr = firstRect.bottom + sy + 14
      const xL = firstRect.left + sx
      const xR = firstRect.right + sx
      texturedStroke(ctx, xL, yspr, xR, yspr + rand(-1, 1), '#a3d8ff', 2.6)
    }

    const docWidth = Math.max(document.documentElement.scrollWidth, window.innerWidth)
    texturedStroke(
      ctx,
      Math.max(20, firstRect.left - 10 + (window.scrollX || window.pageXOffset)),
      firstRect.bottom + 10 + (window.scrollY || window.pageYOffset),
      Math.min(docWidth - 20, firstRect.right + 36 + (window.scrollX || window.pageXOffset)),
      firstRect.bottom + 10 + (window.scrollY || window.pageYOffset),
      JINX.cyan,
      6.5,
    )
    paintDivCorners(ctx)
  }

  const [firstName, ...rest] = String(name).split(' ')

  return (
    <span className="relative inline-flex flex-col">
      <span className="relative">
        <span ref={nameRef} id="v-first">
          {firstName}
        </span>
        {rest.length > 0 && ' '}
        <span>{rest.join(' ')}</span>
      </span>
      <span
        ref={replacementRef}
        id="v-replacement"
        className="absolute left-1/2 top-full -translate-x-1/2 text-base font-semibold opacity-0"
        style={{ pointerEvents: 'none' }}
        aria-hidden
      />
      <canvas
        id="v-canvas"
        ref={canvasRef}
        className="pointer-events-none fixed left-0 top-0 z-[60] h-full w-full"
      />
      <svg id="v-strike-svg" className="pointer-events-none fixed z-[61]" style={{ left: 0, top: 0 }}>
        <defs>
          <filter id="glowCyan" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="1.2" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="glowPink" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="1.2" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <path
          ref={svgCyanRef}
          d="M0 0 L100 0"
          stroke={JINX.cyan}
          strokeWidth={8}
          strokeLinecap="round"
          filter="url(#glowCyan)"
          style={{ strokeOpacity: 0, transition: 'all .35s ease' }}
        />
        <path
          ref={svgPinkRef}
          d="M0 0 L100 0"
          stroke={JINX.pink}
          strokeWidth={6}
          strokeLinecap="round"
          filter="url(#glowPink)"
          style={{ strokeOpacity: 0, transition: 'all .35s ease' }}
        />
      </svg>
    </span>
  )
}
