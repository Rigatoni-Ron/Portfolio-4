# Portfolio 4 — working notes

Backlog and decisions for this site. Kept in the repo on purpose: it travels
into every git worktree and survives any change of tooling.

Live at **aaronchartrand.me** (Vercel, deploys from `main`). Kept out of search
results by a `noindex` meta tag plus an `X-Robots-Tag` header in `vercel.json` —
`robots.txt` deliberately *allows* crawling, because a crawler that is blocked
never reads the noindex and the bare URL can still get listed.

---

## Open

### Big

- **Mobile / responsive pass.** Desktop-first today. `index.css` has three
  breakpoints (Playground grid to one column at ≤1300, Work columns stack at
  ≤900, header padding at ≤560). Still needed: particle header and modal at
  phone widths, and confirming the four live Playground pieces are usable or
  degrade on touch. The custom cursor is already correctly gated off for touch.

### Features

- **Email icon should copy to clipboard.** `SocialLinks.jsx` is a plain
  `mailto:` today. Needs a visible confirmation, and a decision on whether the
  mail client still opens.

- **Ring layout for the Work tab.** Prototype lives on the `ring-prototype`
  branch: all seven tiles (3 shipped + 4 playground) on one slowly drifting
  ellipse, replacing the two-column layout. Unfinished: shipped cards don't
  morph into the modal, because `ProjectModal` hands off via `layoutId` and the
  ring has no matching partner. Fixing it properly means moving `ProjectModal`
  to the explicit FLIP-from-rect pattern `PlaygroundViewer` already uses.

- **New Playground piece: form fields that morph into a summary.** Type into
  fields; as each completes it leaves the form and joins an accumulating
  summary. Reference: a segmented per-character input where five separate slots
  become one object on completion. Note: `layoutId` is the obvious tool and is
  **banned** inside a Playground piece (see Gotchas) — plan a hand-rolled FLIP.

- **Settlements as a Send → Review → Success deck.** The hero deck mechanism is
  generic; this is mostly building two more panels so the modal reads as a
  sequence rather than a gallery.

### Polish

- Freeze the Playground tiles and particle header while a project modal is open.
- Blink the blue caret in the Settlements Send panel while its modal is open.
- Header motion is frame-rate dependent — it runs about twice as fast on a
  120Hz display. Wants a delta-time refactor.
- Playground tiles sit empty for a beat on load (measured 348ms on desktop,
  ~1.3s at 4× CPU). Cause is an idle gate plus `<Suspense fallback={null}>`,
  and the delay is mostly chunk parse and mount, not network. Options: a real
  Suspense fallback, crossfading tiles in, revealing them as a set, or splitting
  the 300KB Node Builder chunk.

### Experiments

- Dark-brown tint for the Nested Menu piece.
- Where to link the inspo garden (`inspo-canvas-v2.vercel.app`). Rejected as a
  Playground tile — too light, pulled focus on the dark page.
- The two throwaway prototypes in `public/` (`wind-header.html`, `loaders.html`)
  may become their own repos.
- Sound: cues exist on tab toggle, card and tile press, close, deck nav, and
  link-outs. Whether hovers and a mute control get added is open.

---

## Settled — don't revisit

- **CV "Download PDF".** Was `window.print()`, which opened a print dialog and
  tripped Safari's "this webpage is trying to print" on a recruiter. Now a
  committed file: `public/aaron-chartrand-cv.pdf`, served by a plain
  `<a download>`. The file is still the browser's own print output — vector
  type, selectable text, live links — so the `@media print` sheet in `cv.css`
  is what renders it and still matters.

  **There is nothing to remember.** `scripts/ensure-cv-pdf.mjs` runs on
  `npm run dev`, on `npm run build`, and from a `pre-commit` hook — every point
  the CV could have changed. It hashes `cv.html`, `src/cv.jsx`, `src/cv.css`,
  and `Cv.jsx`, compares that against `scripts/cv-pdf.stamp.json`, and does
  nothing at all when they agree (a third of a second). When they don't, it
  rebuilds the PDF, and the hook stages it into the same commit. Regenerating
  takes about seven seconds and adds no dependency: it prints through whatever
  Chrome is already installed.

  The hook is installed by the `prepare` script, which points
  `core.hooksPath` at `.githooks/` on `npm install`. That's why the hook is
  committed rather than living in `.git/hooks`, where it would die with the
  worktree.

  `npm run cv:pdf` still exists for regenerating by hand, but shouldn't be
  needed.

  **On Vercel it can only refuse,** because that build image has no Chrome to
  print with — so a stale PDF fails the deploy rather than shipping. That's the
  right trade (a stale CV reaching a recruiter is worse), but it means the
  `vercel.json` gotcha below applies here too: check the commit status, don't
  trust the push.

