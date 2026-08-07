// The shape system.
//
// Every shape here is the *same object*: a stack of closed contour rings along
// the Y axis, each ring sampled at the same number of points. Because the
// topology never changes, morphing between any two shapes is a plain lerp of
// matching points — no path parser, no flubber, no correspondence problem.
//
// A shape is therefore not a drawing. It's four numbers and two functions:
//
//   profile(v)  radius at height v (0 = bottom, 1 = top)
//   n           superellipse exponent — 1 diamond, 2 circle, 16+ square
//   lobes/amp   petal modulation around the contour (stars, flowers)
//   twist(v)    radians the cross-section is rotated at height v
//   height      total Y extent
//
// Adding a shape means adding a row to SHAPES, not drawing anything.

const TAU = Math.PI * 2

// Superellipse cross-section, optionally lobed. Returns a point on the unit
// contour for angle `a`.
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
    const y = (v - 0.5) * height
    const r = shape.profile(v)
    const tw = shape.twist ? shape.twist(v) : 0
    const ct = Math.cos(tw)
    const st = Math.sin(tw)
    const ring = new Array(points)
    for (let j = 0; j < points; j++) {
      const [sx, sz] = section((j / points) * TAU, shape.n, shape.lobes, shape.amp)
      const x = sx * r
      const z = sz * r
      ring[j] = [x * ct - z * st, y, x * st + z * ct]
    }
    out.push(ring)
  }
  return out
}

export const SHAPES = [
  { id: 'sphere', label: 'Sphere', n: 2, profile: (v) => Math.sin(Math.PI * v) },
  { id: 'cube', label: 'Cube', n: 18, profile: () => 0.78 },
  { id: 'twist', label: 'Twist', n: 18, profile: () => 0.74, twist: (v) => v * Math.PI * 0.55 },
  { id: 'cone', label: 'Cone', n: 2, profile: (v) => 0.02 + (1 - v) * 0.98 },
  { id: 'hourglass', label: 'Hourglass', n: 2, profile: (v) => 0.14 + Math.abs(v - 0.5) * 1.7 },
  { id: 'star', label: 'Star', n: 2, lobes: 5, amp: 0.34, profile: () => 0.78 },
  { id: 'vase', label: 'Vase', n: 2, profile: (v) => 0.52 + 0.3 * Math.cos(v * Math.PI * 2.6) },
  { id: 'octa', label: 'Octahedron', n: 1, profile: (v) => Math.sin(Math.PI * v) * 1.15 },
  { id: 'disc', label: 'Disc', n: 2, height: 0.34, profile: () => 1.02 },
  { id: 'bloom', label: 'Bloom', n: 2, lobes: 8, amp: 0.2, profile: (v) => Math.sin(Math.PI * v) * 1.05 },
]
