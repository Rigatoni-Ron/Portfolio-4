import { AnimatePresence, motion } from 'motion/react'
import { useFitScale } from '../useFitScale.js'
import usdtIcon from '../assets/tri-icon-usdt.svg'
import hypeIcon from '../assets/tri-icon-hype.svg'
import cellularIcon from '../assets/ios-cellular.svg'
import wifiIcon from '../assets/ios-wifi.svg'
import batteryIcon from '../assets/ios-battery.svg'

/*
 * Swap — two screens from the crypto swapping app, rebuilt from the recorded
 * flow inside a single iPhone outline: the trade screen and the Review Order
 * step it leads to. The modal's deck drives which one is showing (`screen`) and
 * draws the dots; everything else happens in here.
 *
 * One phone, not two. The shell, status bar and tab bar stay mounted across
 * screens and only the page between them slides, clipped by the screen. The
 * device also scales down on the taller screen, which is what lets the review
 * detail fit without shrinking the type on both.
 *
 * The split is the point. The trade screen carries two legs and one action; all
 * the routing, slippage and fee detail lives on review, where it is the only
 * thing being decided.
 *
 * Type scale is deliberately short — four sizes (12 / 15 / 17 / 34) on the
 * default weight plus 600 for the CTA and the status clock.
 *
 * Assets are USDT → HYPE using the monochrome marks the escrow panel already
 * ships, priced at HYPE ≈ $52.15 (2 Aug 2026). Fixed on purpose: it's a product
 * shot, so the numbers just have to be internally consistent, not current.
 *
 * Unlike the Anchorage panels this one does NOT follow the site's dark/light
 * theme — the source app is a light iOS app, so the screen stays light in both
 * and only the device shell is dark. That contrast is the point: a lit phone
 * sitting on the dark backdrop.
 *
 * Laid out at 402 × 874 (iPhone 16 Pro logical size) so the iOS metrics are
 * literal. The status bar follows Apple's own component (Figma file
 * CkIxQD8EkZ9EPnZ5OhMS6b, node 12406:2408) and its three indicator glyphs are
 * Aaron's exports from it, not hand-drawn approximations. Proportions inside
 * the cards are measured off the recording; the hero-shot overlay scales the
 * whole thing via useFitScale.
 *
 * Static by design — this is a product shot, not a working swap.
 */

/* ── in-screen glyphs ───────────────────────────────────────── */

/* arrow.down.square — the flip control that sits on the divider between legs. */
function FlipIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <rect
        x="1.75"
        y="1.75"
        width="14.5"
        height="14.5"
        rx="3.5"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <path
        d="M9 5v8m0 0 3-3m-3 3-3-3"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/* Direction of the trade, between the two quote boxes on the review screen. */
function ArrowIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M4 10h11m0 0-4-4m4 4-4 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/* ── tab bar glyphs ─────────────────────────────────────────── */

function WalletTabIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <rect x="2.6" y="6.6" width="22.8" height="15.8" rx="3.2" stroke="currentColor" strokeWidth="1.7" />
      <path d="M2.6 11.4h22.8" stroke="currentColor" strokeWidth="1.7" />
      <rect x="6" y="15" width="5.4" height="3.6" rx="1.1" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}

/* The active tab is a filled blue tile rather than an outline — the app's own
   treatment, and the one thing that carries colour in the bar. */
function SwapTabIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <rect x="3.4" y="3.4" width="21.2" height="21.2" rx="5.4" fill="currentColor" />
      <path
        d="M10.4 18.6V9.4m0 0-2.6 2.7m2.6-2.7 2.6 2.7"
        stroke="#fff"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M17.6 9.4v9.2m0 0 2.6-2.7m-2.6 2.7-2.6-2.7"
        stroke="#fff"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function HistoryTabIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <path
        d="M18.6 5.2h3a2 2 0 0 1 2 2v13.4a2 2 0 0 1-1.5 1.9l-1.5.4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <rect x="4.6" y="5.2" width="14.4" height="18" rx="2.2" stroke="currentColor" strokeWidth="1.7" />
      <path
        d="M8.2 10h7.2M8.2 13.4h7.2M8.2 16.8h4.4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

