// The shape system.
//
// Every shape here is the *same object*: a stack of closed contour rings along
// the Y axis, each ring sampled at the same number of points. Because the
// topology never changes, morphing between any two shapes is a plain lerp of
// matching points — no path parser, no flubber, no correspondence problem.
//
// A shape is therefore not a drawing. It's a few numbers and a function:
//
//   profile(v)  radius at height v (0 = bottom, 1 = top) — for smooth forms
//   at(i, R)    full control of ring i's height AND radius
//   n           superellipse exponent — 1 diamond, 2 circle, 14+ square
//   lobes/amp   modulation around the contour
//   height      total Y extent, when using `profile`
//
// The thing that took a rewrite to learn: **how many contour lines a form gets
// is part of the drawing, not a resolution setting.** A globe wants every ring
// it can get. A coin wants two. Feeding a coin thirteen evenly-spaced rings
// produces a hatched band, not a coin. So most shapes here place their rings
// explicitly with `bands`, and let the spares pile up coincidentally — which
// costs nothing and keeps every shape morph-compatible.

const TAU = Math.PI * 2

// Superellipse cross-section, optionally lobed.
function section(a, n = 2, lobes = 0, amp = 0) {
  const c = Math.cos(a)
  const s = Math.sin(a)
  const e = 2 / n
  let x = Math.sign(c) * Math.abs(c) ** e
  let z = Math.sign(s) * Math.abs(s) ** e
  if (lobes) {
    const k = 1 + amp * Math.cos(lobes * a)
    x *= k
    z *= k
  }
  return [x, z]
}

// Expand a shape description into [rings][points][x,y,z].
export function buildShape(shape, rings, points) {
  const height = shape.height ?? 2
  const out = []
  for (let i = 0; i < rings; i++) {
    const v = rings === 1 ? 0.5 : i / (rings - 1)
    const { y, r } = shape.at
      ? shape.at(i, rings)
      : { y: (v - 0.5) * height, r: shape.profile(v) }
    const ring = new Array(points)
    for (let j = 0; j < points; j++) {
      const [sx, sz] = section((j / points) * TAU, shape.n, shape.lobes, shape.amp)
      ring[j] = [sx * r, y, sz * r]
    }
    out.push(ring)
  }
  return out
}

/*
 * Ring placement helpers. All three are monotonic in y on purpose — a ring
 * that steps back down would fold the meridians over themselves.
 */

// Snap the available rings onto a short list of [y, radius] key rings. Two
// keys at the same height make a flat annulus; two at the same radius make a
// wall. This is how a shape asks for four lines instead of thirteen.
function bands(keys) {
  return (i, R) => {
    const k = Math.round((i / Math.max(1, R - 1)) * (keys.length - 1))
    const [y, r] = keys[k]
    return { y, r }
  }
}

// A stack of discs — a pair of rings at each disc's near and far rim, so every
// coin reads as a doubled line rather than the stack reading as one cylinder.
function coinStack(radius = 0.92, span = 1.9) {
  return (i, R) => {
    const coins = Math.max(2, R >> 1)
    const u = (i / Math.max(1, R - 1)) * coins
    const k = Math.min(coins - 1, Math.floor(u))
    const rim = u - k < 0.5 ? 0.08 : 0.92
    return { y: ((k + rim) / coins - 0.5) * span, r: radius }
  }
}

// A stepped pyramid. Every step is two rings sharing one height: the outer
// radius arriving, then the inner radius leaving. That shared height is the
// tread, and it's why the corner comes out crisp instead of ramped.
function steppedPyramid(base = 1, top = 0.22, span = 1.8) {
  return (i, R) => {
    const steps = Math.max(1, (R - 1) >> 1)
    const h = span / steps
    const rOf = (s) => base + (top - base) * (s / steps)
    if (i === 0) return { y: -span / 2, r: rOf(0) }
    const s = ((i - 1) >> 1) + 1
    const tread = (i - 1) & 1
    return { y: -span / 2 + s * h, r: rOf(tread ? s : s - 1) }
  }
}

/*
 * The set. Every form has a financial referent — that's the constraint, and
 * it's tighter than "shapes the lathe can make". Anything only decorative (the
 * star, the flower, the twist) is gone, and so is a fluted column that read as
 * corn. This is meant to look like the start of a brand's illustration
 * language, not a geometry demo.
 */
export const SHAPES = [
  // The atom of the set. Two rims and an inset top face — that inset is the
  // struck edge every real coin has, and it's what stops this reading as a
  // plain cylinder.
  { id: 'coin', label: 'Coin', n: 2, at: bands([[-0.17, 1], [0.17, 1], [0.17, 0.84]]) },

  // Deposits — value accumulating.
  { id: 'stack', label: 'Deposits', n: 2, at: coinStack() },

  // Staking — tiers locking up. The reference's own staking illustration.
  { id: 'tiers', label: 'Staking', n: 14, at: steppedPyramid() },

  // Custody: a canister with a lid, drawn in four lines.
  { id: 'vault', label: 'Vault', n: 2, at: bands([[-0.8, 0.82], [0.5, 0.82], [0.5, 0.64], [0.82, 0.64]]) },

  // A bar of metal, squared off and drafted the way one is actually cast.
  { id: 'ingot', label: 'Ingot', n: 14, at: bands([[-0.34, 1], [0.34, 0.78]]) },

  // Order flow, routing, aggregation. A cone is two circles and its sides.
  { id: 'funnel', label: 'Funnel', n: 2, at: bands([[-0.88, 0.1], [0.88, 1]]) },

  // Time — the other axis every financial product has.
  { id: 'term', label: 'Term', n: 2, at: bands([[-0.9, 0.95], [0, 0.13], [0.9, 0.95]]) },
]

/*
 * Cut, and why — so it doesn't get re-proposed:
 *
 *   Star, Bloom, Twist, Octahedron   decorative only, no financial referent.
 *   Column (fluted)                  read as corn on the cob, and duplicated
 *                                    the Vault's cylinder anyway.
 *   Globe (sphere)                   a sphere's true silhouette is a circle,
 *                                    but the outline here is stitched through
 *                                    each ring's screen-x extremes, which for
 *                                    a sphere falls *inside* that circle and
 *                                    renders it visibly squashed. Drawing it
 *                                    properly needs a real envelope solve.
 */
