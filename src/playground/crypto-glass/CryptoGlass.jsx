import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import NumberFlow from '@number-flow/react'

/*
 * Crypto Glass — dark-native rebuild of the "liquid glass" crypto widget.
 *   variant="tile"  → collapsed pill only, non-interactive (Playground tile)
 *   variant="full"  → collapsed pill → expands to a chart view → a 3-step Buy
 *                     flow (input → review → success).
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

const WALLET = { name: 'Main Wallet', balance: 4210.0 }
const FEE_RATE = 0.005 // 0.5% mock fee
const VIEW_ORDER = ['chart', 'input', 'review', 'success']

const seedFor = (s) => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) | 0, 7)
const round = (n, d) => Math.round(n * 10 ** d) / 10 ** d
const fmtUsd = (n) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 })
const fmtEth = (n) =>
  n.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 4 }) + ' ETH'

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

const ChevronLeft = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M10 3.5 5.5 8l4.5 4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
const Check = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M5 12.5 10 17.5 19 7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const stop = (e) => e.stopPropagation()

// View transition: fade + small directional slide (transform/opacity only).
const viewVariants = {
  enter: (dir) => ({ opacity: 0, x: dir >= 0 ? 14 : -14 }),
  center: { opacity: 1, x: 0 },
  exit: (dir) => ({ opacity: 0, x: dir >= 0 ? -14 : 14 }),
}

export default function CryptoGlass({ variant = 'full' }) {
  const isTile = variant === 'tile'
  const [open, setOpen] = useState(false)
  const [view, setView] = useState('chart')
  const [dir, setDir] = useState(0)
  const [range, setRange] = useState('1D')
  const [price, setPrice] = useState(1632.5)
  const dayOpen = useRef(1596.0)
  const [series, setSeries] = useState(() => genSeries(1632.5, RANGE_CFG['1D'], 11))

  // Buy-flow state.
  const [amount, setAmount] = useState('250')
  const [unit, setUnit] = useState('USD')
  const [bought, setBought] = useState({ eth: 0, usd: 0 })

  useEffect(() => {
    if (isTile) return
    setSeries(genSeries(price, RANGE_CFG[range], seedFor(range)))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range])

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

  // Derived buy amounts.
  const num = parseFloat(amount) || 0
  const usd = unit === 'USD' ? num : num * price
  const eth = unit === 'USD' ? num / price : num
  const fee = usd * FEE_RATE
  const total = usd + fee

  // Animate the card height between steps: measure the active view and drive a
  // px height (CSS-transitioned) on the steps container.
  const stepsInnerRef = useRef(null)
  const [stepH, setStepH] = useState()
  useLayoutEffect(() => {
    const el = stepsInnerRef.current
    if (!el) return
    const update = () => setStepH(el.offsetHeight)
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const go = (v) => {
    setDir(Math.sign(VIEW_ORDER.indexOf(v) - VIEW_ORDER.indexOf(view)))
    setView(v)
  }
  const resetTrade = () => {
    setAmount('250')
    setUnit('USD')
  }
  const collapse = () => {
    setOpen(false)
    setView('chart')
    setDir(0)
    resetTrade()
  }
  const cardClick = () => (open ? collapse() : setOpen(true))

  const toggleUnit = () => {
    const next = unit === 'USD' ? 'ETH' : 'USD'
    const converted = unit === 'USD' ? num / price : num * price
    setUnit(next)
    setAmount(converted ? String(round(converted, next === 'ETH' ? 4 : 2)) : '')
  }
  const preset = (pct) => {
    const targetUsd = WALLET.balance * pct
    const val = unit === 'USD' ? targetUsd : targetUsd / price
    setAmount(String(round(val, unit === 'ETH' ? 4 : 2)))
  }
  const confirm = () => {
    setBought({ eth, usd })
    go('success')
  }

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
          <NumberFlow value={Math.abs(delta)} format={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }} suffix="%" willChange />
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

  const chartView = (
    <>
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
      <div className="cg-ranges" style={{ '--cg-idx': RANGES.indexOf(range) }} onClick={stop}>
        <span className="cg-range-pill" />
        {RANGES.map((r) => (
          <button key={r} type="button" className={`cg-range ${r === range ? 'active' : ''}`} onClick={(e) => { stop(e); setRange(r) }}>
            <span>{r}</span>
          </button>
        ))}
      </div>
      <button type="button" className="cg-cta" onClick={(e) => { stop(e); go('input') }}>
        Trade
      </button>
    </>
  )

  const inputView = (
    <>
      <button type="button" className="cg-back" onClick={() => go('chart')}>
        <ChevronLeft /> Buy ETH
      </button>
      <div className="cg-field">
        <span className="cg-field-label">You pay</span>
        <div className="cg-amount">
          {unit === 'USD' && <span className="cg-amount-pre">$</span>}
          <input
            className="cg-amount-input"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ''))}
            aria-label="Amount"
          />
          <button type="button" className="cg-unit" onClick={toggleUnit}>
            {unit} <span className="cg-unit-swap">⇄</span>
          </button>
        </div>
        <div className="cg-convert">≈ {unit === 'USD' ? fmtEth(eth) : fmtUsd(usd)}</div>
      </div>
      <div className="cg-presets">
        {[['25%', 0.25], ['50%', 0.5], ['Max', 1]].map(([label, pct]) => (
          <button key={label} type="button" className="cg-preset" onClick={() => preset(pct)}>
            {label}
          </button>
        ))}
      </div>
      <div className="cg-field">
        <span className="cg-field-label">Pay with</span>
        <div className="cg-source">
          <span className="cg-source-mark">◈</span>
          <span className="cg-source-name">{WALLET.name}</span>
          <span className="cg-source-bal">{fmtUsd(WALLET.balance)}</span>
        </div>
      </div>
      <button type="button" className="cg-cta" onClick={() => go('review')} disabled={!(usd > 0)}>
        Review
      </button>
    </>
  )

  const reviewView = (
    <>
      <button type="button" className="cg-back" onClick={() => go('input')}>
        <ChevronLeft /> Review
      </button>
      <div className="cg-summary">
        <div className="cg-sum-row"><span>You buy</span><span>{fmtEth(eth)}</span></div>
        <div className="cg-sum-row"><span>Pay with</span><span>{WALLET.name}</span></div>
        <div className="cg-sum-row"><span>Rate</span><span>1 ETH = {fmtUsd(price)}</span></div>
        <div className="cg-sum-row"><span>Fee</span><span>{fmtUsd(fee)}</span></div>
        <div className="cg-sum-divider" />
        <div className="cg-sum-row cg-sum-total"><span>Total</span><span>{fmtUsd(total)}</span></div>
      </div>
      <button type="button" className="cg-cta" onClick={confirm}>
        Confirm buy
      </button>
    </>
  )

  const successView = (
    <div className="cg-success">
      <div className="cg-check"><Check /></div>
      <div className="cg-success-title">Bought {fmtEth(bought.eth)}</div>
      <div className="cg-success-sub">{fmtUsd(bought.usd)} · {WALLET.name}</div>
      <button type="button" className="cg-cta cg-done" onClick={() => { resetTrade(); go('chart') }}>
        Done
      </button>
    </div>
  )

  const views = { chart: chartView, input: inputView, review: reviewView, success: successView }

  // Whole-card click toggles collapse ONLY in the chart view; deeper views
  // navigate with their own back buttons.
  const toggleProps =
    view === 'chart'
      ? {
          role: 'button',
          tabIndex: 0,
          'aria-expanded': open,
          onClick: cardClick,
          onKeyDown: (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              cardClick()
            }
          },
        }
      : {}

  return (
    <div className="cg-full">
      <div className={`cg-glass cg-card ${open ? 'is-open' : ''} ${view !== 'chart' ? 'is-trading' : ''}`} {...toggleProps}>
        {row}
        <div className="cg-reveal">
          <div className="cg-reveal-inner">
            <div className="cg-reveal-body">
              <div className="cg-steps" style={{ height: stepH }}>
                <div ref={stepsInnerRef} className="cg-steps-inner">
                  <AnimatePresence mode="wait" custom={dir} initial={false}>
                    <motion.div
                      key={view}
                      className="cg-view"
                      custom={dir}
                      variants={viewVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{ duration: 0.22, ease: 'easeOut' }}
                    >
                      {views[view]}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
