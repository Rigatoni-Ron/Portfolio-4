import { useCallback, useEffect, useRef, useState } from 'react'
import { projects, playground } from '../data.js'
import { nativeComponents } from '../playground/registry.js'
import LoanCard from './LoanCard.jsx'
import AgreementAssets from './AgreementAssets.jsx'
import SendTransfer from './SendTransfer.jsx'
import ProjectModal from './ProjectModal.jsx'
import PlaygroundViewer from './PlaygroundViewer.jsx'
import { cue } from '../sound.js'

/* THROWAWAY PROTOTYPE — not in the production build (see vite.config).
   All seven tiles on one slowly drifting ring. Depth is faked in 2D: each card
   sits on an ellipse and takes its scale, vertical offset, dimming and stacking
   from cos(angle). No CSS 3D, deliberately — perspective would skew the cards
   and rasterize their text soft, and the cards are meant to stay flat. */

const CARD = { w: 330, h: 240 }
const RX = 560 // ellipse half-width
const RY = 88 // how far the front card drops below the back one
const REVOLUTION = 52000 // ms for a full turn: drift, not carousel
const SPIN = 620 // ms to bring a clicked card to the front
const HOVER_RATE = 0.15 // hovering eases the drift down rather than stopping it

const heroPanel = (name) =>
  name === 'agreement' ? AgreementAssets : name === 'send' ? SendTransfer : LoanCard

// shipped and playground alternate so neither kind clumps on one side
function buildItems() {
  const shipped = projects.map((p) => ({
    kind: 'shipped',
    id: p.id,
    title: p.title,
    desc: p.desc,
    data: p,
  }))
  const play = playground.map((c) => ({
    kind: 'playground',
    id: c.id,
    title: c.title,
    desc: c.tag,
    data: c,
  }))
  const out = []
  while (shipped.length || play.length) {
    if (play.length) out.push(play.shift())
    if (shipped.length) out.push(shipped.shift())
  }
  return out
}

const easeOut = (t) => 1 - Math.pow(1 - t, 3)
const TAU = Math.PI * 2

export default function Ring() {
  const items = useRef(buildItems()).current
  const step = TAU / items.length

  const [hovered, setHovered] = useState(null)
  const [project, setProject] = useState(null) // shipped modal
  const [piece, setPiece] = useState(null) // playground viewer
  const [originRect, setOriginRect] = useState(null)
  const [openSeq, setOpenSeq] = useState(0)

  const rot = useRef(0)
  const spin = useRef(null) // {from, to, start} while animating to front
  const cardRefs = useRef({})
  const open = project || piece

  const reduced =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

  /* The loop writes transforms straight to the DOM. Putting rotation in React
     state instead would re-render all seven cards — and their live tiles —
     sixty times a second, which is exactly the cost this ring can't afford. */
  const place = useCallback(() => {
    for (let i = 0; i < items.length; i++) {
      const el = cardRefs.current[items[i].id]
      if (!el) continue
      const a = rot.current + i * step
      const depth = Math.cos(a)
      const t = (depth + 1) / 2
      const scale = 0.58 + 0.42 * t
      el.style.transform = `translate(-50%, -50%) translate(${(Math.sin(a) * RX).toFixed(2)}px, ${(depth * RY).toFixed(2)}px) scale(${scale.toFixed(4)})`
      el.style.opacity = (0.5 + 0.5 * t).toFixed(3)
      el.style.filter = `brightness(${(0.72 + 0.28 * t).toFixed(3)})`
      el.style.zIndex = String(Math.round((depth + 1) * 100))
      el.classList.toggle('is-front', depth > 0.55)
    }
  }, [items, step])

  useEffect(() => {
    let raf
    let last = performance.now()
    const tick = (now) => {
      const dt = now - last
      last = now
      const s = spin.current
      if (s) {
        const t = Math.min(1, (now - s.start) / SPIN)
        rot.current = s.from + (s.to - s.from) * easeOut(t)
        place()
        if (t >= 1) {
          spin.current = null
          s.done?.()
        }
      } else if (!reduced && !open) {
        const rate = hovered == null ? 1 : HOVER_RATE
        rot.current += ((dt * rate) / REVOLUTION) * TAU
        place()
      }
      raf = requestAnimationFrame(tick)
    }
    place()
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [hovered, open, reduced, place])

  /* Bring a card to the front, then open it. Doing it in that order is what
     makes the morph tractable: every card opens from the same rect at the same
     scale, so there is nothing to normalize, and it is the shortest scale
     distance so the text never goes soft mid-flight. The turn also gives a
     cycling tile time to settle into the pose it will expand from. */
  const activate = useCallback(
    (item, index) => {
      const openNow = () => {
        const el = cardRefs.current[item.id]
        const r = el?.getBoundingClientRect()
        cue('press')
        if (item.kind === 'shipped') setProject(item.data)
        else {
          setOriginRect(r ? { left: r.left, top: r.top, width: r.width, height: r.height } : null)
          setOpenSeq((s) => s + 1)
          setPiece(item.data)
        }
      }

      // shortest way round to put this card at angle 0
      const current = rot.current
      let target = -index * step
      while (target - current > Math.PI) target -= TAU
      while (current - target > Math.PI) target += TAU

      if (Math.abs(target - current) < 0.02) return openNow()
      spin.current = { from: current, to: target, start: performance.now(), done: openNow }
    },
    [step]
  )

  const close = useCallback(() => {
    setProject(null)
    setPiece(null)
  }, [])

  return (
    <div className="ring-stage">
      <div className="ring" style={{ height: CARD.h + RY * 2 + 90 }}>
        {items.map((item, i) => {
          const Tile = item.kind === 'playground' ? nativeComponents[item.id] : null
          const Panel = item.kind === 'shipped' ? heroPanel(item.data.heroComponent) : null

          return (
            <div
              key={item.id}
              ref={(n) => n && (cardRefs.current[item.id] = n)}
              className={`ring-card${hovered === i ? ' is-hover' : ''}`}
              style={{ width: CARD.w, height: CARD.h }}
              onPointerEnter={() => setHovered(i)}
              onPointerLeave={() => setHovered((h) => (h === i ? null : h))}
              onClick={() => activate(item, i)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  activate(item, i)
                }
              }}
              aria-label={`Open ${item.title}`}
            >
              <div className="ring-preview">
                {item.kind === 'shipped' ? (
                  <>
                    <img className="card-bg" src={item.data.heroBg} alt="" draggable="false" />
                    <div className="card-heroshot-overlay">
                      <Panel variant="card" />
                    </div>
                  </>
                ) : (
                  Tile && <Tile variant="tile" />
                )}
              </div>
              <div className="ring-meta">
                <div className="ring-meta-row">
                  <span className="ring-title">{item.title}</span>
                  <span className={`ring-badge is-${item.kind}`}>
                    {item.kind === 'shipped' ? 'Shipped' : 'Playground'}
                  </span>
                </div>
                <p className="ring-desc">{item.desc}</p>
              </div>
            </div>
          )
        })}
      </div>

      <ProjectModal project={project} onClose={close} />
      <PlaygroundViewer item={piece} originRect={originRect} openSeq={openSeq} onClose={close} />
    </div>
  )
}
