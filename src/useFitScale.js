import { useLayoutEffect, useRef } from 'react'

/* Scale a fixed-design-width product-shot panel to fit its container.
   Sets `zoom` (not transform) so the panel's layout footprint shrinks with it
   and the overlay's centering grid keeps holding it — transform:scale leaves
   the full design-width box behind and mis-centers/overflows.

   Caps at `maxZoom` (the tuned per-context size), so on desktop the panels look
   exactly as before; it only shrinks below that when the container is narrower
   than the design needs — which is what was clipping the escrow/settlements
   panels on small screens. Re-measures on container resize.

   `designHeight` is optional and only the portrait panels need it: the landscape
   ones are always wider than they are tall, so width alone bounds them, but a
   phone screen overflows the hero box vertically long before it runs out of
   width. Pass it and the panel fits both axes; omit it and behaviour is
   unchanged (which is also how a deliberate vertical crop stays possible). */
export function useFitScale(designWidth, maxZoom, designHeight) {
  const ref = useRef(null)
  useLayoutEffect(() => {
    const el = ref.current
    const parent = el?.parentElement
    if (!el || !parent) return

    const apply = (availW, availH) => {
      let scale = availW > 0 ? Math.min(maxZoom, availW / designWidth) : maxZoom
      if (designHeight && availH > 0) scale = Math.min(scale, availH / designHeight)
      el.style.zoom = String(scale)
    }

    // contentRect is the parent's content box (padding already removed) — the
    // real space the centered panel has to live in. Reading height only works
    // because the hero overlay clamps its grid row to minmax(0,1fr); with an
    // auto row the panel's own height feeds straight back in here and the fit
    // never binds.
    const ro = new ResizeObserver((entries) => {
      for (const e of entries) apply(e.contentRect.width, e.contentRect.height)
    })
    ro.observe(parent)
    return () => ro.disconnect()
  }, [designWidth, maxZoom, designHeight])
  return ref
}
