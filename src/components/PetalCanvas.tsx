import { useEffect, useRef } from 'react'

/**
 * Rose petals drifting across the page. Rendered on a single fixed canvas
 * behind all content. Fully disabled when the visitor prefers reduced
 * motion (a soft static mauve wash remains from the body background).
 */

type Petal = {
  /** 0 = the teardrop template, 1/2 = rounder variants */
  template: number
  x: number
  y: number
  /** final scale of the ~20px template, so depth reads strongly */
  scale: number
  /** base rotation; spin oscillates around it */
  angle: number
  phase: number
  frequency: number
  /** sway amplitude in px */
  sway: number
  opacity: number
  /** px/ms (~7–20 px/s fall) */
  speed: number
  dx: number
  dy: number
}

const TEMPLATES = [
  // 0 — long teardrop petal with a notched, curled tip
  "M0 -10 C6.2 -7.5 9 -0.5 5.4 6.2 C3.4 9.8 -2.4 10.4 -5 6.8 C-8.6 1.4 -6.4 -7 0 -10",
  // 1 — rounder petal
  "M0 -9 C7.5 -7 10 1 6 6.5 C3 10.5 -4 10.5 -6.5 6 C-9.5 0.5 -7.5 -6.8 0 -9",
  // 2 — slim fallen petal
  'M0 -8 C4.5 -6.5 6.5 0 4 5.5 C2.2 9.5 -3 9.5 -4.8 5.2 C-7 -0.5 -4.8 -6.4 0 -8',
]

const PALETTE = [
  [217, 154, 166],
  [201, 128, 141],
  [232, 191, 199],
  [184, 105, 122],
]

const MARGIN = 60 // px beyond the viewport where petals spawn / despawn

function makePetal(width: number, height: number, initial: boolean): Petal {
  const template = Math.floor(Math.random() * TEMPLATES.length)
  const scale = 0.45 + Math.random() * 0.95
  const spinRate = 1.5 + Math.random() * 2.2 // oscillations/sec of the sway
  const speedPxPerSec = 7 + Math.random() * 13
  return {
    template,
    x: Math.random() * (width + MARGIN * 2) - MARGIN,
    y: initial ? Math.random() * height : -MARGIN - Math.random() * height * 0.4,
    scale,
    angle: Math.random() * Math.PI * 2,
    phase: Math.random() * Math.PI * 2,
    frequency: spinRate / (speedPxPerSec / 12), // slower petals rock slower
    sway: 26 + Math.random() * 42,
    opacity: 0.35 + Math.random() * 0.45,
    speed: speedPxPerSec / 1000,
    dx: -14 + Math.random() * 28, // px/s drift, mostly sideways
    dy: 0, // set below from fall speed
  }
}

/** Resize the canvas and, if empty, seed a fresh field of petals. */
function reset(canvas: HTMLCanvasElement, petals: Petal[]): { w: number; h: number } {
  const w = window.innerWidth
  const h = window.innerHeight
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  canvas.width = Math.round(w * dpr)
  canvas.height = Math.round(h * dpr)
  canvas.style.width = '100%'
  canvas.style.height = '100%'
  canvas
    .getContext('2d')
    ?.scale(dpr, dpr)

  petals.length = 0
  const count = Math.round(Math.min(30, Math.max(14, (w * h) / 62000)))
  for (let i = 0; i < count; i += 1) petals.push(makePetal(w, h, true))
  return { w, h }
}

export function PetalCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    // Reduced motion: leave the canvas blank — the static mauve washes on
    // the body background still carry the romantic atmosphere.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const maybeCtx = canvas.getContext('2d')
    if (!maybeCtx) return
    // Bind narrowed non-null values so the animation closures below can
    // use them without re-checking.
    const ctx: CanvasRenderingContext2D = maybeCtx
    const el: HTMLCanvasElement = canvas

    const petals: Petal[] = []
    let { w, h } = reset(el, petals)

    let frame = 0
    let last = performance.now()

    function tick(now: number) {
      const dt = Math.min(now - last, 60)
      last = now

      ctx.clearRect(0, 0, w, h)
      for (const petal of petals) {
        // Fall with a pendulum-like sway.
        const advance = petal.speed * dt
        petal.phase += advance * petal.frequency * 0.09
        petal.x += (petal.dx / 1000) * dt + Math.cos(petal.phase) * 0.35
        petal.y += advance
        petal.angle += Math.sin(petal.phase) * 0.02

        if (petal.y > h + MARGIN || petal.x < -MARGIN || petal.x > w + MARGIN) {
          const fresh = makePetal(w, h, false)
          Object.assign(petal, fresh)
        }

        const c = PALETTE[petal.template]
        ctx.save()
        ctx.translate(petal.x, petal.y)
        ctx.rotate(petal.angle + Math.sin(petal.phase) * 0.55)
        ctx.scale(petal.scale, petal.scale)
        ctx.fillStyle = `rgba(${c[0]}, ${c[1]}, ${c[2]}, ${petal.opacity})`
        ctx.fill(new Path2D(TEMPLATES[petal.template]))
        ctx.restore()
      }
      frame = requestAnimationFrame(tick)
    }

    function handleResize() {
      const size = reset(el, petals)
      w = size.w
      h = size.h
    }

    frame = requestAnimationFrame(tick)
    window.addEventListener('resize', handleResize)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="petal-canvas"
    />
  )
}
