import { useEffect, useState } from 'react'
import Wireframe from '../playground/wireframe/Wireframe.jsx'
import { SHAPES } from '../playground/wireframe/shapes.js'
import './lab.css'

const PRESETS = {
  Tile: { rings: 9, points: 72, segments: 8, verts: 8, spin: 0.28, tilt: 0.3, depth: 0.78, strokeWidth: 1.25, morphMs: 1500, revealTurn: Math.PI },
  Dense: { rings: 17, points: 96, segments: 12, verts: 12, spin: 0.2, tilt: 0.35, depth: 0.85, strokeWidth: 1, morphMs: 1800, revealTurn: Math.PI },
  Sparse: { rings: 5, points: 48, segments: 6, verts: 4, spin: 0.4, tilt: 0.22, depth: 0.6, strokeWidth: 2, morphMs: 1100, revealTurn: Math.PI * 2 },
  Flat: { rings: 11, points: 72, segments: 4, verts: 0, spin: 0.32, tilt: 0, depth: 0, strokeWidth: 1.25, morphMs: 1400, revealTurn: Math.PI },
}

function Slider({ label, value, min, max, step, onChange, fmt }) {
  return (
    <label className="lab-slider">
      <span className="lab-slider-row">
        <span>{label}</span>
        <b>{fmt ? fmt(value) : value}</b>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </label>
  )
}

// ?shape=cube&auto=0&preset=Dense — lets a screenshot land on a settled frame.
const Q = new URLSearchParams(location.search)

export default function LabPage() {
  const [p, setP] = useState(PRESETS[Q.get('preset')] ?? PRESETS.Tile)
  const [shape, setShape] = useState(Math.max(0, SHAPES.findIndex((s) => s.id === Q.get('shape'))))
  const [autoplay, setAutoplay] = useState(Q.get('auto') !== '0')
  const [hold, setHold] = useState(2400)
  const set = (k) => (v) => setP((s) => ({ ...s, [k]: v }))

  // Autoplay lives here, not in the engine: it's just a state change every few
  // seconds. React re-renders once per cycle; the 60fps work stays in the loop.
  useEffect(() => {
    if (!autoplay) return
    const id = setInterval(() => setShape((i) => (i + 1) % SHAPES.length), hold + p.morphMs)
    return () => clearInterval(id)
  }, [autoplay, hold, p.morphMs])

  return (
    <div className="lab">
      <header className="lab-head">
        <h1>Wireframe</h1>
        <p>
          A stack of contour rings, rotated and projected by hand into SVG paths. Every shape has identical topology,
          so morphing is a lerp. Drag to orbit.
        </p>
      </header>

      <div className="lab-body">
        <div className="lab-stage">
          <Wireframe shape={shape} size={480} drawIn={Q.get('draw') !== '0'} {...p} />
        </div>

        <aside className="lab-panel">
          <section>
            <h2>Shape</h2>
            <div className="lab-chips">
              {SHAPES.map((s, i) => (
                <button
                  key={s.id}
                  className={i === shape ? 'on' : ''}
                  onClick={() => {
                    setAutoplay(false)
                    setShape(i)
                  }}
                >
                  {s.label}
                </button>
              ))}
            </div>
            <div className="lab-chips">
              <button className={autoplay ? 'on' : ''} onClick={() => setAutoplay((a) => !a)}>
                {autoplay ? 'Autoplay on' : 'Autoplay off'}
              </button>
            </div>
          </section>

          <section>
            <h2>Preset</h2>
            <div className="lab-chips">
              {Object.entries(PRESETS).map(([name, preset]) => (
                <button key={name} onClick={() => setP(preset)}>
                  {name}
                </button>
              ))}
            </div>
          </section>

          <section>
            <h2>Motion</h2>
            <Slider label="Spin" value={p.spin} min={0} max={1.2} step={0.01} onChange={set('spin')} fmt={(v) => `${v} rev/s`} />
            <Slider label="Tilt" value={p.tilt} min={-1} max={1} step={0.01} onChange={set('tilt')} />
            <Slider label="Morph" value={p.morphMs} min={300} max={4000} step={50} onChange={set('morphMs')} fmt={(v) => `${v}ms`} />
            <Slider
              label="Reveal turn"
              value={p.revealTurn}
              min={0}
              max={Math.PI * 3}
              step={0.05}
              onChange={set('revealTurn')}
              fmt={(v) => `${(v / (Math.PI * 2)).toFixed(2)} rev`}
            />
            <Slider label="Hold" value={hold} min={0} max={6000} step={100} onChange={setHold} fmt={(v) => `${v}ms`} />
          </section>

          <section>
            <h2>Geometry</h2>
            <Slider label="Rings" value={p.rings} min={2} max={33} step={1} onChange={set('rings')} />
            <Slider label="Points" value={p.points} min={12} max={144} step={12} onChange={set('points')} />
            <Slider label="Segments" value={p.segments} min={1} max={12} step={1} onChange={set('segments')} />
            <Slider label="Meridians" value={p.verts} min={0} max={24} step={1} onChange={set('verts')} />
          </section>

          <section>
            <h2>Look</h2>
            <Slider label="Depth fade" value={p.depth} min={0} max={1} step={0.01} onChange={set('depth')} />
            <Slider label="Stroke" value={p.strokeWidth} min={0.5} max={4} step={0.05} onChange={set('strokeWidth')} />
          </section>

          <p className="lab-note">
            {p.rings * p.segments + p.verts} paths · {p.rings * p.points} points/frame
          </p>
        </aside>
      </div>
    </div>
  )
}
