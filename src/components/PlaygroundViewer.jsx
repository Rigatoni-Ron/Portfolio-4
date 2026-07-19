import { Suspense, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Close } from './icons.jsx'
import { morph } from '../motion.js'
import { nativeComponents } from '../playground/registry.js'

// Diagonal-wave loader: a 3×3 grid of squares where a diagonal band of light
// sweeps across (delay driven by row+col). Matches the header bead aesthetic.
const Spinner = () => (
  <div className="pg-loading" aria-hidden="true">
    <div className="pg-wave">
      {Array.from({ length: 9 }, (_, i) => (
        <span
          key={i}
          className="pg-wave-cell"
          style={{ '--wave': ((i / 3) | 0) + (i % 3) }}
        />
      ))}
    </div>
  </div>
)

// The fixed panel fills the viewport inset by this margin (matches --s-4).
const PANEL_INSET = 16

// FLIP: map the fixed, fullscreen panel back onto the tile's viewport rect.
// The panel is position:fixed and we animate pure transforms, so the zoom is in
// viewport coordinates and immune to page scroll (a scroll mid-morph used to
// corrupt motion's cross-context layout projection and make the panel
// slide up from the bottom instead of zooming from the tile).
const fromTile = (rect) => {
  if (!rect) return { x: 0, y: 0, scaleX: 1, scaleY: 1 }
  const pw = window.innerWidth - PANEL_INSET * 2
  const ph = window.innerHeight - PANEL_INSET * 2
  return {
    x: rect.left - PANEL_INSET,
    y: rect.top - PANEL_INSET,
    scaleX: rect.width / pw,
    scaleY: rect.height / ph,
  }
}

/*
 * Fullscreen viewer for a Playground tile. It zooms (FLIP transform) from the
 * clicked tile's rect up to a near-fullscreen fixed panel. The live component
 * mounts only while open.
 *
 * Perf: a same-origin iframe shares the main thread, so booting a heavy app
 * (e.g. Three.js) *during* the zoom freezes the animation. So we defer mounting
 * the iframe until the morph finishes (onAnimationComplete), then fade the
 * loaded app in — the zoom stays smooth and the content lands a beat later.
 * On close the panel unmounts, tearing down the iframe + any WebGL context.
 */
export default function PlaygroundViewer({ item, originRect, openSeq, onClose }) {
  const [morphDone, setMorphDone] = useState(false)
  const [frameLoaded, setFrameLoaded] = useState(false)

  // Reset only when a NEW item opens (openSeq bumps), never mid-exit — a
  // setState while the panel is exiting can trip up AnimatePresence removal.
  useEffect(() => {
    if (!item) return
    setMorphDone(false)
    setFrameLoaded(false)
  }, [openSeq]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!item) return
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    // Lock page scroll while open (restored on close).
    document.documentElement.style.overflow = 'hidden'
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.documentElement.style.overflow = ''
      document.body.style.overflow = ''
    }
  }, [item, onClose])

  const NativeComp = item?.mode === 'native' ? nativeComponents[item.id] : null

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

      <AnimatePresence>
        {item && (
          <motion.div
            key={openSeq}
            className="pg-panel"
            onClick={(e) => e.stopPropagation()}
            style={{ transformOrigin: 'top left' }}
            initial={fromTile(originRect)}
            animate={{ x: 0, y: 0, scaleX: 1, scaleY: 1 }}
            // Open zooms from the real tile (a perfect match). Close does NOT try
            // to land the live app back into the tile — its arbitrary state can't
            // match the preview video underneath — so it just fades out, turning
            // the content mismatch into a soft dissolve instead of a hard pop.
            exit={{ opacity: 0, transition: { duration: 0.18, ease: 'easeOut' } }}
            transition={morph}
            // Gate heavy content until the zoom lands. Guarded by `item` so the
            // exit's completion (item null) doesn't setState mid-unmount.
            onAnimationComplete={() => item && setMorphDone(true)}
            role="dialog"
            aria-modal="true"
            aria-label={item.title}
          >
            {/* Content mounts only after the zoom lands (keeps the morph
                smooth — a heavy boot on the shared main thread would jank it). */}
            {item.mode === 'iframe' && morphDone && (
              <>
                <iframe
                  className="pg-frame"
                  src={item.src}
                  title={item.title}
                  style={{ opacity: frameLoaded ? 1 : 0 }}
                  onLoad={() => setFrameLoaded(true)}
                />
                {!frameLoaded && <Spinner />}
              </>
            )}

            {item.mode === 'native' && morphDone && NativeComp && (
              <Suspense fallback={<Spinner />}>
                <div
                  className="pg-native"
                  style={item.bg ? { background: item.bg } : undefined}
                >
                  <NativeComp variant="full" />
                </div>
              </Suspense>
            )}

            {!morphDone && <Spinner />}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
