import { useEffect, useMemo, useRef, useState } from 'react'
import NumberFlow from '@number-flow/react'

/*
 * Crypto Glass — dark-native rebuild of the "liquid glass" crypto widget.
 *   variant="tile"  → collapsed pill only, non-interactive (Playground tile)
 *   variant="full"  → starts collapsed; tap the pill to expand into the card
 *                     (live area chart + full-width range tabs)
 * Mock data only (seeded random walk that live-ticks) — no network.
 */

const RANGES = ['1D', '1M', '3M', '1Y', '5Y']
const RANGE_CFG = {
  '1D': { n: 50, vol: 6, drift: 0.5 },
  '1M': { n: 60, vol: 20, drift: 1.2 },
  '3M': { n: 66, vol: 38, drift: 3 },
  '1Y': { n: 74, vol: 80, drift: 6 },
  '5Y': { n: 82, vol: 150, drift: 14 },
}

// Distinct seed per range label (avoids collisions between same-length labels).
const seedFor = (s) => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) | 0, 7)

function mulberry32(a) {
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function genSeries(end, cfg, seed) {
  const rnd = mulberry32(seed)
  const pts = new Array(cfg.n)
  let v = end - cfg.drift * cfg.n * 0.1
  for (let i = 0; i < cfg.n; i++) {
    v += (rnd() - 0.5) * cfg.vol + cfg.drift * 0.1
    pts[i] = v
  }
  const shift = end - pts[cfg.n - 1]
  for (let i = 0; i < cfg.n; i++) pts[i] += shift * (i / (cfg.n - 1))
  return pts
}

function toPaths(series, w, h, pad = 2) {
  const min = Math.min(...series)
  const max = Math.max(...series)
  const span = max - min || 1
  const dx = (w - pad * 2) / (series.length - 1)
  const pt = (i) => [pad + i * dx, pad + (h - pad * 2) * (1 - (series[i] - min) / span)]
  let line = ''
  for (let i = 0; i < series.length; i++) {
    const [x, y] = pt(i)
    if (i === 0) line += `M ${x.toFixed(1)} ${y.toFixed(1)}`
    else {
      const [px, py] = pt(i - 1)
      const cx = (px + x) / 2
      line += ` C ${cx.toFixed(1)} ${py.toFixed(1)} ${cx.toFixed(1)} ${y.toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)}`
    }
  }
  const [lastX] = pt(series.length - 1)
  const area = `${line} L ${lastX.toFixed(1)} ${h} L ${pad} ${h} Z`
  return { line, area }
}

// Official Ethereum diamond (cryptologos.cc), on a circular badge.
function EthMark({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="12" fill="#33343a" />
      <svg x="6.4" y="3.6" width="11.2" height="16.8" viewBox="0 0 784.37 1277.39" preserveAspectRatio="xMidYMid meet">
        <polygon fill="#fff" fillOpacity="0.6" points="392.07,0 383.5,29.11 383.5,873.74 392.07,882.29 784.13,650.54 " />
        <polygon fill="#fff" points="392.07,0 -0,650.54 392.07,882.29 392.07,472.33 " />
        <polygon fill="#fff" fillOpacity="0.6" points="392.07,956.52 387.24,962.41 387.24,1263.28 392.07,1277.38 784.37,724.89 " />
        <polygon fill="#fff" points="392.07,1277.38 392.07,956.52 -0,724.89 " />
        <polygon fill="#fff" fillOpacity="0.2" points="392.07,882.29 784.13,650.54 392.07,472.33 " />
        <polygon fill="#fff" fillOpacity="0.45" points="0,650.54 392.07,882.29 392.07,472.33 " />
      </svg>
    </svg>
  )
}

export default function CryptoGlass({ variant = 'full' }) {
  const isTile = variant === 'tile'
  const [open, setOpen] = useState(false) // full starts collapsed
  const [range, setRange] = useState('1D')
  const [price, setPrice] = useState(1632.5)
  const dayOpen = useRef(1596.0)

  const [series, setSeries] = useState(() => genSeries(1632.5, RANGE_CFG['1D'], 11))

  // Rebuild the series when the range changes (full only).
  useEffect(() => {
    if (isTile) return
    setSeries(genSeries(price, RANGE_CFG[range], seedFor(range)))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range])

  // Live tick.
  useEffect(() => {
    const id = setInterval(
      () => setPrice((p) => Math.max(1420, Math.min(1840, p + (Math.random() - 0.47) * (isTile ? 2 : 3.2)))),
      isTile ? 1800 : 1300,
    )
    return () => clearInterval(id)
  }, [isTile])

  useEffect(() => {
    setSeries((s) => [...s.slice(1), price])
  }, [price])

  const delta = ((price - dayOpen.current) / dayOpen.current) * 100
  const up = delta >= 0

  const W = 560
  const H = 190
  const { line, area } = useMemo(() => toPaths(series, W, H), [series])
  const stroke = up ? 'var(--cg-up)' : 'var(--cg-down)'

  // Header row — identical in collapsed + expanded (icon left, price/delta right).
  const row = (
    <div className="cg-row">
      <EthMark size={isTile ? 20 : 26} />
      <div className="cg-id">
        <span className="cg-name">ETH / USD</span>
        <span className="cg-ticker">Ethereum network</span>
      </div>
      <div className="cg-quote">
        <NumberFlow
          className="cg-price"
          value={price}
          format={{ style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 }}
          willChange
        />
        <span className={`cg-delta ${up ? 'up' : 'down'}`}>
          <span className="cg-arrow">{up ? '▲' : '▼'}</span>
          <NumberFlow
            value={Math.abs(delta)}
            format={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }}
            suffix="%"
            willChange
          />
        </span>
      </div>
    </div>
  )

  if (isTile) {
    return (
      <div className="cg-tile" aria-hidden="true">
        <div className="cg-glass cg-card">{row}</div>
      </div>
    )
  }

  return (
    <div className="cg-full">
      {/* The whole card is the toggle: hover lights it up, clicking anywhere
          expands/collapses. Range tabs stopPropagation so they don't collapse. */}
      <div
        className={`cg-glass cg-card ${open ? 'is-open' : ''}`}
        role="button"
        tabIndex={0}
        aria-expanded={open}
        aria-label={open ? 'Collapse widget' : 'Expand widget'}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            setOpen((o) => !o)
          }
        }}
      >
        {row}

        {/* Reveal (chart + full-width tabs); grid-rows animates the height.
            Padding lives on the body (not the clipped element) so the collapsed
            state is a true 0 height with no residual space under the pill. */}
        <div className="cg-reveal">
          <div className="cg-reveal-inner">
            <div className="cg-reveal-body">
              <div className="cg-chart">
                <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="cg-fill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={stroke} stopOpacity="0.28" />
                      <stop offset="100%" stopColor={stroke} stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path d={area} fill="url(#cg-fill)" />
                  <path d={line} fill="none" stroke={stroke} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>

              <div
                className="cg-ranges"
                style={{ '--cg-idx': RANGES.indexOf(range) }}
                onClick={(e) => e.stopPropagation()}
              >
                <span className="cg-range-pill" />
                {RANGES.map((r) => (
                  <button
                    key={r}
                    type="button"
                    className={`cg-range ${r === range ? 'active' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation()
                      setRange(r)
                    }}
                  >
                    <span>{r}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
