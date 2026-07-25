import { useMemo } from 'react'
import btcIcon from '../assets/tri-icon-btc.svg'
import hypeIcon from '../assets/tri-icon-hype.svg'
import usdtIcon from '../assets/tri-icon-usdt.svg'
import solIcon from '../assets/tri-icon-sol.svg'

/* Real, drawn chart — same approach as the Trading Widget: a seeded series
   turned into an SVG path, rather than a flat SVG export. Jagged (straight
   segments, densely sampled) riding a trend that starts mid, dips early, then
   climbs to the right (matches the "+10.00% past 24h" the panel shows). Fixed
   seed = deterministic, so it's a still product shot with no animation. */
const CHART = { w: 424, h: 200, n: 200, seed: 20261103, pad: 4 }

// Shape the chart rides: [progress 0..1, height 0(low)..1(high)]. Smoothstep
// between anchors → start in the middle, dip, then up-and-to-the-right.
const TREND = [
  [0, 0.55],
  [0.3, 0.26],
  [1, 0.95],
]

function mulberry32(a) {
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function trendAt(u) {
  for (let k = 0; k < TREND.length - 1; k++) {
    const [u0, v0] = TREND[k]
    const [u1, v1] = TREND[k + 1]
    if (u <= u1) {
      const t = (u - u0) / (u1 - u0)
      return v0 + (v1 - v0) * (t * t * (3 - 2 * t)) // smoothstep
    }
  }
  return TREND[TREND.length - 1][1]
}

function jaggedPaths({ w, h, n, seed, pad }) {
  const rnd = mulberry32(seed)
  const series = new Array(n)
  let noise = 0
  for (let i = 0; i < n; i++) {
    // Mean-reverting noise keeps the spikes bounded so the trend still reads.
    noise = noise * 0.6 + (rnd() - 0.5) * 0.16
    series[i] = trendAt(i / (n - 1)) + noise
  }
  const min = Math.min(...series)
  const max = Math.max(...series)
  const span = max - min || 1
  // x spans the full width (only y is padded) so the left/right edges of the
  // area are dead vertical — no inward lean.
  const dx = w / (n - 1)
  const pt = (i) => [i * dx, pad + (h - pad * 2) * (1 - (series[i] - min) / span)]
  let line = ''
  for (let i = 0; i < n; i++) {
    const [x, y] = pt(i)
    line += `${i === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`
  }
  const area = `${line} L ${w} ${h} L 0 ${h} Z`
  return { line, area }
}

/*
 * Agreement Assets — rebuilt from Figma (node 413:19592), the tri-party
 * agreement detail panel. Faithful to the design's content + tokens; the
 * container is a frosted-glass panel (same product-shot treatment as the
 * Collateral Loan Card). Renders at a fixed design width and is scaled to fit
 * by the hero-shot overlay (it's a full panel, not a one-line card).
 */

const INFO = [
  { avatar: 'SP', label: 'Pledgor', value: 'Spark' },
  { avatar: 'GS', label: 'Secured party (you)', value: 'Goldman Sachs' },
  { label: 'ID', value: '723-XWB-QX' },
  { label: 'Start date', value: 'Nov 3, 2026' },
]

const ASSETS = [
  { icon: btcIcon, amount: '7.87', sym: 'BTC', usd: '$526,283.38', change: '2.34', dir: 'up' },
  { icon: hypeIcon, amount: '20,681.87', sym: 'HYPE', usd: '$1,283,849.38', change: '13.28', dir: 'up' },
  { icon: usdtIcon, amount: '2,374,957.03', sym: 'USDT', usd: '$2,374,957.03', change: '1.23', dir: 'down' },
  { icon: solIcon, amount: '129,484.63', sym: 'SOL', usd: '$10,106,690.10', pending: '22.8294 pending release' },
]

const Arrow = ({ down }) => (
  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path
      d={down ? 'M5 5 L11 11 M11 6 v5 h-5' : 'M5 11 L11 5 M6 5 h5 v5'}
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const Clock = () => (
  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.3" />
    <path d="M8 5v3l2 1.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

export default function AgreementAssets() {
  const { line, area } = useMemo(() => jaggedPaths(CHART), [])
  return (
    <div className="agreement">
      <div className="agreement-info">
        {INFO.map((c) => (
          <div className="agr-cell" key={c.label}>
            {c.avatar && <span className="agr-avatar">{c.avatar}</span>}
            <div className="agr-cell-text">
              <span className="agr-cell-label">{c.label}</span>
              <span className="agr-cell-value">{c.value}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="agreement-body">
        <div className="agreement-graph">
          <div className="agreement-graph-head">
            <div className="agreement-value-block">
              <div className="agreement-value">
                <span className="agr-cur">$</span>
                <span className="agr-int">48,947,778</span>
                <span className="agr-dec">.54</span>
              </div>
              <div className="agreement-sub">
                <span>+$4,449,798.05</span>
                <span>(+10.00%)</span>
                <span>past 24h</span>
              </div>
            </div>
            <div className="agreement-toggle">
              24hr
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
          <svg
            className="agreement-chart"
            viewBox={`0 0 ${CHART.w} ${CHART.h}`}
            preserveAspectRatio="none"
            fill="none"
            aria-hidden="true"
          >
            <defs>
              {/* Dotted texture over the area fill (matches the Figma spec). */}
              <pattern id="agr-dots" patternUnits="userSpaceOnUse" width="7" height="7">
                <circle cx="1" cy="1" r="1" fill="#AC96FF" />
              </pattern>
            </defs>
            <path d={area} fill="#AC96FF" fillOpacity="0.3" />
            <path d={area} fill="url(#agr-dots)" />
            <path d={line} stroke="#AC96FF" strokeWidth="1" strokeLinejoin="round" />
          </svg>
        </div>

        <div className="agreement-list">
          <div className="agr-rows">
            {ASSETS.map((a) => (
              <div className="agr-row" key={a.sym}>
                <img className="agr-icon" src={a.icon} alt="" draggable="false" />
                <div className="agr-row-body">
                  <div className="agr-row-amt">
                    {a.amount} <span className="agr-row-sym">{a.sym}</span>
                  </div>
                  <div className="agr-row-sub">
                    <span className="agr-row-usd">{a.usd}</span>
                    {a.pending ? (
                      <span className="agr-pending">
                        <Clock /> {a.pending}
                      </span>
                    ) : (
                      <span className={`agr-change ${a.dir === 'down' ? 'is-down' : 'is-up'}`}>
                        <Arrow down={a.dir === 'down'} /> {a.change} %
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="agr-more">+7 more assets</div>
        </div>
      </div>
    </div>
  )
}
