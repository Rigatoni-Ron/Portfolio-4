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
// Nearly every form here is a smooth `profile`, sampled at every ring. That
// even spread is deliberate: the renderer fades each ring segment by its own
// depth, so a full mesh reads as a shaded, dimensional object. Collapsing a
// shape onto two or three key rings was tried and abandoned — it drew a
// cleaner *diagram*, but the set lost the sense of being one material.

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

// A body with a stepped lid. Rings spread through the body, then one lands at
// the shoulder — same height as the last body ring but a smaller radius, which
// makes a flat annulus — and the rest run up the lid. That shared height is
// what turns the shoulder into a crisp step instead of a taper.
function canister({ body = 0.84, lid = 0.58, shoulder = 0.28, base = -0.86, top = 0.72, lidRings = 3 } = {}) {
  return (i, R) => {
    const bodyRings = Math.max(2, R - lidRings - 1)
    if (i < bodyRings) return { y: base + (shoulder - base) * (i / (bodyRings - 1)), r: body }
    if (i === bodyRings) return { y: shoulder, r: lid }
    return { y: shoulder + (top - shoulder) * ((i - bodyRings) / lidRings), r: lid }
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
 * star, the flower, the twist) is gone. This is meant to read as the start of
 * a brand's illustration language, not a geometry demo.
 *
 * Five of the eight are lifted straight from the first pass, because those
 * forms were already the strongest — they just needed the right names.
 */
export const SHAPES = [
  // The atom of the set. A wide, shallow disc.
  { id: 'coin', label: 'Coin', n: 2, height: 0.34, profile: () => 1.02 },

  // Deposits — value accumulating.
  { id: 'stack', label: 'Deposits', n: 2, at: coinStack() },

  // Staking — tiers locking up. The reference's own staking illustration.
  { id: 'tiers', label: 'Staking', n: 14, at: steppedPyramid() },

  // Custody. Was a plain cylinder, which read as the same object as Deposits —
  // both just a ribbed tube. Now squared off and given a stepped lid, so it
  // differs from the stack in silhouette and not only in ring rhythm.
  { id: 'vault', label: 'Vault', n: 8, at: canister() },

  // A bar of metal, squared off and drafted the way one is actually cast.
  { id: 'ingot', label: 'Ingot', n: 14, height: 0.78, profile: (v) => 1 - 0.19 * v },

  // Order flow, routing, aggregation.
  { id: 'funnel', label: 'Funnel', n: 2, profile: (v) => 0.08 + v * 0.95 },

  // Time — the other axis every financial product has.
  { id: 'term', label: 'Term', n: 2, profile: (v) => 0.14 + Math.abs(v - 0.5) * 1.62 },

  // Global markets.
  { id: 'globe', label: 'Markets', n: 2, profile: (v) => Math.sin(Math.PI * v) },
]

/*
 * Cut, and why — so it doesn't get re-proposed:
 *
 *   Star, Bloom, Twist, Octahedron   decorative only, no financial referent.
 *   Column (fluted)                  read as corn on the cob, and duplicated
 *                                    the Vault's cylinder anyway.
 */
