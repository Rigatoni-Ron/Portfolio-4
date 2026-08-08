import { useEffect, useMemo, useRef } from 'react'
import { SHAPES, buildShape } from './shapes.js'

// A 3D line-drawing engine in SVG.
//
// SVG has no notion of 3D, so we do the whole pipeline by hand and it's about
// forty lines: rotate points with a matrix, divide by depth to project, write
// the result into a `d` attribute. Sixty times a second.
//
// Two rules this follows, both from NOTES.md:
//   - the loop never touches React state; it writes to DOM nodes through refs
//   - motion is delta-time based, so it runs the same on a 60Hz and 120Hz panel

// Camera. Distance from the object and focal length; together they set how
// much the far side of the shape shrinks. Wider gap = flatter, more isometric.
const CAM_D = 7.5
const CAM_F = 5.1
// True isometric elevation: atan(1/sqrt(2)) — the angle every axonometric
// technical drawing is set at. Kept as the camera's elevation even though the
// projection is perspective, because it's the angle that reads as a drawing.
export const ISO_TILT = Math.atan(1 / Math.SQRT2)
// Reference range for the depth fade. Fixed rather than measured per frame so
// the gradient doesn't re-normalise (and visibly pump) mid-morph.
const Z_RANGE = 1.4

const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2)
const easeOut = (t) => 1 - (1 - t) ** 3
const round = (v) => Math.round(v * 100) / 100

