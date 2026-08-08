/*
 * Palette pulled out of the reference photograph, not eyeballed. Lives here
 * rather than in the lab because the shipped piece now uses it.
 *
 * Method: downscale to 200×133, convert to HSL, bucket by hue, and take the
 * most vivid mid-lightness pixel in each bucket. A plain k-means over the
 * pixels was tried first and came back washed out (#4869b0, #776ede, #649255)
 * because it averages across texture — the colours a person actually reads are
 * the saturated end of each hue family, not the mean of it.
 *
 * The one hand adjustment: the moss green measures h117 s0.60 l0.35, which is
 * darker than it looks in the photo — it only reads bright there because it
 * sits against pink and violet. On a near-black page at l0.35 it disappears,
 * so the green here keeps the measured hue and gets its lightness lifted.
 */

export const PALETTE = {
  moss: '#3fbf34', // h117, measured l0.35 lifted to ~0.48 for a dark ground
  lime: '#7fdc4a',
  blue: '#715cfb', // measured
  indigo: '#5a6fd8',
  violet: '#c675ff', // measured
  magenta: '#e05eff', // measured
  pink: '#ff6398', // measured
  coral: '#ff7a6a',
}

// Ramps, as [hex, hex, ...] stops. Named for what they're borrowed from.
export const RAMPS = {
  // The sky, bottom to top: indigo through violet into pink.
  sky: [PALETTE.indigo, PALETTE.blue, PALETTE.violet, PALETTE.magenta, PALETTE.pink],
  // The landscape, ground to sky: moss up through the rock into the flowers.
  land: [PALETTE.moss, PALETTE.lime, PALETTE.blue, PALETTE.violet, PALETTE.pink],
  // The whole image as one loop, so a sweep can wrap without a seam.
  loop: [PALETTE.moss, PALETTE.blue, PALETTE.violet, PALETTE.pink, PALETTE.coral, PALETTE.lime, PALETTE.moss],
  // Just the two poles, for the hard-split treatment.
  duo: [PALETTE.moss, PALETTE.pink],
}

const hexToRgb = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]
const RGB = Object.fromEntries(Object.entries(RAMPS).map(([k, v]) => [k, v.map(hexToRgb)]))

// Stretch a 0..1 value that only ever occupies part of the range back out to
// the full range. Depth is the case that needs it: zNorm is normalised against
// a fixed reference depth, so a shape narrower than that reference only ever
// visits the middle of a ramp, and the gradient reads as one flat colour.
export const stretch = (t, lo = 0.16, hi = 0.84) => Math.min(1, Math.max(0, (t - lo) / (hi - lo)))

// Sample a ramp at t (0..1). Returns an `rgb()` string — cheaper to build than
// hex and the browser parses it just as fast.
export function ramp(name, t) {
  const stops = RGB[name]
  const x = Math.min(0.99999, Math.max(0, t)) * (stops.length - 1)
  const i = Math.floor(x)
  const f = x - i
  const a = stops[i]
  const b = stops[i + 1]
  return `rgb(${Math.round(a[0] + (b[0] - a[0]) * f)},${Math.round(a[1] + (b[1] - a[1]) * f)},${Math.round(a[2] + (b[2] - a[2]) * f)})`
}

/*
 * The shipped treatment: depth sets brightness, a slow sweep sets hue.
 *
 * Chosen over the seven alternatives in the /colour.html study because it's the
 * only one that keeps the monochrome version's depth reading — every other
 * treatment spends the brightness channel on colour and the form goes flat.
 * `stretch` is doing real work here: without it the ramp only ever visits its
 * middle and the whole object comes out one hue.
 */
export function depthSweep(el, i) {
  el.style.stroke = ramp('loop', (i.angle * 0.8 + i.vNorm * 0.25 + i.t * 0.06) % 1)
  el.style.opacity = 0.18 + stretch(1 - i.zNorm) * 0.82
}
