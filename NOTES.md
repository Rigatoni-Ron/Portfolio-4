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

- **CV "Download PDF" doesn't download.** It calls `window.print()`, so it
  opens a print dialog — a recruiter hit this and got Safari's "this webpage is
  trying to print". Recommended fix: pre-generate the PDF, commit it to
  `public/`, and make the button a plain `<a download>`. Cost is that it's a
  snapshot needing regeneration when the CV changes (Vercel's Linux build has no
  Chrome, so generate locally). Alternatives: rename the button to "Print"
  (honest, no file), or client-side jsPDF (a dependency, worse output). Keep the
  `@media print` light sheet either way — it's what renders the file.

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
