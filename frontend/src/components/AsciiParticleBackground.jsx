import { useEffect, useRef } from 'react'

const glyphs = ['$', '¢', '€', '£', '¥', '₹', '₩', '₿', '%', '+']

function createParticle(width, height) {
  return {
    x: Math.random() * width,
    y: Math.random() * height,
    vx: (Math.random() - 0.5) * 0.12,
    vy: (Math.random() - 0.5) * 0.12,
    size: 12 + Math.random() * 30,
    alpha: 0.08 + Math.random() * 0.14,
    glyph: glyphs[Math.floor(Math.random() * glyphs.length)],
  }
}

export default function AsciiParticleBackground() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return undefined

    const context = canvas.getContext('2d')
    if (!context) return undefined

    let animationFrame = 0
    let particles = []
    let width = 0
    let height = 0

    function resize() {
      const rect = canvas.getBoundingClientRect()
      const ratio = window.devicePixelRatio || 1
      width = rect.width
      height = rect.height
      canvas.width = Math.max(1, Math.floor(rect.width * ratio))
      canvas.height = Math.max(1, Math.floor(rect.height * ratio))
      context.setTransform(ratio, 0, 0, ratio, 0, 0)
      particles = Array.from({ length: Math.max(80, Math.floor((width * height) / 18000)) }, () => createParticle(width, height))
    }

    function render() {
      context.clearRect(0, 0, width, height)

      const glow = context.createRadialGradient(width * 0.52, height * 0.5, 0, width * 0.52, height * 0.5, Math.max(width, height) * 0.5)
      glow.addColorStop(0, 'rgba(102, 221, 132, 0.08)')
      glow.addColorStop(0.45, 'rgba(102, 221, 132, 0.03)')
      glow.addColorStop(1, 'rgba(0, 0, 0, 0)')
      context.fillStyle = glow
      context.fillRect(0, 0, width, height)

      for (const particle of particles) {
        particle.x += particle.vx
        particle.y += particle.vy

        if (particle.x < -40) particle.x = width + 40
        if (particle.x > width + 40) particle.x = -40
        if (particle.y < -40) particle.y = height + 40
        if (particle.y > height + 40) particle.y = -40

        context.save()
        context.translate(particle.x, particle.y)
        context.rotate((particle.x + particle.y) * 0.0004)
        context.font = `600 ${particle.size}px Satoshi, sans-serif`
        context.fillStyle = `rgba(102, 221, 132, ${particle.alpha})`
        context.fillText(particle.glyph, 0, 0)
        context.restore()
      }

      for (let index = 0; index < 9; index += 1) {
        const y = (height / 8) * index + (Date.now() * 0.01) % 28
        context.beginPath()
        context.moveTo(0, y)
        context.lineTo(width, y - 30)
        context.strokeStyle = 'rgba(102, 221, 132, 0.025)'
        context.lineWidth = 1
        context.stroke()
      }

      animationFrame = window.requestAnimationFrame(render)
    }

    resize()
    render()

    window.addEventListener('resize', resize)
    return () => {
      window.removeEventListener('resize', resize)
      window.cancelAnimationFrame(animationFrame)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
      }}
    />
  )
}
