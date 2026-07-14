import { useEffect, useRef, useState } from 'react'

/*
 * Electro pixel-bead header. Adapted from Aaron's "Electro Pixel Bead Shader"
 * (Canvas 2D). Beads rest dim, glow when displaced by the cursor, and randomly
 * spark on their own so the header feels alive at idle.
 *
 * Performance note: the original glowed beads with per-bead ctx.shadowBlur,
 * which is very slow when many beads glow at once (an active hover). Here the
 * glow is a pre-rendered radial sprite blitted additively ('lighter'), which
 * looks the same but costs a fraction as much.
 */

const CFG = {
  step: 3, // sampling stride in css px (× dpr) — lower = denser beads
  beadSize: 1.5, // css px (× dpr)
  mouseRadius: 90, // css px
  force: 11,
  spring: 0.058,
  damping: 0.855,
  sparkChance: 0.006, // per-frame chance of a lone spark
  clusterChance: 0.0012, // per-frame chance of a 2–3 bead burst
  sparkDecay: 0.028,
}

// Palette (cool "electro" glow, restrained to fit the dark UI).
const REST = 'rgba(150,153,170,0.52)'
const GLOW = [130, 165, 255] // displacement glow (periwinkle)
const SPARK = [255, 252, 245] // spark flash (warm white)

function makeGlowSprite(rgb, size) {
  const c = document.createElement('canvas')
  c.width = c.height = size
  const g = c.getContext('2d')
  const grd = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  grd.addColorStop(0, `rgba(${rgb[0]},${rgb[1]},${rgb[2]},1)`)
  grd.addColorStop(1, `rgba(${rgb[0]},${rgb[1]},${rgb[2]},0)`)
  g.fillStyle = grd
  g.fillRect(0, 0, size, size)
  return c
}

