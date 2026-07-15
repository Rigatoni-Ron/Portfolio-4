import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Close } from './icons.jsx'
import { morph } from '../motion.js'

/*
 * Fullscreen viewer for a Playground tile. The tile shares a layoutId with the
 * panel, so it morphs (zooms) up to near-fullscreen. The live component mounts
 * only while open.
 *
 * Perf: a same-origin iframe shares the main thread, so booting a heavy app
 * (e.g. Three.js) *during* the zoom freezes the animation. So we defer mounting
 * the iframe until the morph finishes (onLayoutAnimationComplete), then fade the
 * loaded app in — the zoom stays smooth and the content lands a beat later.
 * On close the panel unmounts, tearing down the iframe + any WebGL context.
 */
export default function PlaygroundViewer({ item, onClose }) {
  const [morphDone, setMorphDone] = useState(false)
  const [frameLoaded, setFrameLoaded] = useState(false)

  useEffect(() => {
    setMorphDone(false)
    setFrameLoaded(false)
  }, [item?.id])

  useEffect(() => {
    if (!item) return
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [item, onClose])

  const showLoader = item && (!morphDone || !frameLoaded)

  return (
    <>
      <AnimatePresence>
        {item && (
          <motion.div
            key="pg-overlay"
            className="pg-overlay"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {item && (
          <motion.button
            key="pg-close"
            className="pg-close"
            onClick={onClose}
            aria-label="Close"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <Close />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Persistent, click-through centering layer so the panel is a direct
          AnimatePresence child (required for the tile <-> panel morph). */}
      <div className="pg-layer">
        <AnimatePresence>
          {item && (
            <motion.div
              key={item.id}
              layoutId={`play-${item.id}`}
              className="pg-panel"
              onClick={(e) => e.stopPropagation()}
              transition={morph}
              onLayoutAnimationComplete={() => setMorphDone(true)}
              // Vanish instantly on close so only the tile's morph-back shows.
              exit={{ opacity: 0, transition: { duration: 0 } }}
              role="dialog"
              aria-modal="true"
              aria-label={item.title}
            >
              {/* Mount the iframe only after the zoom lands. */}
              {item.mode === 'iframe' && morphDone && (
                <iframe
                  className="pg-frame"
                  src={item.src}
                  title={item.title}
                  style={{ opacity: frameLoaded ? 1 : 0 }}
                  onLoad={() => setFrameLoaded(true)}
                />
              )}

              {showLoader && (
                <div className="pg-loading" aria-hidden="true">
                  <span className="pg-spinner" />
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  )
}
