import { useMemo } from 'react'
import { useFitScale } from '../useFitScale.js'
import usdIcon from '../assets/cm-icon-usd.svg'
import usdcIcon from '../assets/cm-icon-usdc.svg'
import usdtIcon from '../assets/cm-icon-usdt.svg'
import btcIcon from '../assets/cm-icon-btc.svg'
import aaveIcon from '../assets/cm-icon-aave.svg'
import chevronIcon from '../assets/cm-icon-chevron.svg'

/*
 * Loan Details — rebuilt from Figma (node 556:20101), the collateral-management
 * loan detail view: LTV health meter, LTV over time, and the two asset columns.
 * Second panel in the Collateral hero deck (the Loan Card is the first).
 * Same product-shot treatment as the other rebuilt panels: fixed design width,
 * scaled to fit by useFitScale, static (no timers, no network).
 */

const CHART = { w: 938, h: 156, pad: 6 }

/* Real market shape: 96 BTC/USD 15-minute closes (one day, Binance), inverted —
   LTV rises as collateral falls — then anchored to the design's endpoints
   (13.378 opening, 12.8 now, the -4.32% the header states). Deterministic. */
// prettier-ignore
const LTV_SERIES = [
  13.378, 13.372, 13.388, 13.368, 13.399, 13.411, 13.421, 13.4, 13.41, 13.412, 13.432, 13.4,
  13.426, 13.437, 13.429, 13.453, 13.49, 13.46, 13.47, 13.438, 13.44, 13.437, 13.4, 13.383,
  13.373, 13.388, 13.366, 13.366, 13.354, 13.384, 13.406, 13.394, 13.39, 13.419, 13.436, 13.415,
  13.392, 13.356, 13.364, 13.348, 13.343, 13.321, 13.332, 13.343, 13.312, 13.303, 13.51, 13.381,
  13.424, 13.281, 13.165, 13.227, 13.24, 13.219, 13.196, 13.188, 13.207, 13.241, 13.296, 13.289,
  13.289, 13.319, 13.318, 13.324, 13.308, 13.295, 13.271, 13.283, 13.311, 13.317, 13.312, 13.314,
  13.306, 13.323, 13.304, 13.307, 13.29, 13.269, 13.266, 13.267, 13.239, 13.203, 13.088, 12.962,
  12.964, 12.989, 12.93, 12.951, 12.929, 12.936, 12.907, 12.87, 12.782, 12.818, 12.782, 12.8,
]

function toPaths(series, { w, h, pad }) {
  const min = Math.min(...series)
  const max = Math.max(...series)
  const span = max - min || 1
  const dx = w / (series.length - 1)
  let line = ''
  for (let i = 0; i < series.length; i++) {
    const x = i * dx
    const y = pad + (h - pad * 2) * (1 - (series[i] - min) / span)
    line += `${i === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`
  }
  return { line, area: `${line} L ${w} ${h} L 0 ${h} Z` }
}

/* The meter reads left to right as risk rises; only the band the loan sits in
   fills. At 12.8% LTV that's the first one, half full. */
const BANDS = [
  { state: 'Collateral return', range: 'Under 20%', fill: 0.5 },
  { state: 'Healthy', range: '21% - 60%', fill: 0 },
  { state: 'Margin call', range: '61% - 80%', fill: 0 },
  { state: 'Critical', range: 'Over 80%', fill: 0 },
]

/* Stablecoins price at their peg (USDC 1.0000003, USDT 1.0002), and the two
   loaned rows have to total 12.8% of the collateral to match the LTV above. */
const LOANED = [
  { icon: usdcIcon, amount: '474,406.00', sym: 'USDC', usd: '$474,406.14' },
  { icon: usdtIcon, amount: '588,488.16', sym: 'USDT', usd: '$588,605.86' },
]
const COLLATERAL = [
  { icon: btcIcon, amount: '115.27', sym: 'BTC', usd: '$7,692,407.49' },
  { icon: aaveIcon, amount: '6,473.23', sym: 'AAVE', usd: '$612,373.76' },
]

const AssetRow = ({ icon, amount, sym, usd }) => (
  <div className="cmd-row">
    <span className="cmd-icon">
      <img src={icon} alt="" draggable="false" />
    </span>
    <div className="cmd-row-body">
      <div className="cmd-row-amt">
        {amount} <span className="cmd-row-sym">{sym}</span>
      </div>
      <div className="cmd-row-usd">{usd}</div>
    </div>
  </div>
)

const TotalRow = ({ label, usd }) => (
  <div className="cmd-row">
    <span className="cmd-icon">
      <img src={usdIcon} alt="" draggable="false" />
    </span>
    <div className="cmd-row-body">
      <div className="cmd-row-total">{label}</div>
      <div className="cmd-row-usd">{usd}</div>
    </div>
  </div>
)

export default function LoanDetails({ variant = 'modal' }) {
  const { line, area } = useMemo(() => toPaths(LTV_SERIES, CHART), [])
  const fitRef = useFitScale(974, variant === 'card' ? 0.4 : 0.72)

  return (
    <div className="cmd" ref={fitRef}>
      <div className="cmd-meter">
        <div className="cmd-meter-row cmd-meter-states">
          {BANDS.map((b) => (
            <span key={b.state}>{b.state}</span>
          ))}
        </div>
        <div className="cmd-meter-bars">
          {BANDS.map((b) => (
            <div className="cmd-bar" key={b.state}>
              <span className="cmd-bar-fill" style={{ width: `${b.fill * 100}%` }} />
            </div>
          ))}
        </div>
        <div className="cmd-meter-row cmd-meter-ranges">
          {BANDS.map((b) => (
            <span key={b.state}>{b.range}</span>
          ))}
        </div>
      </div>

      <div className="cmd-graph">
        <div className="cmd-graph-head">
          <div className="cmd-value-block">
            <div className="cmd-value">
              <span className="cmd-value-num">12.8</span>
              <span className="cmd-value-unit">% LTV</span>
            </div>
            <div className="cmd-value-sub">
              <span>-4.32%</span>
              <span>past 24h</span>
            </div>
          </div>
          <div className="cmd-toggle">
            24hr
            <img className="cmd-chevron" src={chevronIcon} alt="" draggable="false" />
          </div>
        </div>
        <div className="cmd-chart-wrap">
          <svg
            className="cmd-chart"
            viewBox={`0 0 ${CHART.w} ${CHART.h}`}
            preserveAspectRatio="none"
            fill="none"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="cmd-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#5580f6" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#5580f6" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d={area} fill="url(#cmd-fill)" />
            <path d={line} stroke="#8aa9fb" strokeWidth="1.5" strokeLinejoin="round" />
          </svg>
        </div>
      </div>

      <div className="cmd-cols">
        <div className="cmd-col">
          {LOANED.map((a) => (
            <AssetRow key={a.sym} {...a} />
          ))}
          <TotalRow label="Total loaned assets" usd="$1,063,012.00" />
        </div>
        <div className="cmd-col">
          {COLLATERAL.map((a) => (
            <AssetRow key={a.sym} {...a} />
          ))}
          <TotalRow label="Total collateral received" usd="$8,304,781.25" />
        </div>
      </div>
    </div>
  )
}
