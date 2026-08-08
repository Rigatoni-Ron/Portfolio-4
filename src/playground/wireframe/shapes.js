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
//   verts       how many meridians this shape wants (default: the prop)
//   vertPhase   where the first meridian sits, 0..1 around the contour
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

// A stack of slabs. Each boundary between slabs is two rings sharing one
// height — the outer radius arriving, then the inner radius leaving — and that
// shared height is what makes the corner crisp instead of ramped.
//
// This replaced a stepped pyramid that used every ring for a step and tapered
// hard, which read as a ziggurat rather than as blocks. The fixes were fewer,
// chunkier slabs and much less taper: enough that each one is legible as its
// own block, not enough to make a cone out of them. Spare rings pile up
// coincidentally, which costs nothing.
function slabStack({ slabs = 4, base = 1, top = 0.7, span = 1.72 } = {}) {
  const h = span / slabs
  const rOf = (k) => base + (top - base) * (k / slabs)
  const keys = [[-span / 2, rOf(0)]]
  for (let k = 1; k <= slabs; k++) {
    keys.push([-span / 2 + k * h, rOf(k - 1)]) // top of the wall below
    if (k < slabs) keys.push([-span / 2 + k * h, rOf(k)]) // tread stepping in
  }
  return (i, R) => {
    const k = Math.min(keys.length - 1, Math.round((i / Math.max(1, R - 1)) * (keys.length - 1)))
    return { y: keys[k][0], r: keys[k][1] }
  }
}

// A globe. Two things separate this from the `sin(pi v)` profile it replaced,
// which came out visibly pointed at the poles:
//
//   - the radius is the actual circle, sqrt(1 - y^2). `sin` is not that: at a
//     quarter height it gives 0.71 where a sphere is 0.87, and the difference
//     is exactly the pinch that showed.
//   - rings step by equal *latitude* rather than equal height, which is how a
//     graticule is drawn — so they bunch toward the poles the way a globe's do.
function globe() {
  return (i, R) => {
    const lat = (i / Math.max(1, R - 1) - 0.5) * Math.PI
    return { y: Math.sin(lat), r: Math.cos(lat) }
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

  // Staking — value locked up in blocks. Four meridians, phased onto the
  // corners: on a squared form the default even spread lands lines up the
  // middle of each face, which read as arbitrary cuts rather than as edges.
  { id: 'tiers', label: 'Staking', n: 14, at: slabStack(), verts: 4, vertPhase: 0.125 },

  // Custody. Was a plain cylinder, which read as the same object as Deposits —
  // both just a ribbed tube. Now squared off and given a stepped lid, so it
  // differs from the stack in silhouette and not only in ring rhythm.
  { id: 'vault', label: 'Vault', n: 8, at: canister(), verts: 8, vertPhase: 0.0625 },

  // A bar of metal, squared off and drafted the way one is actually cast.
  // Squared, so its meridians go on the corners too.
  { id: 'ingot', label: 'Ingot', n: 14, height: 0.78, profile: (v) => 1 - 0.19 * v, verts: 4, vertPhase: 0.125 },

  // Order flow, routing, aggregation.
  { id: 'funnel', label: 'Funnel', n: 2, profile: (v) => 0.08 + v * 0.95 },

  // Time — the other axis every financial product has.
  { id: 'term', label: 'Term', n: 2, profile: (v) => 0.14 + Math.abs(v - 0.5) * 1.62 },

  // Global markets.
  { id: 'globe', label: 'Markets', n: 2, at: globe(), verts: 12 },
]

/*
 * Cut, and why — so it doesn't get re-proposed:
 *
 *   Star, Bloom, Twist, Octahedron   decorative only, no financial referent.
 *   Column (fluted)                  read as corn on the cob, and duplicated
 *                                    the Vault's cylinder anyway.
 */
