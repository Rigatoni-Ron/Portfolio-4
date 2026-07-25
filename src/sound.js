/* Central sound helper — one place the whole site routes UI cues through.
   Wraps cuelume (sounds synthesized live via Web Audio, no files) and gates
   playback on the user's reduced-motion preference. Cuelume handles the
   browser's autoplay-unlock quietly; we just decide whether to speak. */
import { play, setEnabled } from 'cuelume'

const quiet =
  typeof window !== 'undefined' &&
  window.matchMedia &&
  window.matchMedia('(prefers-reduced-motion: reduce)')

// Respect reduced-motion up front, and keep in sync if the user flips it.
if (quiet) {
  setEnabled(!quiet.matches)
  quiet.addEventListener?.('change', (e) => setEnabled(!e.matches))
}

// Fire a named cue. Safe to call anywhere; a no-op when disabled.
export function cue(name) {
  play(name)
}
