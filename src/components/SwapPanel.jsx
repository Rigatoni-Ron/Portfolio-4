import { useFitScale } from '../useFitScale.js'
import usdtIcon from '../assets/tri-icon-usdt.svg'
import hypeIcon from '../assets/tri-icon-hype.svg'
import cellularIcon from '../assets/ios-cellular.svg'
import wifiIcon from '../assets/ios-wifi.svg'
import batteryIcon from '../assets/ios-battery.svg'

/*
 * Swap — the trade screen from the crypto swapping app, rebuilt from the
 * recorded flow as a full phone screen inside an iPhone outline: status bar,
 * the Swap title, both swap legs, the primary action, and the
 * Wallet / Swap / History tab bar.
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

export default function SwapPanel({ variant = 'modal' }) {
  // 426px design width (the 402pt screen plus the 12px shell each side). Both
  // contexts fit to a design HEIGHT shorter than the phone's real 898 and let
  // the rest run off the bottom, which is what keeps the type legible. The
  // button's bottom edge sits at 496 (measured in the browser, not derived —
  // the line-heights don't sum to anything tidy), so both clear it: the tile by
  // a sliver, the modal by more. Expressing these as heights rather than fixed
  // zooms means the cut holds at any tile or modal size.
  const card = variant === 'card'
  const fitRef = useFitScale(426, card ? 0.7 : 1, card ? 518 : 544)
  return (
    <div className="swp" ref={fitRef}>
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

        <div className="swp-header">
          <div className="swp-largetitle">Swap</div>
        </div>

        <div className="swp-body">
          <div className="swp-card">
            <Leg
              amount="2,500"
              usd="$2,500.00"
              icon={usdtIcon}
              symbol="USDT"
              balance="10,728.82"
            />

            {/* The rule spans the card; the flip button sits on it, opaque so
                it reads as a control rather than a badge floating over a line. */}
            <div className="swp-divider">
              <div className="swp-flip">
                <FlipIcon />
              </div>
            </div>

            {/* 2,500 USDT ÷ $52.15 = 47.93 HYPE, the rounding down standing in
                for the spread. Its USD line is that back at the same price. */}
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
        </div>

        <div className="swp-tabs">
          <Tab icon={<WalletTabIcon />} label="Wallet" />
          <Tab icon={<SwapTabIcon />} label="Swap" active />
          <Tab icon={<HistoryTabIcon />} label="History" />
          <div className="swp-home" />
        </div>
      </div>
    </div>
  )
}
