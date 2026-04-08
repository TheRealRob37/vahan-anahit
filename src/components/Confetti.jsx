import { useEffect, useRef } from 'react'

const PARTICLES = 120
const COLORS = [
  'rgba(201,146,42,0.85)',   // gold
  'rgba(228,196,130,0.8)',   // light gold
  'rgba(255,220,180,0.75)',  // pale peach
  'rgba(220,160,140,0.75)',  // rose
  'rgba(255,255,255,0.6)',   // white
]

function randomBetween(a, b) {
  return a + Math.random() * (b - a)
}

export default function Confetti() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let raf

    const resize = () => {
      canvas.width  = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const particles = Array.from({ length: PARTICLES }, () => ({
      x:       randomBetween(0, window.innerWidth),
      y:       randomBetween(-window.innerHeight, 0),
      w:       randomBetween(5, 11),
      h:       randomBetween(3, 7),
      color:   COLORS[Math.floor(Math.random() * COLORS.length)],
      speed:   randomBetween(1.2, 3.2),
      drift:   randomBetween(-0.6, 0.6),
      angle:   randomBetween(0, Math.PI * 2),
      spin:    randomBetween(-0.04, 0.04),
      opacity: 1,
    }))

    let start = null
    const DURATION = 6000 // total animation ms

    const draw = (ts) => {
      if (!start) start = ts
      const elapsed = ts - start
      const fade = Math.max(0, 1 - (elapsed - 4000) / 2000)

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      particles.forEach(p => {
        p.y     += p.speed
        p.x     += p.drift
        p.angle += p.spin

        if (p.y > canvas.height + 20) {
          p.y = -10
          p.x = randomBetween(0, canvas.width)
        }

        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate(p.angle)
        ctx.globalAlpha = fade
        ctx.fillStyle = p.color
        ctx.beginPath()
        ctx.ellipse(0, 0, p.w / 2, p.h / 2, 0, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      })

      if (elapsed < DURATION) {
        raf = requestAnimationFrame(draw)
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
      }
    }

    raf = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 100 }}
    />
  )
}
