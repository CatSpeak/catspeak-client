import React, { useEffect, useRef } from "react"

/**
 * ConfettiCanvas
 *
 * Lightweight canvas-based confetti effect using requestAnimationFrame.
 * No external dependencies. Uses CatSpeak brand colors.
 * Automatically stops after `durationMs` milliseconds.
 *
 * @param {number} [durationMs=2500]  - How long confetti runs (ms)
 * @param {number} [count=80]         - Number of confetti particles
 */

const BRAND_COLORS = [
  "#990011", // cath-red-700
  "#c00015", // cath-red-900
  "#f08d1d", // cath-orange-400
  "#f4ab1b", // cath-orange-500
  "#ffc107", // cath-yellow-500
  "#ffffff", // white accent
  "#ffcccc", // soft pink
]

function randomBetween(a, b) {
  return a + Math.random() * (b - a)
}

function createParticle(width) {
  return {
    x: randomBetween(0, width),
    y: randomBetween(-20, -5),
    w: randomBetween(6, 12),
    h: randomBetween(4, 8),
    color: BRAND_COLORS[Math.floor(Math.random() * BRAND_COLORS.length)],
    vx: randomBetween(-1.5, 1.5),
    vy: randomBetween(2, 5),
    angle: randomBetween(0, Math.PI * 2),
    angularVelocity: randomBetween(-0.1, 0.1),
    opacity: 1,
    fade: randomBetween(0.004, 0.01),
  }
}

const ConfettiCanvas = ({ durationMs = 2500, count = 80 }) => {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    const W = canvas.offsetWidth
    const H = canvas.offsetHeight
    canvas.width = W
    canvas.height = H

    let particles = Array.from({ length: count }, () => createParticle(W))
    let rafId
    const startTime = Date.now()

    const draw = () => {
      ctx.clearRect(0, 0, W, H)

      const elapsed = Date.now() - startTime

      particles = particles.filter((p) => p.opacity > 0)

      for (const p of particles) {
        p.x += p.vx
        p.y += p.vy
        p.angle += p.angularVelocity

        // Fade out near end of duration
        if (elapsed > durationMs * 0.6) {
          p.opacity = Math.max(0, p.opacity - p.fade * 2)
        }

        // Wrap horizontally
        if (p.x > W + 20) p.x = -20
        if (p.x < -20) p.x = W + 20

        ctx.save()
        ctx.globalAlpha = p.opacity
        ctx.translate(p.x, p.y)
        ctx.rotate(p.angle)
        ctx.fillStyle = p.color
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h)
        ctx.restore()
      }

      if (elapsed < durationMs || particles.length > 0) {
        rafId = requestAnimationFrame(draw)
      }
    }

    rafId = requestAnimationFrame(draw)

    return () => cancelAnimationFrame(rafId)
  }, [count, durationMs])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 1299 }} // Below modal (z-1300) but above room
      aria-hidden="true"
    />
  )
}

export default ConfettiCanvas
