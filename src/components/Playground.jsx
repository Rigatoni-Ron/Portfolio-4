import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { playground } from '../data.js'
import PlaygroundViewer from './PlaygroundViewer.jsx'
import TileVideo from './TileVideo.jsx'

const rectOf = (el) => {
  const r = el.getBoundingClientRect()
  return { left: r.left, top: r.top, width: r.width, height: r.height }
}

export default function Playground() {
  const [active, setActive] = useState(null)
  const [originRect, setOriginRect] = useState(null)
  const [closingId, setClosingId] = useState(null)
  const closeTimer = useRef(null)
  const tileRefs = useRef({})

  const open = (item, el) => {
    clearTimeout(closeTimer.current)
    setClosingId(null)
    // Capture the tile's exact viewport rect at click time. The viewer zooms
    // from this box using fixed-position transforms, so an in-flight scroll
    // can't shift the origin mid-morph (see PlaygroundViewer).
    setOriginRect(rectOf(el))
    setActive(item)
  }

  const close = () => {
    // Re-measure the (still-mounted) tile so the shrink-back targets its
    // current on-screen box, even after a resize while open.
    const el = tileRefs.current[active?.id]
    if (el) setOriginRect(rectOf(el))
    setClosingId(active?.id ?? null)
    setActive(null)
    clearTimeout(closeTimer.current)
    closeTimer.current = setTimeout(() => setClosingId(null), 550)
  }

  return (
    <section aria-labelledby="play-title">
      <h2 className="section-title" id="play-title">
        Playground
      </h2>
      <div className="play-grid">
        {playground.map((c) => {
          const isActive = active?.id === c.id
          const openable = Boolean(c.mode)
          return (
            <motion.button
              key={c.id}
              ref={(n) => {
                if (n) tileRefs.current[c.id] = n
              }}
              className={`tile ${c.preview ? 'has-preview' : ''}`}
              onClick={(e) => openable && open(c, e.currentTarget)}
              whileTap={openable ? { scale: 0.99 } : undefined}
              animate={{ opacity: isActive ? 0 : 1 }}
              style={{ cursor: openable ? 'pointer' : 'default' }}
              aria-label={`Open ${c.title}`}
            >
              {c.preview && <TileVideo src={c.preview} poster={c.poster} />}
              <div className="tile-meta">
                <div>
                  <div className="tile-title">{c.title}</div>
                  <div className="tile-tag">{c.tag}</div>
                </div>
              </div>
            </motion.button>
          )
        })}
      </div>

      <PlaygroundViewer item={active} originRect={originRect} onClose={close} />
    </section>
  )
}
