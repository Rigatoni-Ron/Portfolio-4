import { useEffect, useState } from 'react'
import Wireframe, { ISO_TILT } from '../playground/wireframe/Wireframe.jsx'
import { SHAPES } from '../playground/wireframe/shapes.js'
import { PALETTE, RAMPS, ramp, stretch } from '../playground/wireframe/palette.js'
import './colour.css'

/*
 * Throwaway: what the Wireframe piece looks like wearing the reference photo's
 * colours. Eight treatments side by side, all live, all the same geometry —
 * only the per-segment paint function differs.
 *
 * Nothing here is wired into the site. Reachable at /colour.html on the dev
 * server only.
 */

// Each treatment is one function: given a segment, set its stroke (and opacity).
// `info` carries zNorm (0 near … 1 far), vNorm (0 bottom … 1 top), angle
// (0..1 around the contour), dim (what the default depth fade would have used),
// t (seconds), and kind ('ring' | 'meridian').
const TREATMENTS = [
  {
    id: 'depth',
    name: 'Depth ramp',
    note: 'Near lines pink, far lines indigo — the photo’s sky gradient mapped straight onto depth. Motion comes from the spin carrying lines through the ramp.',
    paint: (el, i) => {
      el.style.stroke = ramp('sky', stretch(1 - i.zNorm))
      el.style.opacity = 0.25 + (1 - i.zNorm) * 0.75
    },
  },
  {
    id: 'height',
    name: 'Height ramp',
    note: 'Moss at the base climbing through rock to flowers at the top. Reads the landscape literally, and the colour stays put while the form turns underneath it.',
    paint: (el, i) => {
      el.style.stroke = ramp('land', i.vNorm)
      el.style.opacity = i.dim
    },
  },
  {
    id: 'sweep',
    name: 'Orbiting sweep',
    note: 'Hue keyed to angle plus time, so a band of colour travels around the form independently of the spin. The most literal reading of “colour moving through the lines”.',
    paint: (el, i) => {
      el.style.stroke = ramp('loop', (i.angle + i.t * 0.14) % 1)
      el.style.opacity = i.dim
    },
  },
  {
    id: 'strata',
    name: 'Strata',
    note: 'One palette colour per ring, no blending. The form reads as layered rock and moss rather than one material.',
    paint: (el, i) => {
      const keys = [PALETTE.moss, PALETTE.lime, PALETTE.blue, PALETTE.indigo, PALETTE.violet, PALETTE.magenta, PALETTE.pink, PALETTE.coral]
      el.style.stroke = i.kind === 'meridian' ? PALETTE.indigo : keys[i.ring % keys.length]
      el.style.opacity = i.dim
    },
  },
  {
    id: 'pulse',
    name: 'Travelling pulse',
    note: 'A narrow bright band runs around each ring on a loop, everything else sits dark indigo. Light chasing through a wire.',
    paint: (el, i) => {
      const head = (i.t * 0.5 + i.vNorm * 0.35) % 1
      let d = Math.abs(i.angle - head)
      if (d > 0.5) d = 1 - d
      const hot = Math.max(0, 1 - d * 5)
      el.style.stroke = hot > 0.02 ? ramp('loop', 0.4 + hot * 0.4) : PALETTE.indigo
      el.style.opacity = i.dim * (0.4 + hot * 0.6)
    },
  },
  {
    id: 'rise',
    name: 'Rising tide',
    note: 'A colour front climbs the form and wraps, so the object fills with light from the base up. Slower and less busy than the sweep.',
    paint: (el, i) => {
      const front = (i.t * 0.22) % 1.35 - 0.175
      const below = i.vNorm < front
      const edge = Math.max(0, 1 - Math.abs(i.vNorm - front) * 9)
      el.style.stroke = edge > 0.05 ? PALETTE.pink : below ? PALETTE.lime : PALETTE.blue
      el.style.opacity = i.dim * (below || edge > 0.05 ? 1 : 0.42)
    },
  },
  {
    id: 'duo',
    name: 'Two-tone',
    note: 'Hard split at the silhouette: near half in moss, far half in pink. The most graphic option and the only one that would survive at tile size.',
    paint: (el, i) => {
      el.style.stroke = i.zNorm < 0.5 ? PALETTE.moss : PALETTE.pink
      el.style.opacity = i.zNorm < 0.5 ? 0.95 : 0.3
    },
  },
  {
    id: 'wash',
    name: 'Depth + sweep',
    note: 'Depth sets brightness, a slow sweep sets hue. Keeps the dimensionality the mono version has and adds drift on top — probably the safest one to actually ship.',
    paint: (el, i) => {
      el.style.stroke = ramp('loop', (i.angle * 0.8 + i.vNorm * 0.25 + i.t * 0.06) % 1)
      el.style.opacity = 0.18 + stretch(1 - i.zNorm) * 0.82
    },
  },
]

const CFG = {
  rings: 13, points: 84, segments: 16, verts: 10,
  spin: 0.15, tilt: ISO_TILT, ortho: false, depth: 0.82, backface: 0.06,
  strokeWidth: 1.3, morphMs: 1700, revealTurn: Math.PI,
}

const Q = new URLSearchParams(location.search)

export default function ColourLab() {
  const [shape, setShape] = useState(Math.max(0, SHAPES.findIndex((s) => s.id === Q.get('shape'))))
  const [cycling, setCycling] = useState(Q.get('auto') !== '0')
  const [solo, setSolo] = useState(Q.get('solo'))

  useEffect(() => {
    if (!cycling) return
    const id = setInterval(() => setShape((i) => (i + 1) % SHAPES.length), 3400 + CFG.morphMs)
    return () => clearInterval(id)
  }, [cycling])

  const shown = solo ? TREATMENTS.filter((t) => t.id === solo) : TREATMENTS

  return (
    <div className="cl">
      <header className="cl-head">
        <h1>Wireframe in the reference palette</h1>
        <p>
          Eight treatments, same geometry, same motion — only the per-segment paint differs. Colours are measured out of
          the photograph (see <code>palette.js</code>), not picked by eye. Throwaway.
        </p>
        <div className="cl-swatches">
          {Object.entries(PALETTE).map(([name, hex]) => (
            <span key={name} className="cl-swatch" title={`${name} ${hex}`}>
              <i style={{ background: hex }} />
              {hex}
            </span>
          ))}
        </div>
        <div className="cl-ramps">
          {Object.entries(RAMPS).map(([name, stops]) => (
            <span key={name} className="cl-ramp">
              <i style={{ background: `linear-gradient(90deg, ${stops.join(',')})` }} />
              {name}
            </span>
          ))}
        </div>
      </header>

      <div className="cl-bar">
        {SHAPES.map((s, i) => (
          <button
            key={s.id}
            className={!cycling && i === shape ? 'on' : ''}
            onClick={() => {
              setCycling(false)
              setShape(i)
            }}
          >
            {s.label}
          </button>
        ))}
        <button className={cycling ? 'on' : ''} onClick={() => setCycling((c) => !c)}>
          Cycle
        </button>
        {solo && (
          <button className="on" onClick={() => setSolo(null)}>
            Show all
          </button>
        )}
      </div>

      <div className={`cl-grid${solo ? ' is-solo' : ''}`}>
        {shown.map((t) => (
          <figure key={t.id} className="cl-cell">
            <div className="cl-stage" onClick={() => setSolo(solo ? null : t.id)}>
              <Wireframe shape={shape} size={solo ? 620 : 340} {...CFG} paint={t.paint} interactive={!!solo} />
            </div>
            <figcaption>
              <b>{t.name}</b>
              <span>{t.note}</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  )
}
