import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Close } from './icons.jsx'
import { morph } from '../motion.js'

/*
 * Fullscreen viewer for a Playground tile. The tile shares a layoutId with the
 * panel, so it morphs (zooms) up to near-fullscreen. The live component mounts
 * only while open: 'iframe' loads a vendored standalone build; 'native' will
 * render a ported React component. On close the panel unmounts (tearing down
 * the iframe's document + any WebGL context), and the tile morphs back.
 */
export default function PlaygroundViewer({ item, onClose }) {
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
              // Vanish instantly on close so only the tile's morph-back shows.
              exit={{ opacity: 0, transition: { duration: 0 } }}
              role="dialog"
              aria-modal="true"
              aria-label={item.title}
            >
              {item.mode === 'iframe' && (
                <iframe
                  className="pg-frame"
                  src={item.src}
                  title={item.title}
                  loading="lazy"
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  )
}
