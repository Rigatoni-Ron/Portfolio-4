import chartSvg from '../assets/tri-chart.svg'
import btcIcon from '../assets/tri-icon-btc.svg'
import hypeIcon from '../assets/tri-icon-hype.svg'
import usdtIcon from '../assets/tri-icon-usdt.svg'
import solIcon from '../assets/tri-icon-sol.svg'

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
                <span>-$4,405,300.06</span>
                <span>(-10.00%)</span>
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
          <img className="agreement-chart" src={chartSvg} alt="" draggable="false" />
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
