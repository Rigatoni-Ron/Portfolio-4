import { useEffect, useRef, useState } from 'react'

/*
 * Site-wide custom cursor — ported from the 3D Shape Animator playground
 * project (public/playground/3d-shape-animator). Eight lines that read as a
 * crosshair at rest, split into corner brackets over interactive elements,
 * and tighten on press. Pure-CSS springy transitions (see `.custom-cursor`
 * in index.css); JS only writes translate() and toggles two classes.
 *
 * The original tracked hover via Three.js raycasting; here it's a plain
 * `closest()` on interactive elements. No iframes remain in the Playground
 * (every piece is native), so there's no cross-document tracking to do —
 * one listener on the document covers the whole site.
 */

// What counts as "interactive" → cursor blooms into corner brackets.
// Semantic interactive elements, plus clickable non-semantic containers from
// the Playground pieces (whole-card / row click targets that aren't a
// button/link). Add `[data-cursor="hover"]` to anything else that should bloom
// the cursor without being one of these.
const INTERACTIVE = [
  'a',
  'button',
  '[role="button"]',
  'input',
  'textarea',
  'select',
  'label',
  'summary',
  '.tab',
  '[data-cursor="hover"]',
  '.cscard', // Card Stacker — whole card is a click target
  '.nav-row', // Animated Menu — top-level rows
  '.sub-row', // Animated Menu — sub-items
].join(', ')

export default function CustomCursor() {
  // Only a fine, hovering pointer with motion allowed gets the custom cursor;
  // touch and reduced-motion keep the native one. Decided once on mount.
  const [active, setActive] = useState(false)
  const elRef = useRef(null)
  const shownRef = useRef(false)

  useEffect(() => {
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)')
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (!fine.matches || reduce.matches) return
    setActive(true)
  }, [])

  useEffect(() => {
    if (!active) return
    const el = elRef.current
    if (!el) return

    // Hide the native cursor site-wide (scoped to this class in index.css).
    document.documentElement.classList.add('has-custom-cursor')

    const onMove = (e) => {
      // Position is 1:1 with the real pointer (no lerp) — the spring lives in
      // the line morph, not the follow, so it stays crisp.
      el.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`
      if (!shownRef.current) {
        el.style.opacity = '1'
        shownRef.current = true
      }
      const overInteractive = e.target instanceof Element && e.target.closest(INTERACTIVE)
      el.classList.toggle('is-hovering', !!overInteractive)
    }

    // Press tightens the brackets — but only when actually over something
    // interactive, so clicking empty space doesn't snap crosshair→corners.
    const onDown = () => {
      if (el.classList.contains('is-hovering')) el.classList.add('is-dragging')
    }
    const onUp = () => el.classList.remove('is-dragging')

    // Hide when the pointer leaves the window; reappears on the next move.
    const onLeave = () => {
      el.style.opacity = '0'
      shownRef.current = false
    }

    document.addEventListener('mousemove', onMove)
    document.addEventListener('mousedown', onDown)
    document.addEventListener('mouseup', onUp)
    document.addEventListener('mouseleave', onLeave)
    return () => {
      document.documentElement.classList.remove('has-custom-cursor')
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('mouseup', onUp)
      document.removeEventListener('mouseleave', onLeave)
    }
  }, [active])

  if (!active) return null

  return (
    <div className="custom-cursor" ref={elRef} aria-hidden="true">
      <span className="cc-line top" />
      <span className="cc-line bottom" />
      <span className="cc-line left" />
      <span className="cc-line right" />
      <span className="cc-line top2" />
      <span className="cc-line bottom2" />
      <span className="cc-line left2" />
      <span className="cc-line right2" />
    </div>
  )
}
