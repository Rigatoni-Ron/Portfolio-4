import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { playground } from '../data.js'
import { morph } from '../motion.js'
import { ArrowUpRight } from './icons.jsx'
import PlaygroundViewer from './PlaygroundViewer.jsx'

export default function Playground() {
  const [active, setActive] = useState(null)
  const [closingId, setClosingId] = useState(null)
  const closeTimer = useRef(null)

  const open = (item) => {
    clearTimeout(closeTimer.current)
    setClosingId(null)
    setActive(item)
  }

  const close = () => {
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
              layoutId={`play-${c.id}`}
              className="tile"
              transition={morph}
              onClick={() => openable && open(c)}
              whileTap={openable ? { scale: 0.99 } : undefined}
              animate={{ opacity: isActive ? 0 : 1 }}
              style={{
                zIndex: isActive || closingId === c.id ? 40 : 1,
                cursor: openable ? 'pointer' : 'default',
              }}
              aria-label={`Open ${c.title}`}
            >
              <div className="tile-meta">
                <div>
                  <div className="tile-title">{c.title}</div>
                  <div className="tile-tag">{c.tag}</div>
                </div>
                <span className="tile-arrow">
                  <ArrowUpRight />
                </span>
              </div>
            </motion.button>
          )
        })}
      </div>

      <PlaygroundViewer item={active} onClose={close} />
    </section>
  )
}
