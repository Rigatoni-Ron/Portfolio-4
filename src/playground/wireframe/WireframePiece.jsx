import { useEffect, useState } from 'react'
import Wireframe, { ISO_TILT } from './Wireframe.jsx'
import { SHAPES } from './shapes.js'
import './wf.css'

/*
 * Wireframe — the Playground piece.
 *
 *   variant="tile"  → small, cheap, non-interactive, cycles on its own
 *   variant="full"  → drag to orbit, pick a shape, or let it cycle
 *
 * The engine (Wireframe.jsx) is pure props and one rAF loop. Everything that
 * counts as *state* — which shape, whether it's cycling — lives here, and only
 * changes once every few seconds. The per-frame work never re-renders React.
 *
 * Tuned in the lab harness at /lab.html (dev only).
 */

// Ring counts are odd on purpose: the stepped forms want 1 + 2n rings so the
// treads land exactly. `backface` is nudged just off zero — fully solid loses
// the sense that you're looking at a drawn object rather than a filled one.
const TILE = {
  rings: 9, points: 48, verts: 0,
  spin: 0.2, tilt: ISO_TILT, ortho: true, backface: 0.16, strokeWidth: 1.1,
  morphMs: 1600, revealTurn: Math.PI,
}

const FULL = {
  rings: 13, points: 84, verts: 0,
  spin: 0.16, tilt: ISO_TILT, ortho: true, backface: 0.14, strokeWidth: 1.25,
  morphMs: 1700, revealTurn: Math.PI,
}

const TILE_HOLD = 2600
const FULL_HOLD = 3200

function useCycle(on, everyMs) {
  const [i, setI] = useState(0)
  useEffect(() => {
    if (!on) return
    const id = setInterval(() => setI((n) => (n + 1) % SHAPES.length), everyMs)
    return () => clearInterval(id)
  }, [on, everyMs])
  return [i, setI]
}

function WireframeTile() {
  const [shape] = useCycle(true, TILE_HOLD + TILE.morphMs)
  return (
    <div className="wf-tile" aria-hidden="true" inert>
      <Wireframe shape={shape} size={190} interactive={false} {...TILE} />
    </div>
  )
}

export default function WireframePiece({ variant = 'full' }) {
  if (variant === 'tile') return <WireframeTile />
  return <WireframeFull />
}

function WireframeFull() {
  const [cycling, setCycling] = useState(true)
  const [shape, setShape] = useCycle(cycling, FULL_HOLD + FULL.morphMs)

  return (
    <div className="wf-full">
      <div className="wf-stage">
        <Wireframe shape={shape} size={620} {...FULL} />
      </div>
      <div className="wf-controls">
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
      </div>
    </div>
  )
}
