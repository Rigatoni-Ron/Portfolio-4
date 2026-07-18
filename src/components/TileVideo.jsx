import { useEffect, useRef, useState } from 'react'

/*
 * Looping, muted preview that plays only while the tile is on screen. The video
 * source is deferred until the tile first scrolls into view (poster shows until
 * then), and playback pauses when it leaves — so N tiles don't all decode at
 * once. Honors prefers-reduced-motion by staying on the poster still.
 */
export default function TileVideo({ src, poster }) {
  const ref = useRef(null)
  const [load, setLoad] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setLoad(true)
          el.play?.().catch(() => {})
        } else {
          el.pause?.()
        }
      },
      { threshold: 0.2 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <video
      ref={ref}
      className="tile-video"
      poster={poster}
      src={load ? src : undefined}
      autoPlay
      muted
      loop
      playsInline
      preload="none"
      aria-hidden="true"
      tabIndex={-1}
    />
  )
}
