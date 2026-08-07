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
// True isometric elevation: atan(1/sqrt(2)). The angle every axonometric
// technical drawing is set at, and what makes these read as illustration
// rather than as a 3D render.
export const ISO_TILT = Math.atan(1 / Math.SQRT2)

const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2)
const easeOut = (t) => 1 - (1 - t) ** 3
const round = (v) => Math.round(v * 100) / 100

export default function Wireframe({
  shape = 0,
  size = 440,
  // geometry resolution
  rings = 9,
  points = 72,
  verts = 0, // extra meridians; the outline usually does this job already
  // motion
  spin = 0.34, // turns per second
  tilt = ISO_TILT, // radians on the X axis — positive looks down on the shape
  morphMs = 1500,
  revealTurn = Math.PI, // extra rotation spent *during* a morph — the "reveal"
  drawIn = true,
  interactive = true, // drag to orbit
  paused = false, // for the backlog item: freeze the tiles while a modal is open
  // look
  ortho = true, // parallel projection; false restores the perspective divide
  backface = 0, // opacity of the hidden side. 0 = solid, 1 = full wireframe
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
  opts.current = { spin, tilt, morphMs, revealTurn, ortho, backface, strokeWidth, rings, points, verts, size, paused }

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

      // Reuse one flat array: [screenX, screenY, facing] per point.
      //
      // `facing` is the z of the surface's outward normal after the yaw;
      // negative means it points at the camera. It's the whole hidden-line
      // system — one sign per point.
      //
      // The normal comes from the contour's own tangent, not from the radius.
      // Assuming it runs radially is true for a circle and wrong for anything
      // squared off: on a flat face the normal is constant, so the front/back
      // boundary sits at the corner, not where the radius happens to peak.
      // Taking it from the neighbours also means it stays correct mid-morph,
      // while a circle is turning into a bar.
      const proj = s.proj && s.proj.length === R * P * 3 ? s.proj : (s.proj = new Float32Array(R * P * 3))
      const lerpX = (i, j) => {
        const a = from[i][j]
        return a[0] + (to[i][j][0] - a[0]) * mp
      }
      const lerpZ = (i, j) => {
        const a = from[i][j]
        return a[2] + (to[i][j][2] - a[2]) * mp
      }

      const rad = s.rad && s.rad.length === R ? s.rad : (s.rad = new Float32Array(R))

      for (let i = 0; i < R; i++) {
        let rmax = 0
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

          // Outward normal in XZ: perpendicular to the contour tangent.
          const jp = j + 1 === P ? 0 : j + 1
          const jm = j === 0 ? P - 1 : j - 1
          const nx = lerpZ(i, jp) - lerpZ(i, jm)
          const nz = -(lerpX(i, jp) - lerpX(i, jm))

          // Yaw about Y, then pitch about X. The pitch tips the far side of
          // the object *down* the screen, which is what looking down on
          // something does — the other sign shows you its underside.
          const x1 = x0 * cy + z0 * sy
          const z1 = -x0 * sy + z0 * cy
          const y2 = y0 * cx + z1 * sx
          const facing = -nx * sy + nz * cy

          // Orthographic keeps parallel lines parallel — the projection every
          // technical illustration uses. Perspective is kept as an option.
          const k = o.ortho ? scale : (CAM_F / (CAM_D + (z1 * cx - y0 * sx))) * scale
          const rr = x0 * x0 + z0 * z0
          if (rr > rmax) rmax = rr
          const o3 = (i * P + j) * 3
          proj[o3] = half + x1 * k
          proj[o3 + 1] = half - y2 * k
          proj[o3 + 2] = facing
        }
        rad[i] = Math.sqrt(rmax)
      }

      // Which rings show a complete ellipse rather than just their near arc.
      //
      // A ring's far half is hidden only if there is material above it doing
      // the hiding, and whether there is depends on the viewing angle: the
      // sight line to a far point climbs as it comes toward the camera, so a
      // ring above blocks it only if that ring is still wider than the line
      // has moved inward by the time it gets there. Sliding up by dy moves the
      // ray inward by dy/tan(pitch), which rearranges into a single suffix
      // maximum over `radius + y / tan(pitch)`.
      //
      // This is what makes a coin read with a whole top rim but a half-arc at
      // its base, a sphere show whole rings above the equator and arcs below,
      // and a stepped pyramid tuck each tread behind the step above it.
      const proud = s.proud && s.proud.length === R ? s.proud : (s.proud = new Uint8Array(R))
      const slope = 1 / Math.max(0.02, Math.abs(Math.tan(pitch)))
      let above = -Infinity
      for (let i = R - 1; i >= 0; i--) {
        const g = rad[i] + buf[i][0][1] * slope
        proud[i] = g >= above - 1e-4 ? 1 : 0
        if (g > above) above = g
      }

      // --- write paths ----------------------------------------------------
      // Each ring becomes exactly two paths: the arc facing us and the arc
      // behind. Splitting at the two points where `facing` changes sign puts
      // the seam on the silhouette, so the boundary is exact rather than
      // quantised to a segment — and it's far fewer paths than slicing every
      // ring into fixed pieces.
      const back = o.backface
      let n = 0

      const arc = (el, base, s0, count, dim) => {
        if (!el) return
        let d = ''
        for (let q = 0; q <= count; q++) {
          const o3 = base + ((s0 + q) % P) * 3
          d += (q === 0 ? 'M' : 'L') + round(proj[o3]) + ' ' + round(proj[o3 + 1])
        }
        el.setAttribute('d', d)
        el.style.opacity = dim ? back : 1
      }

      // The two silhouette points per ring, as [x, y] pairs, kept so the
      // outline can be stitched down the object afterwards. These are
      // interpolated rather than snapped to a sample: the true silhouette sits
      // between two points, and rounding it to the nearer one lands up to a
      // few degrees off, which shows as the outline crossing the arc ends.
      const sil = s.sil && s.sil.length === R * 4 ? s.sil : (s.sil = new Float32Array(R * 4))

      for (let i = 0; i < R; i++) {
        const base = i * P * 3

        // The longest run of front-facing points, and the ring's screen-x
        // extremes, in one pass.
        //
        // "Longest run" rather than "first two sign flips": a squared-off
        // cross-section is nearly flat across a face, so its facing hovers at
        // zero there and chatters across it. Taking the longest run ignores
        // that chatter and still finds the real front.
        let bestStart = 0
        let bestLen = 0
        let runStart = -1
        let runLen = 0
        let lx = Infinity
        let rx = -Infinity
        let li = 0
        let ri = 0
        for (let q = 0; q < P * 2; q++) {
          const j = q % P
          const o3 = base + j * 3
          if (q < P) {
            const x = proj[o3]
            if (x < lx) { lx = x; li = j }
            if (x > rx) { rx = x; ri = j }
          }
          if (proj[o3 + 2] < 0) {
            if (runStart < 0) { runStart = j; runLen = 0 }
            runLen++
            if (runLen > bestLen && runLen <= P) { bestLen = runLen; bestStart = runStart }
          } else {
            runStart = -1
          }
        }

        if (proud[i] || bestLen === 0 || bestLen >= P) {
          // Nothing above it to hide behind (or a degenerate pole): one whole
          // ring, at full weight.
          arc(paths[n++], base, 0, P, bestLen === 0 && !proud[i])
          arc(paths[n++], base, 0, 0, true)
        } else {
          arc(paths[n++], base, bestStart, bestLen - 1, false)
          arc(paths[n++], base, (bestStart + bestLen - 1) % P, P - bestLen + 1, true)
        }

        // The outline runs through each ring's leftmost and rightmost points
        // on screen. Defining it that way rather than by the facing sign means
        // the two runs can never swap sides and cross over — which is exactly
        // what a corner-heavy cross-section made them do.
        sil[i * 4] = proj[base + li * 3]
        sil[i * 4 + 1] = proj[base + li * 3 + 1]
        sil[i * 4 + 2] = proj[base + ri * 3]
        sil[i * 4 + 3] = proj[base + ri * 3 + 1]
      }

      // The outline. With only two or three contour lines on most of these
      // forms, the silhouette *is* the drawing — it's the line a technical
      // illustrator draws first and the reason a cylinder reads as solid
      // rather than as two floating ellipses.
      for (let side = 0; side < 2; side++) {
        const el = paths[n++]
        if (!el) continue
        let d = ''
        for (let i = 0; i < R; i++) {
          const o = i * 4 + side * 2
          d += (i === 0 ? 'M' : 'L') + round(sil[o]) + ' ' + round(sil[o + 1])
        }
        el.setAttribute('d', d)
        el.style.opacity = 1
      }

      // Meridians. A meridian sits at one angle, so its whole length shares a
      // facing — one test at the widest ring decides it.
      const mid = (R >> 1) * P * 3
      for (let c = 0; c < o.verts; c++) {
        const el = paths[n++]
        if (!el) continue
        const col = Math.round((c * P) / o.verts) % P
        let d = ''
        for (let i = 0; i < R; i++) {
          const o3 = (i * P + col) * 3
          d += (i === 0 ? 'M' : 'L') + round(proj[o3]) + ' ' + round(proj[o3 + 1])
        }
        el.setAttribute('d', d)
        el.style.opacity = proj[mid + col * 3 + 2] < 0 ? 1 : back
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
          for (let k = 0; k < 2; k++) {
            const el = paths[i * 2 + k]
            if (el) el.style.strokeDashoffset = off
          }
        }
        const vp = Math.max(0, Math.min(1, (age - R * STAG) / DUR))
        if (vp < 1) done = false
        for (let k = 0; k < 2; k++) {
          const el = paths[R * 2 + k]
          if (el) el.style.strokeDashoffset = 1 - easeOut(vp)
        }
        for (let c = 0; c < o.verts; c++) {
          const el = paths[R * 2 + 2 + c]
          if (el) el.style.strokeDashoffset = 1 - easeOut(vp)
        }
        if (done) for (const el of paths) if (el) el.style.strokeDasharray = 'none'
      }
    }

    raf = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(raf)
  }, [geo, verts, drawIn])

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

  const total = rings * 2 + 2 + verts
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