export default function ParticleHeader({ text = 'I’m Aaron' }) {
  const wrapRef = useRef(null)
  const canvasRef = useRef(null)
  const [mode, setMode] = useState('particles')

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setMode('static')
      return
    }
    const canvas = canvasRef.current
    const wrap = wrapRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      setMode('static')
      return
    }

    let dpr = Math.min(window.devicePixelRatio || 1, 2)
    let PW = 0
    let PH = 0
    let particles = []
    let raf = 0
    const mouse = { x: -1e4, y: -1e4 }

    const glowBlue = makeGlowSprite(GLOW, 48)
    const glowSpark = makeGlowSprite(SPARK, 48)

    function build() {
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      // The canvas is taller than its layout slot (CSS bleed) so pushed beads
      // aren't clipped. Draw across the whole canvas, but size the text to the
      // shorter visual band (the wrapper), centered in the canvas.
      const crect = canvas.getBoundingClientRect()
      const wrect = wrap.getBoundingClientRect()
      PW = canvas.width = Math.max(1, Math.round(crect.width * dpr))
      PH = canvas.height = Math.max(1, Math.round(crect.height * dpr))
      // Note: canvas display size is CSS-driven (100% / calc), so it stays
      // responsive — we only set the backing-store resolution here.

      // Sample the text on an offscreen canvas.
      const off = document.createElement('canvas')
      off.width = PW
      off.height = PH
      const o = off.getContext('2d')
      const family = getComputedStyle(document.body).fontFamily || 'sans-serif'
      let fs = wrect.height * dpr * 0.66
      const setFont = () => (o.font = `600 ${fs}px ${family}`)
      setFont()
      const maxW = PW * 0.92
      const tw = o.measureText(text).width
      if (tw > maxW) {
        fs *= maxW / tw
        setFont()
      }
      o.fillStyle = 'white'
      o.textAlign = 'center'
      o.textBaseline = 'middle'
      o.fillText(text, PW / 2, PH / 2)

      const img = o.getImageData(0, 0, PW, PH).data
      const step = Math.max(2, Math.round(CFG.step * dpr))
      const scatter = 100 * dpr
      particles = []
      for (let y = 0; y < PH; y += step) {
        for (let x = 0; x < PW; x += step) {
          if (img[(y * PW + x) * 4 + 3] > 80) {
            particles.push({
              rx: x,
              ry: y,
              x: x + (Math.random() - 0.5) * scatter,
              y: y + (Math.random() - 0.5) * scatter,
              vx: 0,
              vy: 0,
              spark: 0,
            })
          }
        }
      }
    }

    function loop() {
      ctx.clearRect(0, 0, PW, PH)
      const rect = canvas.getBoundingClientRect()
      const rmx = (mouse.x - rect.left) * dpr
      const rmy = (mouse.y - rect.top) * dpr
      const R = CFG.mouseRadius * dpr
      const FORCE = CFG.force * dpr
      const SZ = CFG.beadSize * dpr

      // physics
      for (const p of particles) {
        const dx = p.x - rmx
        const dy = p.y - rmy
        const d = Math.sqrt(dx * dx + dy * dy)
        if (d < R && d > 0.1) {
          const f = ((R - d) / R) ** 2
          p.vx += (dx / d) * f * FORCE
          p.vy += (dy / d) * f * FORCE
        }
        p.vx += (p.rx - p.x) * CFG.spring
        p.vy += (p.ry - p.y) * CFG.spring
        p.vx *= CFG.damping
        p.vy *= CFG.damping
        p.x += p.vx
        p.y += p.vy
        if (p.spark > 0) p.spark = Math.max(0, p.spark - CFG.sparkDecay)
      }

      // ambient sparks — the idle "electro" life
      if (particles.length) {
        if (Math.random() < CFG.sparkChance) {
          const p = particles[(Math.random() * particles.length) | 0]
          const a = Math.random() * Math.PI * 2
          p.vx += Math.cos(a) * (4 + Math.random() * 5) * dpr
          p.vy += Math.sin(a) * (4 + Math.random() * 5) * dpr
          p.spark = 0.75 + Math.random() * 0.25
        }
        if (Math.random() < CFG.clusterChance) {
          const n = 2 + ((Math.random() * 2) | 0)
          for (let i = 0; i < n; i++) {
            const p = particles[(Math.random() * particles.length) | 0]
            const a = Math.random() * Math.PI * 2
            p.vx += Math.cos(a) * (3 + Math.random() * 4) * dpr
            p.vy += Math.sin(a) * (3 + Math.random() * 4) * dpr
            p.spark = 0.6 + Math.random() * 0.4
          }
        }
      }

      // pass 1 — resting beads (cheap, no glow)
      ctx.globalCompositeOperation = 'source-over'
      ctx.fillStyle = REST
      for (const p of particles) {
        const disp = (p.x - p.rx) ** 2 + (p.y - p.ry) ** 2
        if (disp < 25 && p.spark <= 0.05) {
          ctx.fillRect(p.x - SZ * 0.5, p.y - SZ * 0.5, SZ, SZ)
        }
      }

      // pass 2 — additive glow for displaced beads + sparks (sprite blit)
      ctx.globalCompositeOperation = 'lighter'
      for (const p of particles) {
        const disp = Math.sqrt((p.x - p.rx) ** 2 + (p.y - p.ry) ** 2)
        if (disp >= 5) {
          const t = Math.min(disp / (45 * dpr), 1)
          const g = (14 + t * 26) * dpr
          ctx.globalAlpha = 0.35 + t * 0.5
          ctx.drawImage(glowBlue, p.x - g / 2, p.y - g / 2, g, g)
        }
        if (p.spark > 0.05) {
          const g = (18 + p.spark * 40) * dpr
          ctx.globalAlpha = p.spark
          ctx.drawImage(glowSpark, p.x - g / 2, p.y - g / 2, g, g)
        }
      }
      ctx.globalAlpha = 1

      // pass 3 — bright cores on top
      ctx.globalCompositeOperation = 'source-over'
      for (const p of particles) {
        const disp = Math.sqrt((p.x - p.rx) ** 2 + (p.y - p.ry) ** 2)
        if (p.spark > 0.05) {
          const sz = SZ * (1 + p.spark * 3)
          ctx.fillStyle = `rgba(255,255,255,${Math.min(p.spark + 0.2, 1)})`
          ctx.fillRect(p.x - sz * 0.5, p.y - sz * 0.5, sz, sz)
        } else if (disp >= 5) {
          const t = Math.min(disp / (45 * dpr), 1)
          const r = Math.round(190 + t * 60)
          const g = Math.round(200 + t * 50)
          ctx.fillStyle = `rgba(${r},${g},255,${0.6 + t * 0.4})`
          ctx.fillRect(p.x - SZ * 0.55, p.y - SZ * 0.55, SZ * 1.1, SZ * 1.1)
        }
      }

      raf = requestAnimationFrame(loop)
    }

    const onMove = (e) => {
      mouse.x = e.clientX
      mouse.y = e.clientY
    }

    let resizeTimer = 0
    const ro = new ResizeObserver(() => {
      clearTimeout(resizeTimer)
      resizeTimer = setTimeout(build, 150)
    })
    ro.observe(wrap)
    window.addEventListener('mousemove', onMove)

    const start = () => {
      build()
      raf = requestAnimationFrame(loop)
    }
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => setTimeout(start, 40))
    } else {
      start()
    }

    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(resizeTimer)
      ro.disconnect()
      window.removeEventListener('mousemove', onMove)
    }
  }, [text])

  return (
    <div className="particle-header" ref={wrapRef} data-mode={mode}>
      <canvas ref={canvasRef} className="particle-canvas" aria-hidden="true" />
      <h1 className="particle-fallback">{text}</h1>
    </div>
  )
}
