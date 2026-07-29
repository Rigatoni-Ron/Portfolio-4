import { useEffect, useState } from 'react'

/* Holds the load-in until the webfonts have resolved, so the text isn't
   swapping faces while it lifts.
   The cap matters more than the wait: measured cold, Geist takes ~1.2s to
   arrive, and no gate worth having keeps the page black that long. So it
   starts anyway after `cap`. A swap landing *during* the fade is hidden by
   the fade; one landing after it is the one that looks broken, and a warm
   cache (fonts in ~330ms) avoids both. */
export function useEntrance(cap = 300) {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let done = false
    const start = () => {
      if (done) return
      done = true
      // one frame later, so the initial (hidden) styles are committed first
      // and the browser has something to transition from
      requestAnimationFrame(() => setReady(true))
    }

    const timer = setTimeout(start, cap)
    if (document.fonts) document.fonts.ready.then(start)
    else start()

    return () => clearTimeout(timer)
  }, [cap])

  return ready
}