- **Wireframe — the fifth Playground piece.** `src/playground/wireframe/`. A
  hand-rolled 3D pipeline into SVG: rotate points with a matrix, project, write
  the result into a `d` attribute every frame. No dependencies.

  Every shape is the *same object* — a stack of closed contour rings along Y —
  so all shapes share point-for-point topology and morphing is a plain lerp. No
  path parser, no flubber. A shape is a ring-placement function plus a
  superellipse exponent (`shapes.js`); adding one is a row in a table.

  **The brief is a finance illustration language,** not a geometry demo — the
  reference is Robinhood Chain's line drawings. What carries that read:

  1. *The camera sits at 35.26°* (`ISO_TILT`, `atan(1/√2)`) — the isometric
     elevation, which is the angle that reads as a technical drawing. The
     projection itself is **perspective**: orthographic is the more literal
     match for the reference, but paired with the depth fade it read flat, and
     the size falloff is what gives the forms volume. `ortho={true}` restores
     the parallel projection.
  2. *A depth gradient, not a hard front/back split.* Each ring is cut into
     `segments` pieces and each piece is dimmed by its own depth.

  **Hidden-line removal was built and reverted — don't rebuild it.** Drawing
  one front arc and one back arc per ring, split at the silhouette, gives a
  cleaner still frame and genuinely reads as a solid object. It fails in
  motion, three ways, all from the same root: the split lands on a whole
  sample, so it hops ~4° at a time as the shape turns, which reads as a shake
  on any smooth circular edge (measured: max/median frame step 8.7 on the
  cylinder, 5.0 on the hourglass — versus 2.5 and 1.4 with fixed segment
  boundaries). The per-ring occlusion flag also flips discretely, popping whole
  rings between half and whole mid-morph, and the hard boundary flattens the
  dimensionality the gradient gives you. If it's ever revisited it needs
  sub-sample interpolation on every boundary *and* a continuous occlusion term,
  which is a lot of machinery to buy back a look the gradient already gets.

  Same story for collapsing shapes onto two or three key rings: a tighter
  diagram, but the set stopped reading as one material. Rings spread evenly now.

  **Measured, don't re-litigate.** 0.40ms per frame at tile resolution
  (96 paths), 1.03ms at full (192), 1.9ms at a 318-path stress test — 2%, 6%
  and 11% of a 60fps budget. Only the tile figure runs five-up — there is
  never more than one opened piece. Against the whole page it is below noise.
  Deliberately has no offscreen pause, per the entry below; it does take an
  unused `paused` prop for the freeze-tiles-while-a-modal-is-open item.

  Shapes that were cut, and why, are listed at the bottom of `shapes.js` so
  they don't get re-proposed.

  Tuning harness at `/lab.html` (`src/lab/`, dev-only, kept out of the build) —
  live sliders for every parameter, plus `?shape=vault&auto=0&draw=0&preset=Flat`
  for landing a screenshot on a settled frame.

- **Offscreen tile pausing.** Built, measured, reverted. Negligible saving on a
  page barely taller than the viewport.
- **Light mode.** Bright panels pulled focus on the dark page. Dead end.
- **Liquid glass on the product shots.** Built with Aave's `feDisplacementMap`
  technique and reverted. It read as "lower opacity" rather than glass, because
  refraction without blur misses the dominant cue — and the map generation plus
  a per-frame re-measure loop cost real time at mount. If revisited: blur a
  *static* copy inside the panel (not `backdrop-filter`, which re-samples the
  live backdrop every frame), add a rim highlight, and generate maps at idle.
- Removing the Collateral card border; placeholder social links.

---

## Gotchas worth knowing

- **`vercel.json` rejects unknown keys.** A `"//"` comment failed two deploys
  outright, and Vercel keeps serving the last good build — so the site looked
  fine while a new route 404'd and `git push` reported success. Check
  `gh api repos/Rigatoni-Ron/Portfolio-4/commits/<sha>/status --jq .state`
  after pushing, not just the push itself.

- **No `layoutId` inside a Playground piece.** A shared-layout element inside
  the viewer's `AnimatePresence` child keeps the exiting panel alive; after one
  reopen-and-close an invisible full-page layer blocks every click. The `layout`
  prop is fine, and so is a hand-rolled FLIP.

- **Don't drive an animation loop through React state** when live components are
  on screen. The ring did this first and hung the browser — seven cards and
  their live tiles re-rendering sixty times a second. Write transforms to the
  DOM through refs.

- **`__dirname` doesn't exist here** — the package is `type: module`. Vite shims
  it in the config, so a build can pass locally and fail elsewhere.

- **Getting a rect during a FLIP returns transformed values,** and a
  `ResizeObserver` won't correct it, because a transform doesn't change layout
  size.

- **Print sheets:** the site is dark, but the CV prints light on purpose. A dark
  PDF depends on the reader leaving "background graphics" on, and floods the
  page when they don't.
