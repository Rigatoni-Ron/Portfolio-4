import { useMemo } from 'react'
import btcIcon from '../assets/tri-icon-btc.svg'
import hypeIcon from '../assets/tri-icon-hype.svg'
import usdtIcon from '../assets/tri-icon-usdt.svg'
import solIcon from '../assets/tri-icon-sol.svg'

/* Real, drawn chart — same approach as the Trading Widget, but fed a genuine
   price window instead of synthetic noise: 167 daily ETH/USD closes from
   Oct 2023 to Mar 2024 (Binance), a real up-and-to-the-right trend with a
   natural early dip. Static/deterministic, so it's a still product shot.
   Keeps the Figma styling (purple line, translucent fill, dotted texture).
   The x-axis spans the full width (only y is padded) so the edges are vertical. */
const CHART = { w: 424, h: 200, pad: 4 }

// prettier-ignore
const ETH_SERIES = [
  1734, 1662, 1657, 1647, 1612, 1645, 1634, 1633, 1580, 1568, 1567, 1540, 1552, 1555, 1558, 1599,
  1565, 1563, 1567, 1604, 1629, 1664, 1765, 1785, 1787, 1803, 1779, 1776, 1795, 1809, 1815, 1847,
  1801, 1833, 1856, 1892, 1901, 1885, 1888, 2121, 2078, 2053, 2045, 2054, 1979, 2058, 1962, 1961,
  1963, 2011, 2021, 1933, 2063, 2062, 2081, 2083, 2062, 2028, 2048, 2029, 2052, 2087, 2165, 2193,
  2243, 2293, 2233, 2356, 2359, 2340, 2352, 2225, 2203, 2260, 2315, 2221, 2229, 2197, 2219, 2178,
  2202, 2240, 2325, 2308, 2264, 2271, 2231, 2378, 2344, 2299, 2292, 2282, 2352, 2355, 2210, 2267,
  2269, 2241, 2221, 2330, 2344, 2584, 2618, 2523, 2578, 2473, 2512, 2587, 2530, 2471, 2492, 2472,
  2457, 2314, 2243, 2235, 2219, 2268, 2268, 2257, 2318, 2343, 2283, 2304, 2309, 2296, 2290, 2302,
  2373, 2425, 2420, 2487, 2500, 2507, 2660, 2640, 2775, 2823, 2802, 2786, 2881, 2945, 3015, 2968,
  2971, 2922, 2993, 3113, 3176, 3242, 3383, 3340, 3433, 3421, 3488, 3628, 3554, 3819, 3869, 3883,
  3905, 3878, 4065, 3980, 4005, 3882, 3742,
]

function toPaths(series, { w, h, pad }) {
  const min = Math.min(...series)
  const max = Math.max(...series)
  const span = max - min || 1
  const dx = w / (series.length - 1)
  const pt = (i) => [i * dx, pad + (h - pad * 2) * (1 - (series[i] - min) / span)]
  let line = ''
  for (let i = 0; i < series.length; i++) {
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
  { icon: solIcon, amount: '129,484.63', sym: 'SOL', usd: '$10,106,690.10', pending: '22.82 pending release' },
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
  const { line, area } = useMemo(() => toPaths(ETH_SERIES, CHART), [])
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
                <span>+$3,474,182.72</span>
                <span>(+7.64%)</span>
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
          <div className="agr-more">+3 more assets</div>
        </div>
      </div>
    </div>
  )
}
