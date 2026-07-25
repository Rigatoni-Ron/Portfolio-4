import { useLayoutEffect, useRef } from 'react'

/* Scale a fixed-design-width product-shot panel to fit its container.
   Sets `zoom` (not transform) so the panel's layout footprint shrinks with it
   and the overlay's centering grid keeps holding it — transform:scale leaves
   the full design-width box behind and mis-centers/overflows.

   Caps at `maxZoom` (the tuned per-context size), so on desktop the panels look
   exactly as before; it only shrinks below that when the container is narrower
   than the design needs — which is what was clipping the escrow/settlements
   panels on small screens. Re-measures on container resize. */
export function useFitScale(designWidth, maxZoom) {
  const ref = useRef(null)
  useLayoutEffect(() => {
    const el = ref.current
    const parent = el?.parentElement
    if (!el || !parent) return

    const apply = (avail) => {
      const scale = avail > 0 ? Math.min(maxZoom, avail / designWidth) : maxZoom
      el.style.zoom = String(scale)
    }

    // contentRect.width is the parent's content box (padding already removed) —
    // the real space the centered panel has to live in.
    const ro = new ResizeObserver((entries) => {
      for (const e of entries) apply(e.contentRect.width)
    })
    ro.observe(parent)
    return () => ro.disconnect()
  }, [designWidth, maxZoom])
  return ref
}