function Tab({ icon, label, active }) {
  return (
    <div className={`swp-tab${active ? ' is-active' : ''}`}>
      {icon}
      <span>{label}</span>
    </div>
  )
}

/* One side of the trade: amount + its USD value, token pill + wallet balance. */
function Leg({ amount, usd, icon, symbol, balance, muted }) {
  return (
    <div className="swp-leg">
      <div className={`swp-amount${muted ? ' is-muted' : ''}`}>{amount}</div>
      <div className="swp-token">
        <img className="swp-token-icon" src={icon} alt="" draggable="false" />
        <span>{symbol}</span>
      </div>
      <div className="swp-usd">{usd}</div>
      <div className="swp-balance">{balance}</div>
    </div>
  )
}

/* iOS push/pop: the incoming page comes in off the right edge while the
   outgoing one drifts left at a third of the distance. Percentages, so it
   travels relative to the phone rather than the viewport. */
const page = {
  enter: (d) => ({ x: d >= 0 ? '100%' : '-32%', opacity: d >= 0 ? 1 : 0.6 }),
  center: { x: '0%', opacity: 1 },
  exit: (d) => ({ x: d >= 0 ? '-32%' : '100%', opacity: d >= 0 ? 0.6 : 1 }),
}
const pageTransition = { duration: 0.42, ease: [0.22, 1, 0.36, 1] }

/* Screen 1 — the trade itself. */
function TradeBody() {
  return (
    <>
      <div className="swp-card">
        <Leg amount="2,500" usd="$2,500.00" icon={usdtIcon} symbol="USDT" balance="10,728.82" />

        {/* The rule spans the card; the flip button sits on it, opaque so it
            reads as a control rather than a badge floating over a line. */}
        <div className="swp-divider">
          <div className="swp-flip">
            <FlipIcon />
          </div>
        </div>

        {/* 2,500 USDT ÷ $52.15 = 47.93 HYPE, the rounding down standing in for
            the spread. Its USD line is that back at the same price. */}
        <Leg
          amount="47.93"
          usd="$2,499.55"
          icon={hypeIcon}
          symbol="HYPE"
          balance="128.44"
          muted
        />
      </div>

      <div className="swp-cta">Review Order</div>
    </>
  )
}

/* One side of the quote. Label and box are separate grid children rather than a
   wrapper, so the arrow can centre against the boxes instead of against the
   label-plus-box block. `side` places them in column 1 or 3. */
function QuoteSide({ side, label, icon, amount, usd }) {
  return (
    <>
      <div className={`swp-quote-label is-${side}`}>{label}</div>
      <div className={`swp-quote-box is-${side}`}>
        <img className="swp-quote-icon" src={icon} alt="" draggable="false" />
        <div className="swp-quote-amount">{amount}</div>
        <div className="swp-quote-usd">{usd}</div>
      </div>
    </>
  )
}

function DetailRow({ label, value }) {
  return (
    <div className="swp-row">
      <span className="swp-row-label">{label}</span>
      <span className="swp-row-value">{value}</span>
    </div>
  )
}

/* Screen 2 — Review Order. This is where the routing, slippage and fee detail
   lives, which is the whole reason the trade screen gets to stay so bare. */
function ReviewBody() {
  return (
    <>
      <div className="swp-card">
        {/* 3 columns x 2 rows: the labels sit over their own boxes and the arrow
            centres in the middle column against the boxes. */}
        <div className="swp-quote">
          <QuoteSide side="pay" label="You Pay" icon={usdtIcon} amount="2,500 USDT" usd="($2,500.00)" />
          <div className="swp-quote-arrow">
            <ArrowIcon />
          </div>
          <QuoteSide side="get" label="You Get" icon={hypeIcon} amount="47.93 HYPE" usd="($2,499.55)" />
        </div>

        <div className="swp-expiry">
          Quote expires in <span>11s</span>
        </div>

        <div className="swp-rows">
          <DetailRow label="Network" value="Hyperliquid" />
          <DetailRow label="Rate" value="1 HYPE = 52.15 USDT" />
          <DetailRow label="Estimated Fees" value="$3.69" />
          <DetailRow label="Max Slippage" value="5.5%" />
          <DetailRow label="Order Routing" value="Best available" />
        </div>
      </div>

      <div className="swp-cta">Place Order</div>
    </>
  )
}

