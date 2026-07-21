import { Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { playground } from '../data.js'
import { nativeComponents } from '../playground/registry.js'
import PlaygroundViewer from './PlaygroundViewer.jsx'

const rectOf = (el) => {
  const r = el.getBoundingClientRect()
  return { left: r.left, top: r.top, width: r.width, height: r.height }
}

// Module-level: survives Playground unmounting on tab switches. True after the
// live tiles' first idle-gated boot, so remounts start with content in place.
let tilesEverBooted = false

export default function Playground() {
  const [active, setActive] = useState(null)
  const [originRect, setOriginRect] = useState(null)
  // Bumped on every open so the viewer panel gets a fresh AnimatePresence key.
  // Reusing the same key across opens left the exiting panel stuck at opacity:0
  // (an invisible fullscreen layer that blocked all clicks after the 1st close).
  const [openSeq, setOpenSeq] = useState(0)
  const tileRefs = useRef({})

  // Live tiles (and their code-split chunks) mount only after the page goes
  // idle, so first paint never waits on a heavy tile like the node builder.
  // Once they've booted, later mounts (Playground unmounts on every tab
  // switch) skip the gate — the chunks are already loaded, so re-gating just
  // made the tiles animate up empty and pop in a beat later.
  const [tilesReady, setTilesReady] = useState(tilesEverBooted)
  useEffect(() => {
    if (tilesEverBooted) return
    const ric = window.requestIdleCallback ?? ((cb) => setTimeout(cb, 350))
    const id = ric(() => {
      tilesEverBooted = true
      setTilesReady(true)
    }, { timeout: 2000 })
    return () => (window.cancelIdleCallback ?? clearTimeout)(id)
  }, [])

  // Capture the tile's exact viewport rect at click time. The viewer zooms
  // from this box using fixed-position transforms, so an in-flight scroll
  // can't shift the origin mid-morph (see PlaygroundViewer).
  const open = useCallback((item, el) => {
    setOriginRect(rectOf(el))
    setOpenSeq((s) => s + 1)
    setActive(item)
  }, [])

  const close = useCallback(() => {
    // Re-measure the (still-mounted) tile so the shrink-back targets its
    // current box, even after a resize while open.
    const el = active ? tileRefs.current[active.id] : null
    if (el) setOriginRect(rectOf(el))
    setActive(null)
  }, [active])

  return (
    <section aria-labelledby="play-title">
      <h2 className="section-title" id="play-title">
        Playground
      </h2>
      <div className="play-grid">
        {playground.map((c) => {
          const isActive = active?.id === c.id
          const openable = Boolean(c.mode)
          const TileComp = c.liveTile && tilesReady ? nativeComponents[c.id] : null
          return (
            <motion.div
              key={c.id}
              ref={(n) => {
                if (n) tileRefs.current[c.id] = n
              }}
              // div[role=button], not <button>: live tile previews legally
              // contain their own (inert) buttons/inputs — button-in-button
              // is invalid HTML and React warns on it.
              role="button"
              tabIndex={openable ? 0 : -1}
              className="tile"
              onClick={(e) => openable && open(c, e.currentTarget)}
              onKeyDown={(e) => {
                if (openable && (e.key === 'Enter' || e.key === ' ')) {
                  e.preventDefault()
                  open(c, e.currentTarget)
                }
              }}
              whileTap={openable ? { scale: 0.99 } : undefined}
              animate={{ opacity: isActive ? 0 : 1 }}
              style={{ cursor: openable ? 'pointer' : 'default' }}
              aria-label={`Open ${c.title}`}
            >
              {TileComp && (
                <Suspense fallback={null}>
                  <TileComp variant="tile" />
                </Suspense>
              )}
              <div className="tile-meta">
                <div>
                  <div className="tile-title">{c.title}</div>
                  <div className="tile-tag">{c.tag}</div>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      <PlaygroundViewer
        item={active}
        originRect={originRect}
        openSeq={openSeq}
        onClose={close}
      />
    </section>
  )
}
