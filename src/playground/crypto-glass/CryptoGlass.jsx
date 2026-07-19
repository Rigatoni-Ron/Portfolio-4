import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import NumberFlow from '@number-flow/react'

/*
 * Crypto Glass ("Trading Widget") — dark-native crypto widget.
 *   variant="tile"  → collapsed pill only, non-interactive (Playground tile)
 *   variant="full"  → collapsed pill → chart view → Buy flow per the Figma
 *                     wireframes: input (big ETH amount) → review → success.
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

const AVAILABLE_USD = 34234238.83 // mock balance (per wireframe)
const GAS_ETH = 0.0002638
const FROM_OPTIONS = ['CB wallet 26', 'Vault 3', 'Treasury A']
const TO_OPTIONS = ['Tri-party BNY', 'Cold storage', 'Fireblocks 2']
const NETWORK_OPTIONS = ['Ethereum', 'Base', 'Arbitrum']

const seedFor = (s) => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) | 0, 7)
const fmtUsd = (n) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 })
const fmtEth = (n) =>
  n.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 4 }) + ' ETH'

// Raw digit string → display string with thousands separators.
const fmtAmount = (raw) => {
  if (!raw) return ''
  const [int = '', dec] = raw.split('.')
  const intFmt = int ? Number(int).toLocaleString('en-US') : '0'
  return dec !== undefined ? `${intFmt}.${dec}` : intFmt
}

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

const Chevron = () => (
  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M4 6.5 8 10.5 12 6.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
const Check = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M5 12.5 10 17.5 19 7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const stop = (e) => e.stopPropagation()

// View transition: rise in from below, drift upward on exit. Pure
// transform/opacity, no horizontal motion.
const viewVariants = {
  enter: { opacity: 0, y: 12 },
  center: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
}

// Cycling mock dropdown chip (From / To / Network rows).
function CycleChip({ options, value, onChange }) {
  return (
    <button
      type="button"
      className="cg-chip"
      onClick={() => onChange(options[(options.indexOf(value) + 1) % options.length])}
    >
      {value} <Chevron />
    </button>
  )
}

export default function CryptoGlass({ variant = 'full' }) {
  const isTile = variant === 'tile'
  const [open, setOpen] = useState(false)
  const [view, setView] = useState('chart')
  const [range, setRange] = useState('1D')
  const [price, setPrice] = useState(1632.5)
  const dayOpen = useRef(1596.0)
  const [series, setSeries] = useState(() => genSeries(1632.5, RANGE_CFG['1D'], 11))

  // Buy-flow state. `amount` is the raw ETH digit string the user typed.
  const [amount, setAmount] = useState('')
  const [from, setFrom] = useState(FROM_OPTIONS[0])
  const [to, setTo] = useState(TO_OPTIONS[0])
  const [network, setNetwork] = useState(NETWORK_OPTIONS[0])
  const [bought, setBought] = useState({ eth: 0, usd: 0, from: FROM_OPTIONS[0] })

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

  const display = fmtAmount(amount)
  const eth = parseFloat(amount) || 0
  const usd = eth * price
  const isTradeView = view === 'input' || view === 'review'

  // ── Big amount: caret-hugging input width + fit-to-space scaling ──
  // A hidden mirror span measures the formatted text so the input hugs its
  // content (keeping the caret right before "ETH"). If the row outgrows the
  // card, scale it down via transform (offsetWidth ignores transforms, so the
  // measurement stays stable).
  const amtRowRef = useRef(null)
  const mirrorRef = useRef(null)
  const inputRef = useRef(null)
  useLayoutEffect(() => {
    const row = amtRowRef.current
    const mirror = mirrorRef.current
    const input = inputRef.current
    // Available width comes from the steps container (a plain block that can't
    // be blown out by the row's min-content, unlike the amt box's grid track).
    const avail = stepsInnerRef.current
    if (!row || !mirror || !input || !avail) return
    input.style.width = Math.max(mirror.offsetWidth, 28) + 'px'
    const fit = Math.min(1, (avail.clientWidth - 8) / row.offsetWidth)
    row.style.setProperty('--cg-fit', fit)
  }, [display, view])

  // Animate the card height between steps.
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

  const go = (v) => setView(v)
  const cancel = () => {
    setAmount('')
    go('chart')
  }
  const collapse = () => {
    setOpen(false)
    setView('chart')
    setAmount('')
  }
  const cardClick = () => (open ? collapse() : setOpen(true))

  const onType = (e) => {
    let raw = e.target.value.replace(/[^\d.]/g, '')
    const firstDot = raw.indexOf('.')
    if (firstDot !== -1) {
      raw = raw.slice(0, firstDot + 1) + raw.slice(firstDot + 1).replace(/\./g, '')
      raw = raw.slice(0, firstDot + 5) // max 4 decimals
    }
    raw = raw.replace(/^0+(?=\d)/, '') // no leading zeros
    setAmount(raw.slice(0, 14))
  }
  const setMax = () => {
    const maxEth = Math.floor((AVAILABLE_USD / price) * 10000) / 10000
    setAmount(String(maxEth))
  }
  const confirm = () => {
    setBought({ eth, usd, from })
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
      <div className="cg-avail">
        <span className="cg-avail-label">Available</span>
        <span className="cg-avail-value">{fmtUsd(AVAILABLE_USD)}</span>
        <button type="button" className="cg-max" onClick={setMax}>
          Max
        </button>
      </div>
      <div className="cg-btnrow">
        <button type="button" className="cg-btn-ghost" onClick={cancel}>
          Cancel
        </button>
        <button type="button" className="cg-cta" onClick={() => go('review')} disabled={!(eth > 0)}>
          Review
        </button>
      </div>
    </>
  )

  const reviewView = (
    <>
      <div className="cg-usd-line">{fmtUsd(usd)}</div>
      <div className="cg-rev">
        <div className="cg-rev-row">
          <span>From</span>
          <CycleChip options={FROM_OPTIONS} value={from} onChange={setFrom} />
        </div>
        <div className="cg-rev-row">
          <span>To</span>
          <CycleChip options={TO_OPTIONS} value={to} onChange={setTo} />
        </div>
        <div className="cg-rev-row">
          <span>Network</span>
          <CycleChip options={NETWORK_OPTIONS} value={network} onChange={setNetwork} />
        </div>
        <div className="cg-rev-row">
          <span>Gas Fee</span>
          <span className="cg-rev-value">{GAS_ETH} ETH</span>
        </div>
        <div className="cg-rev-row">
          <span>Date and time</span>
          <span className="cg-rev-value">
            {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} ·{' '}
            {new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
          </span>
        </div>
      </div>
      <div className="cg-btnrow">
        <button type="button" className="cg-btn-ghost" onClick={cancel}>
          Cancel
        </button>
        <button type="button" className="cg-cta" onClick={confirm}>
          Submit order
        </button>
      </div>
    </>
  )

  const successView = (
    <div className="cg-success">
      <div className="cg-check"><Check /></div>
      <div className="cg-success-title">Bought {fmtEth(bought.eth)}</div>
      <div className="cg-success-sub">{fmtUsd(bought.usd)} · {bought.from}</div>
      <button type="button" className="cg-cta cg-done" onClick={() => { setAmount(''); go('chart') }}>
        Done
      </button>
    </div>
  )

  const views = { chart: chartView, input: inputView, review: reviewView, success: successView }

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
                  {/* One popLayout presence for the persistent amount block +
                      the swapped view: exiting children pop OUT of the layout
                      immediately, so the measured steps height moves straight
                      to its final target (no grow-then-shrink bounce). The amt
                      block keeps its key across input/review, so it never
                      remounts there — its shrink+rise "solidify" runs as pure
                      CSS transitions. */}
                  <AnimatePresence mode="popLayout" initial={false}>
                    {isTradeView && (
                      <motion.div
                        key="amt"
                        className={`cg-amt-wrap ${view === 'review' ? 'is-small' : ''}`}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8, transition: { duration: 0.14, ease: 'easeIn' } }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                        onClick={view === 'review' ? () => go('input') : undefined}
                        title={view === 'review' ? 'Edit amount' : undefined}
                      >
                        <div className="cg-amt">
                          <div className="cg-amt-row" ref={amtRowRef}>
                            <span className="cg-amt-mirror" ref={mirrorRef} aria-hidden="true">
                              {display || '0'}
                            </span>
                            <input
                              ref={inputRef}
                              className="cg-amt-input"
                              inputMode="decimal"
                              placeholder="0"
                              value={display}
                              onChange={onType}
                              readOnly={view === 'review'}
                              tabIndex={view === 'review' ? -1 : 0}
                              aria-label="Amount in ETH"
                              autoFocus={view === 'input'}
                            />
                            <span className="cg-amt-unit">ETH</span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                    <motion.div
                      key={view}
                      className="cg-view"
                      variants={viewVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{ duration: 0.2, ease: 'easeOut' }}
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
