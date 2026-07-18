import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'

/*
 * Crypto Glass — dark-native rebuild of the "liquid glass" crypto widget.
 * One component, two variants:
 *   variant="tile"  → compact, non-interactive live pill (for the Playground tile)
 *   variant="full"  → expanded glass card: live area chart + range toggles
 * Mock data only (seeded random walk that live-ticks) — no network.
 */

const RANGES = ['1H', '1D', '1W', '1M']
const RANGE_CFG = {
  '1H': { n: 42, vol: 2.2, drift: 0.15 },
  '1D': { n: 50, vol: 6, drift: 0.5 },
  '1W': { n: 58, vol: 15, drift: 1.3 },
  '1M': { n: 64, vol: 34, drift: -1.8 },
}

// Small seeded PRNG so a given range renders a stable series.
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
  // pin the last point to the current price so the chart meets the headline
  const shift = end - pts[cfg.n - 1]
  for (let i = 0; i < cfg.n; i++) pts[i] += shift * (i / (cfg.n - 1))
  return pts
}

// Build a smooth line + area path from a series.
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

const fmt = (n) =>
  n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

function EthMark({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="12" fill="#5b6cff" />
      <path d="M12 3.5 7.2 12 12 14.8 16.8 12 12 3.5Z" fill="#fff" fillOpacity="0.9" />
      <path d="M12 15.7 7.2 12.9 12 20.5 16.8 12.9 12 15.7Z" fill="#fff" fillOpacity="0.65" />
    </svg>
  )
}

export default function CryptoGlass({ variant = 'full' }) {
  const isTile = variant === 'tile'
  const [range, setRange] = useState('1D')
  const [price, setPrice] = useState(1632.5)
  const dayOpen = useRef(1596.0)

  const cfg = isTile ? RANGE_CFG['1D'] : RANGE_CFG[range]
  const [series, setSeries] = useState(() => genSeries(1632.5, RANGE_CFG['1D'], 11))

  // Rebuild the series when the range changes (full only).
  useEffect(() => {
    if (isTile) return
    setSeries(genSeries(price, RANGE_CFG[range], range.charCodeAt(0) + range.length * 7))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range])

  // Live tick: nudge the price on an interval.
  useEffect(() => {
    const id = setInterval(
      () => setPrice((p) => Math.max(1420, Math.min(1840, p + (Math.random() - 0.47) * (isTile ? 2 : 3.2)))),
      isTile ? 1800 : 1300,
    )
    return () => clearInterval(id)
  }, [isTile])

  // Stream the new price into the tail of the series.
  useEffect(() => {
    setSeries((s) => [...s.slice(1), price])
  }, [price])

  const delta = ((price - dayOpen.current) / dayOpen.current) * 100
  const up = delta >= 0

  const W = isTile ? 96 : 560
  const H = isTile ? 34 : 200
  const { line, area } = useMemo(() => toPaths(series, W, H), [series, W, H])
  const stroke = up ? 'var(--cg-up)' : 'var(--cg-down)'

  if (isTile) {
    return (
      <div className="cg-tile" aria-hidden="true">
        <div className="cg-glass cg-pill">
          <EthMark size={20} />
          <div className="cg-pill-id">
            <span className="cg-name">Ethereum</span>
            <span className="cg-ticker">ETH / USD</span>
          </div>
          <svg className="cg-spark" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
            <path d={line} fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
          </svg>
          <div className="cg-pill-num">
            <span className="cg-price">${fmt(price)}</span>
            <span className={`cg-delta ${up ? 'up' : 'down'}`}>
              {up ? '▲' : '▼'} {Math.abs(delta).toFixed(2)}%
            </span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="cg-full">
      <div className="cg-glass cg-card">
        <header className="cg-head">
          <EthMark size={28} />
          <div className="cg-head-id">
            <span className="cg-name lg">Ethereum</span>
            <span className="cg-ticker">ETH / USD</span>
          </div>
          <span className="cg-live">
            <i /> Live
          </span>
        </header>

        <div className="cg-quote">
          <span className="cg-price lg">${fmt(price)}</span>
          <span className={`cg-delta lg ${up ? 'up' : 'down'}`}>
            {up ? '▲' : '▼'} {Math.abs(delta).toFixed(2)}%
          </span>
        </div>

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

        <div className="cg-ranges">
          {RANGES.map((r) => (
            <button
              key={r}
              type="button"
              className={`cg-range ${r === range ? 'active' : ''}`}
              onClick={() => setRange(r)}
            >
              {r === range && (
                <motion.span layoutId="cg-range-pill" className="cg-range-pill" transition={{ type: 'spring', stiffness: 480, damping: 40 }} />
              )}
              <span>{r}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
