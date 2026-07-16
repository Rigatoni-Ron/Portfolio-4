import { useEffect, useRef, useState } from 'react'

/*
 * "I'm Aaron" header — pixel beads spelling the name, with a calm wind stream
 * of the same square pixels flowing across, brightening the beads it passes
 * through (and a fraction of them gently tug the name). Cursor still bulges it.
 *
 * Values are baked from the /prototypes/wind-header.html tuner (edit CFG here,
 * or keep tuning in that prototype and paste the "Copy values" JSON back in).
 * Canvas 2D. Keeps a real <h1> for a11y/SEO + a reduced-motion / no-canvas
 * fallback to the static heading.
 */

const REST = [237, 237, 239] // white pixel color
const GLOW = [57, 69, 101] // navy #394565 — disturbance glow
const SPARK = [224, 231, 255] // periwinkle #e0e7ff — idle sparks

const CFG = {
  // name
  square: 2, // bead size (css px)
  beadStep: 3, // name sampling stride (css px)
  restAlpha: 0.5, // resting bead brightness
  fontFit: 0.7, // name width as a fraction of the canvas (viewport) width

  // stream
  windCount: 26,
  windSize: 1.5,
  windAlpha: 1,
  baseWind: 0.025,
  turb: 0.05,
  noiseScale: 0.0016,
  timeScale: 0.07,
  windDamp: 0.94,

  // path (the ribbon the stream flows in)
  bandTop: 0.44,
  bandBottom: 0.56,
  bandWave: 46,
  bandWaveFreq: 0.004,
  bandWaveSpeed: 0.2,
  containment: 0.02,

  // interaction
  interactR: 55,
  glowGain: 0.76,
  gravityFraction: 0.25, // fraction of stream pixels that tug the name
  push: 0.26,
  deflect: 0.15,

  // cursor bulge
  mouseR: 160,
  mouseForce: 9,

  // electro character (alongside the wind)
  navyGlow: 1, // navy disturbance-glow amount
  sparkChance: 0.006, // per-frame chance of a lone idle spark
  clusterChance: 0.0012, // per-frame chance of a 2–3 spark burst
  sparkFrequency: 0.7, // multiplier on spark chances
  sparkDecay: 0.028,
  sparkSize: 1.2,
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
    let beads = []
    let wind = []
    let nameData = null
    let raf = 0
    let t = 0
    let visible = true
    const mouse = { cx: -1e5, cy: -1e5 }

    // additive glow sprites
    const makeGlow = (rgb) => {
      const c = document.createElement('canvas')
      c.width = c.height = 40
      const g = c.getContext('2d')
      const grd = g.createRadialGradient(20, 20, 0, 20, 20, 20)
      grd.addColorStop(0, `rgba(${rgb[0]},${rgb[1]},${rgb[2]},0.9)`)
      grd.addColorStop(1, `rgba(${rgb[0]},${rgb[1]},${rgb[2]},0)`)
      g.fillStyle = grd
      g.fillRect(0, 0, 40, 40)
      return c
    }
    const glowNavy = makeGlow(GLOW)
    const glowSpark = makeGlow(SPARK)

    function bandCenterAt(x, tt) {
      const c = (CFG.bandTop + CFG.bandBottom) / 2
      return H() * c + Math.sin(x * CFG.bandWaveFreq + tt * CFG.bandWaveSpeed) * CFG.bandWave * dpr
    }
    const H = () => PH
    function flowAngle(x, y, tt) {
      const s = CFG.noiseScale
      return (
        (Math.sin(x * s + tt * 0.3) +
          Math.cos(y * s * 1.3 - tt * 0.22) +
          Math.sin((x + y) * s * 0.6 + tt * 0.15) * 0.6) *
        1.7
      )
    }
    function nameAt(x, y) {
      const px = x | 0
      const py = y | 0
      if (px < 0 || py < 0 || px >= PW || py >= PH) return 0
      return nameData[(py * PW + px) * 4 + 3]
    }

    // spatial grid over bead home positions (rebuilt when beads change)
    let grid = new Map()
    let cell = 1
    const key = (cx, cy) => cx + ',' + cy
    function buildGrid() {
      cell = Math.max(4, CFG.interactR * dpr)
      grid = new Map()
      for (let i = 0; i < beads.length; i++) {
        const b = beads[i]
        const k = key((b.rx / cell) | 0, (b.ry / cell) | 0)
        let arr = grid.get(k)
        if (!arr) grid.set(k, (arr = []))
        arr.push(i)
      }
    }

    function build() {
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      const crect = canvas.getBoundingClientRect() // full-viewport-width canvas (+bleed)
      const wrect = wrap.getBoundingClientRect() // the visual band (font height cap)
      PW = canvas.width = Math.max(1, Math.round(crect.width * dpr))
      PH = canvas.height = Math.max(1, Math.round(crect.height * dpr))

      // sample the name, sized to fill ~fontFit of the width (epic) but capped
      // to the band height so it never overflows the reserved space
      const off = document.createElement('canvas')
      off.width = PW
      off.height = PH
      const o = off.getContext('2d')
      const family = getComputedStyle(document.body).fontFamily || 'sans-serif'
      let fs = wrect.height * dpr * 0.92
      const setFont = () => (o.font = `600 ${fs}px ${family}`)
      setFont()
      const targetW = PW * CFG.fontFit
      const tw = o.measureText(text).width
      if (tw > targetW) {
        fs *= targetW / tw
        setFont()
      }
      o.fillStyle = '#fff'
      o.textAlign = 'center'
      o.textBaseline = 'middle'
      o.fillText(text, PW / 2, PH / 2)
      nameData = o.getImageData(0, 0, PW, PH).data

      const step = Math.max(2, Math.round(CFG.beadStep * dpr))
      beads = []
      for (let y = 0; y < PH; y += step)
        for (let x = 0; x < PW; x += step)
          if (nameData[(y * PW + x) * 4 + 3] > 90)
            beads.push({ rx: x, ry: y, x, y, vx: 0, vy: 0, dist: 0, spark: 0 })
      buildGrid()

      wind = []
      for (let i = 0; i < CFG.windCount; i++) wind.push(spawnWind(true))
    }

    function spawnWind(anywhere) {
      const x = anywhere ? Math.random() * PW : -20 * dpr
      const off = (Math.random() + Math.random()) * 0.5 - 0.5 // center-weighted lane
      const bh = Math.max(4, (CFG.bandBottom - CFG.bandTop) * PH)
      return {
        x,
        off,
        y: bandCenterAt(x, t) + off * bh,
        vx: CFG.baseWind * dpr * (2 + Math.random() * 3),
        vy: 0,
        heavy: Math.random() < CFG.gravityFraction,
      }
    }

    function loop() {
      t += CFG.timeScale
      ctx.clearRect(0, 0, PW, PH)
      const rect = canvas.getBoundingClientRect()
      const rmx = (mouse.cx - rect.left) * dpr
      const rmy = (mouse.cy - rect.top) * dpr
      const SZ = CFG.square * dpr
      const WS = CFG.windSize * dpr
      const R = CFG.interactR * dpr
      const mR = CFG.mouseR * dpr
      const mF = CFG.mouseForce * dpr

      for (const p of wind) {
        const ang = flowAngle(p.x, p.y, t)
        p.vx += Math.cos(ang) * CFG.turb * dpr + CFG.baseWind * dpr
        p.vy += Math.sin(ang) * CFG.turb * dpr
        if (nameAt(p.x, p.y) > 40) {
          const k = 4 * dpr
          p.vx -= ((nameAt(p.x + k, p.y) - nameAt(p.x - k, p.y)) / 255) * CFG.deflect * dpr
          p.vy -= ((nameAt(p.x, p.y + k) - nameAt(p.x, p.y - k)) / 255) * CFG.deflect * dpr
        }
        const bh = (CFG.bandBottom - CFG.bandTop) * PH
        p.vy += (bandCenterAt(p.x, t) + p.off * bh - p.y) * CFG.containment
        p.vx *= CFG.windDamp
        p.vy *= CFG.windDamp
        p.x += p.vx
        p.y += p.vy

        const cx = (p.x / cell) | 0
        const cy = (p.y / cell) | 0
        for (let ox = -1; ox <= 1; ox++)
          for (let oy = -1; oy <= 1; oy++) {
            const arr = grid.get(key(cx + ox, cy + oy))
            if (!arr) continue
            for (const i of arr) {
              const b = beads[i]
              const dx = b.x - p.x
              const dy = b.y - p.y
              const d2 = dx * dx + dy * dy
              if (d2 < R * R) {
                const f = 1 - Math.sqrt(d2) / R
                if (p.heavy) {
                  b.vx += p.vx * CFG.push * f
                  b.vy += p.vy * CFG.push * f
                }
                const lit = f * CFG.glowGain
                if (lit > b.dist) b.dist = lit
              }
            }
          }

        if (p.x > PW + 20 * dpr || p.y < -60 * dpr || p.y > PH + 60 * dpr)
          Object.assign(p, spawnWind(false))
      }

      // idle sparks — random beads flash and kick (the electro life)
      if (beads.length) {
        if (Math.random() < CFG.sparkChance * CFG.sparkFrequency) {
          const b = beads[(Math.random() * beads.length) | 0]
          const a = Math.random() * Math.PI * 2
          b.vx += Math.cos(a) * (4 + Math.random() * 5) * dpr
          b.vy += Math.sin(a) * (4 + Math.random() * 5) * dpr
          b.spark = 0.75 + Math.random() * 0.25
        }
        if (Math.random() < CFG.clusterChance * CFG.sparkFrequency) {
          const n = 2 + ((Math.random() * 2) | 0)
          for (let i = 0; i < n; i++) {
            const b = beads[(Math.random() * beads.length) | 0]
            const a = Math.random() * Math.PI * 2
            b.vx += Math.cos(a) * (3 + Math.random() * 4) * dpr
            b.vy += Math.sin(a) * (3 + Math.random() * 4) * dpr
            b.spark = 0.6 + Math.random() * 0.4
          }
        }
      }

      for (const b of beads) {
        const dx = b.x - rmx
        const dy = b.y - rmy
        const d = Math.sqrt(dx * dx + dy * dy)
        if (d < mR && d > 0.1) {
          const f = ((mR - d) / mR) ** 2
          b.vx += (dx / d) * f * mF
          b.vy += (dy / d) * f * mF
          b.dist = Math.max(b.dist, f)
        }
        b.vx += (b.rx - b.x) * 0.06
        b.vy += (b.ry - b.y) * 0.06
        b.vx *= 0.86
        b.vy *= 0.86
        b.x += b.vx
        b.y += b.vy
        b.dist *= 0.92
        if (b.spark > 0) b.spark = Math.max(0, b.spark - CFG.sparkDecay)
      }

      ctx.globalCompositeOperation = 'source-over'
      ctx.fillStyle = `rgba(${REST[0]},${REST[1]},${REST[2]},${CFG.windAlpha})`
      for (const p of wind) ctx.fillRect(p.x - WS / 2, p.y - WS / 2, WS, WS)
      for (const b of beads) {
        const a = CFG.restAlpha + b.dist * (1 - CFG.restAlpha)
        ctx.fillStyle = `rgba(${REST[0]},${REST[1]},${REST[2]},${a})`
        ctx.fillRect(b.x - SZ / 2, b.y - SZ / 2, SZ, SZ)
      }
      // additive glows: navy where disturbed, periwinkle for sparks
      ctx.globalCompositeOperation = 'lighter'
      for (const b of beads) {
        if (b.dist > 0.06) {
          const g = (7 + b.dist * 15) * dpr
          ctx.globalAlpha = b.dist * CFG.navyGlow
          ctx.drawImage(glowNavy, b.x - g / 2, b.y - g / 2, g, g)
        }
        if (b.spark > 0.05) {
          const g = (10 + b.spark * 30) * CFG.sparkSize * dpr
          ctx.globalAlpha = b.spark
          ctx.drawImage(glowSpark, b.x - g / 2, b.y - g / 2, g, g)
        }
      }
      ctx.globalAlpha = 1

      // spark cores (periwinkle, on top)
      ctx.globalCompositeOperation = 'source-over'
      for (const b of beads)
        if (b.spark > 0.05) {
          const sz = SZ * (1 + b.spark * 3)
          ctx.fillStyle = `rgba(${SPARK[0]},${SPARK[1]},${SPARK[2]},${Math.min(b.spark + 0.2, 1)})`
          ctx.fillRect(b.x - sz / 2, b.y - sz / 2, sz, sz)
        }
      if (visible) raf = requestAnimationFrame(loop)
    }

    const onMove = (e) => {
      mouse.cx = e.clientX
      mouse.cy = e.clientY
    }
    const onLeave = () => {
      mouse.cx = mouse.cy = -1e5
    }

    let resizeTimer = 0
    const ro = new ResizeObserver(() => {
      clearTimeout(resizeTimer)
      resizeTimer = setTimeout(build, 150)
    })
    ro.observe(wrap)

    // Pause the loop when the header scrolls out of view (saves CPU/battery,
    // and stops competing with a fullscreen Playground component for the CPU).
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !visible) {
        visible = true
        raf = requestAnimationFrame(loop)
      } else if (!entry.isIntersecting && visible) {
        visible = false
        cancelAnimationFrame(raf)
      }
    })
    io.observe(wrap)

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseleave', onLeave)

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
      io.disconnect()
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseleave', onLeave)
    }
  }, [text])

  return (
    <div className="particle-header" ref={wrapRef} data-mode={mode}>
      <canvas ref={canvasRef} className="particle-canvas" aria-hidden="true" />
      <h1 className="particle-fallback">{text}</h1>
    </div>
  )
}
