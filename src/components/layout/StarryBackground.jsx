import React, { useEffect, useRef } from 'react'

const StarryBackground = () => {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    let animationFrameId
    let stars = []
    
    let cachedGradient = null

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      cachedGradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
      cachedGradient.addColorStop(0, '#050509')
      cachedGradient.addColorStop(1, '#0f0f1a')
      initStars()
    }

    const initStars = () => {
      stars = []
      const numStars = Math.floor((canvas.width * canvas.height) / 3000)
      for (let i = 0; i < numStars; i++) {
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: Math.random() * 1.5,
          alpha: Math.random(),
          speed: Math.random() * 0.05 + 0.01
        })
      }
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      // Background gradient (cached, only recreated on resize)
      ctx.fillStyle = cachedGradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw stars
      stars.forEach(star => {
        ctx.beginPath()
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`
        ctx.fill()
        
        // Twinkle effect
        star.alpha += (Math.random() - 0.5) * 0.02
        if (star.alpha < 0.1) star.alpha = 0.1
        if (star.alpha > 1) star.alpha = 1
        
        // Movement
        star.y -= star.speed
        if (star.y < 0) {
          star.y = canvas.height
          star.x = Math.random() * canvas.width
        }
      })

      animationFrameId = requestAnimationFrame(draw)
    }

    window.addEventListener('resize', resizeCanvas)
    resizeCanvas()
    draw()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed inset-0 w-full h-full pointer-events-none z-0"
    />
  )
}

export default StarryBackground
