import { useEffect, useState } from 'react'
import Wireframe from './Wireframe.jsx'
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

// The tile runs at about a third of the full piece's point count. It's small
// on screen, so the resolution isn't missed.
const TILE = {
  rings: 7, points: 48, segments: 6, verts: 6,
  spin: 0.2, tilt: 0.3, depth: 0.8, strokeWidth: 1.1,
  morphMs: 1600, revealTurn: Math.PI,
}

const FULL = {
  rings: 11, points: 84, segments: 10, verts: 10,
  spin: 0.16, tilt: 0.3, depth: 0.82, strokeWidth: 1.25,
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