export default function Wireframe({
  shape = 0,
  size = 440,
  // geometry resolution
  rings = 9,
  points = 72,
  segments = 10, // depth slices per ring — more slices, smoother gradient
  verts = 8, // meridian lines connecting the rings
  // motion
  spin = 0.34, // turns per second
  tilt = ISO_TILT, // radians on the X axis — positive looks down on the shape
  morphMs = 1500,
  revealTurn = Math.PI, // extra rotation spent *during* a morph — the "reveal"
  drawIn = true,
  interactive = true, // drag to orbit
  paused = false, // for the backlog item: freeze the tiles while a modal is open
  // look
  ortho = false, // true switches to a parallel (isometric) projection
  depth = 0.8, // how hard the far side fades. 0 = flat wireframe
  backface = 0.06, // floor on that fade, so the far side never fully vanishes
  strokeWidth = 1.25,
  className,
}) {
  const svgRef = useRef(null)
  const pathsRef = useRef([])

  // Every shape, pre-expanded at the current resolution. Rebuilt only when the
  // resolution changes — never per frame.
  const geo = useMemo(() => SHAPES.map((s) => buildShape(s, rings, points)), [rings, points])

  // Live tunables the loop reads. Mirrored into a ref so dragging a slider
  // doesn't tear down and restart the animation.
  const opts = useRef({})
  opts.current = { spin, tilt, morphMs, revealTurn, ortho, depth, backface, strokeWidth, rings, points, segments, verts, size, paused }

  // Mutable animation state, all outside React.
  const st = useRef({
    buf: null, // current interpolated geometry
    from: null, // snapshot taken when a morph starts
    to: null,
    morphT: 0, // 0..1, or >=1 when settled
    angle: 0, // accumulated spin
    reveals: 0, // rotation banked from completed morphs
    tilt: 0,
    drag: null,
    born: 0,
  })

  const prev = useRef({ geo: null })

  useEffect(() => {
    const s = st.current
    const src = geo[shape] ?? geo[0]

    if (prev.current.geo !== geo) {
      // Resolution changed (or first mount). Hard reset — the path elements
      // are new DOM nodes, so replay the draw-on rather than morphing.
      s.buf = src.map((ring) => ring.map((p) => [...p]))
      s.from = src.map((ring) => ring.map((p) => [...p]))
      s.to = src
      s.morphT = 1
      s.pending = false
      s.born = performance.now()
    } else {
      // Shape changed. Morph from whatever is *currently* on screen, not from
      // the previous shape, so rapid clicks chain instead of snapping. An
      // interrupted morph banks the rotation it already earned, so the reveal
      // spin stays continuous through the interruption.
      if (s.morphT < 1) s.reveals += opts.current.revealTurn * easeInOut(s.morphT)
      for (let i = 0; i < s.buf.length; i++) {
        for (let j = 0; j < s.buf[i].length; j++) {
          s.from[i][j][0] = s.buf[i][j][0]
          s.from[i][j][1] = s.buf[i][j][1]
          s.from[i][j][2] = s.buf[i][j][2]
        }
      }
      s.to = src
      s.morphT = 0
      s.pending = true
    }
    prev.current.geo = geo
  }, [geo, shape])

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const s = st.current
    s.tilt = opts.current.tilt
    let raf = 0
    let last = performance.now()

    const frame = (now) => {
      raf = requestAnimationFrame(frame)
      const o = opts.current
      // Frozen: bail before any work, and swallow the elapsed time so the
      // shape doesn't lurch forward when it resumes. (No offscreen check —
      // NOTES has that under Settled: measured, and the saving is negligible
      // on a page barely taller than the viewport.)
      if (o.paused) {
        last = now
        return
      }
      const dt = Math.min((now - last) / 1000, 0.05) // clamp tab-switch jumps
      last = now
      const paths = pathsRef.current
      if (!s.buf || !paths.length) return

      // --- advance time -------------------------------------------------
      if (s.morphT < 1) {
        s.morphT = Math.min(1, s.morphT + dt * (1000 / o.morphMs))
      }
      const mp = easeInOut(s.morphT)

      if (!reduced && !s.drag) s.angle += dt * o.spin * Math.PI * 2
      s.tilt += (o.tilt - s.tilt) * Math.min(1, dt * 8)

      // The reveal: a morph also spends `revealTurn` of extra rotation, eased
      // on the same curve. The shape turns *as* it changes, so the new form
      // comes around into view rather than cross-fading in place.
      if (s.morphT >= 1 && s.pending) {
        s.reveals += o.revealTurn
        s.pending = false
      }
      const reveal = s.reveals + (s.morphT < 1 ? o.revealTurn * mp : 0)

      const yaw = s.angle + reveal + (s.drag?.yaw ?? 0)
      const pitch = s.tilt + (s.drag?.pitch ?? 0)

      // --- morph, rotate, project ---------------------------------------
      const cy = Math.cos(yaw)
      const sy = Math.sin(yaw)
      const cx = Math.cos(pitch)
      const sx = Math.sin(pitch)
      const half = o.size / 2
      // Orthographic has no perspective divide shrinking the object, so it
      // needs a smaller factor to occupy the same box as the perspective one.
      const scale = o.size * (o.ortho ? 0.31 : 0.42)
      const buf = s.buf
      const from = s.from
      const to = s.to
      const R = buf.length
      const P = buf[0].length

      // Reuse one flat projected array: [screenX, screenY, depth] per point.
      const proj = s.proj && s.proj.length === R * P * 3 ? s.proj : (s.proj = new Float32Array(R * P * 3))

      for (let i = 0; i < R; i++) {
        for (let j = 0; j < P; j++) {
          const a = from[i][j]
          const b = to[i][j]
          const x0 = a[0] + (b[0] - a[0]) * mp
          const y0 = a[1] + (b[1] - a[1]) * mp
          const z0 = a[2] + (b[2] - a[2]) * mp
          const p = buf[i][j]
          p[0] = x0
          p[1] = y0
          p[2] = z0

          // Yaw about Y, then pitch about X. The pitch tips the far side of
          // the object *down* the screen, which is what looking down on
          // something does — the other sign shows you its underside.
          const x1 = x0 * cy + z0 * sy
          const z1 = -x0 * sy + z0 * cy
          const y2 = y0 * cx + z1 * sx
          const z2 = z1 * cx - y0 * sx

          // Perspective. Orthographic is the more literal match for technical
          // illustration, but with the far side already dimmed by the depth
          // fade, the size falloff is what makes the form feel like it has
          // volume rather than being a flat pattern. `ortho` keeps the
          // parallel projection available.
          const k = o.ortho ? scale : (CAM_F / (CAM_D + z2)) * scale
          const o3 = (i * P + j) * 3
          proj[o3] = half + x1 * k
          proj[o3 + 1] = half - y2 * k
          proj[o3 + 2] = z2
        }
      }

      // --- write paths ----------------------------------------------------
      // Each ring is sliced into a fixed number of segments and each segment
      // is dimmed by its own depth. The slice boundaries are fixed indices,
      // which is the whole point: an earlier version drew one front arc and
      // one back arc split at the silhouette, and because that split lands on
      // a whole sample it hopped a few degrees at a time as the shape turned —
      // reading as a shake on anything with a smooth circular edge. Fixed
      // boundaries can't hop, and a per-segment fade gives a gradient around
      // the form instead of a hard front/back edge.
      const per = P / o.segments
      const fadeK = o.depth / (Z_RANGE * 2)
      const dim = (z) => Math.max(o.backface, 1 - (z + Z_RANGE) * fadeK)
      let n = 0

      for (let i = 0; i < R; i++) {
        const base = i * P * 3
        for (let sIdx = 0; sIdx < o.segments; sIdx++) {
          const el = paths[n++]
          if (!el) continue
          const start = Math.round(sIdx * per)
          const end = Math.round((sIdx + 1) * per)
          let d = ''
          let zSum = 0
          for (let j = start; j <= end; j++) {
            const o3 = base + (j % P) * 3
            d += (j === start ? 'M' : 'L') + round(proj[o3]) + ' ' + round(proj[o3 + 1])
            zSum += proj[o3 + 2]
          }
          el.setAttribute('d', d)
          el.style.opacity = dim(zSum / (end - start + 1))
        }
      }

      // Meridians. A meridian sits at one angle, so its whole length shares a
      // depth — one average decides it.
      for (let c = 0; c < o.verts; c++) {
        const el = paths[n++]
        if (!el) continue
        const col = Math.round((c * P) / o.verts) % P
        let d = ''
        let zSum = 0
        for (let i = 0; i < R; i++) {
          const o3 = (i * P + col) * 3
          d += (i === 0 ? 'M' : 'L') + round(proj[o3]) + ' ' + round(proj[o3 + 1])
          zSum += proj[o3 + 2]
        }
        el.setAttribute('d', d)
        el.style.opacity = dim(zSum / R) * 0.72
      }

      // --- draw-on entrance -------------------------------------------------
      // `pathLength="1"` on every path normalises its length to 1, so one
      // dashoffset number works no matter what the geometry is doing. That's
      // what makes a stroke-draw survive a `d` that changes every frame.
      if (drawIn) {
        const age = now - s.born
        const DUR = 900
        const STAG = 55
        let done = true
        for (let i = 0; i < R; i++) {
          const p = Math.max(0, Math.min(1, (age - i * STAG) / DUR))
          if (p < 1) done = false
          const off = 1 - easeOut(p)
          for (let sIdx = 0; sIdx < o.segments; sIdx++) {
            const el = paths[i * o.segments + sIdx]
            if (el) el.style.strokeDashoffset = off
          }
        }
        const vp = Math.max(0, Math.min(1, (age - R * STAG) / DUR))
        if (vp < 1) done = false
        for (let c = 0; c < o.verts; c++) {
          const el = paths[R * o.segments + c]
          if (el) el.style.strokeDashoffset = 1 - easeOut(vp)
        }
        if (done) for (const el of paths) if (el) el.style.strokeDasharray = 'none'
      }
    }

    raf = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(raf)
  }, [geo, segments, verts, drawIn])

  // Drag to orbit. Releasing hands the yaw back to the autospin so it picks up
  // exactly where you let go instead of snapping.
  useEffect(() => {
    const el = svgRef.current
    if (!el || !interactive) return
    const s = st.current
    const down = (e) => {
      el.setPointerCapture(e.pointerId)
      s.drag = { x: e.clientX, y: e.clientY, yaw: 0, pitch: 0 }
    }
    const move = (e) => {
      if (!s.drag) return
      s.drag.yaw = (e.clientX - s.drag.x) * 0.008
      s.drag.pitch = (e.clientY - s.drag.y) * -0.006
    }
    const up = () => {
      if (!s.drag) return
      s.angle += s.drag.yaw
      s.tilt += s.drag.pitch
      opts.current.tilt = s.tilt
      s.drag = null
    }
    el.addEventListener('pointerdown', down)
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerup', up)
    el.addEventListener('pointercancel', up)
    return () => {
      el.removeEventListener('pointerdown', down)
      el.removeEventListener('pointermove', move)
      el.removeEventListener('pointerup', up)
      el.removeEventListener('pointercancel', up)
    }
  }, [interactive])

  const total = rings * segments + verts
  pathsRef.current.length = total

  return (
    <svg
      ref={svgRef}
      className={className}
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{ touchAction: 'none', cursor: interactive ? 'grab' : 'inherit', overflow: 'visible', display: 'block' }}
    >
      <g fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
        {Array.from({ length: total }, (_, i) => (
          <path
            key={i}
            ref={(n) => {
              pathsRef.current[i] = n
            }}
            pathLength="1"
            style={drawIn ? { strokeDasharray: 1, strokeDashoffset: 1 } : undefined}
          />
        ))}
      </g>
    </svg>
  )
}