/* `scale` is what buys the extra room. useFitScale sizes the phone for the trade
   screen; review shrinks the whole device on top of that, so the same pixel box
   shows more of the screen and the taller content fits without the type being
   sized down on both. It's a transform, so it animates on the compositor and
   doesn't relayout — unlike the zoom underneath it, which can't be animated.

   0.59 is not a taste call: it's the value that lands the ENTIRE 898px device
   inside the hero box. At 0.67 it showed 812 of those 898, so the phone was
   ~90% complete but had no bottom edge, and read as an iPhone stretched too
   long. Anything between "clearly a top crop" and "the whole device" looks
   wrong, so review goes all the way to whole. */
const SCREENS = [
  { title: 'Swap', Body: TradeBody, scale: 1 },
  { title: 'Review Order', Body: ReviewBody, scale: 0.59 },
]

/* The whole flow in ONE phone. The shell, status bar and tab bar stay mounted
   across screens; only the page inside slides, with the screen acting as the
   clipping box. Cheaper than swapping whole panels, and it lets the device
   shrink into the taller screen instead of cutting to a different phone. */
export default function SwapPanel({ variant = 'modal', screen = 0, dir = 0 }) {
  // 426px design width (the 402pt screen plus the 12px shell each side); fitted
  // to the trade screen's height, with review scaling down from there.
  const card = variant === 'card'
  const fitRef = useFitScale(426, card ? 0.7 : 1, card ? 518 : 544)
  const idx = SCREENS[screen] ? screen : 0
  const { title, Body, scale } = SCREENS[idx]

  return (
    <motion.div
      className="swp"
      ref={fitRef}
      // Top-centre origin: the phone is pinned to the top of the hero box, so
      // shrinking from the centre would pull it away from that anchor.
      style={{ transformOrigin: 'top center' }}
      animate={{ scale: card ? 1 : scale }}
      transition={pageTransition}
    >
      {/* Side buttons sit outside the screen, on the shell — cheap, but they're
          most of what makes the outline read as a phone rather than a rectangle. */}
      <span className="swp-btn swp-btn-silent" />
      <span className="swp-btn swp-btn-volup" />
      <span className="swp-btn swp-btn-voldown" />
      <span className="swp-btn swp-btn-power" />

      <div className="swp-screen">
        <div className="swp-status">
          <div className="swp-status-time">
            <span className="swp-time">5:42</span>
          </div>
          <div className="swp-island" />
          <div className="swp-status-levels">
            <img className="swp-level is-cellular" src={cellularIcon} alt="" draggable="false" />
            <img className="swp-level is-wifi" src={wifiIcon} alt="" draggable="false" />
            <img className="swp-level is-battery" src={batteryIcon} alt="" draggable="false" />
          </div>
        </div>

        {/* Status bar and tab bar bracket the stage and never move; the pages
            slide within it and are clipped by it. */}
        <div className="swp-stage">
          <AnimatePresence initial={false} custom={dir}>
            <motion.div
              key={idx}
              className="swp-page"
              custom={dir}
              variants={page}
              initial="enter"
              animate="center"
              exit="exit"
              transition={pageTransition}
            >
              <div className="swp-header">
                <div className="swp-largetitle">{title}</div>
              </div>
              <div className="swp-body">
                <Body />
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="swp-tabs">
          <Tab icon={<WalletTabIcon />} label="Wallet" />
          <Tab icon={<SwapTabIcon />} label="Swap" active />
          <Tab icon={<HistoryTabIcon />} label="History" />
          <div className="swp-home" />
        </div>
      </div>
    </motion.div>
  )
}
