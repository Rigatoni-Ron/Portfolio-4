import { useFitScale } from '../useFitScale.js'
import usdtIcon from '../assets/tri-icon-usdt.svg'
import hypeIcon from '../assets/tri-icon-hype.svg'

/*
 * Swap — the trade screen from the crypto swapping app, rebuilt from the
 * recorded flow as a full phone screen inside an iPhone outline: status bar,
 * the Choose Tokens / Settings / large-title header, both swap legs, the
 * primary action, and the Wallet / Swap / History tab bar.
 *
 * Type scale is deliberately short — four sizes (12 / 15 / 17 / 34) and three
 * weights (400 body, 600 for the CTA and the status clock, 700 for the large
 * title). Anything that wanted a fifth size got folded into one of these.
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
 * Laid out at 393pt (iPhone logical width) so the iOS metrics are literal;
 * proportions inside the cards are measured off the recording. The hero-shot
 * overlay scales the whole thing via useFitScale.
 *
 * Static by design — this is a product shot, not a working swap.
 */

/* ── status bar ─────────────────────────────────────────────── */

function BellSlashIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
      <path
        d="M4.1 4.9a3.6 3.6 0 0 1 6.9 1.4c0 2.6.9 3.4.9 3.4H3.2s.9-.8.9-3.4"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <path d="M6.2 12a1.5 1.5 0 0 0 2.6 0" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M2 2l11 11" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  )
}

function CellularIcon() {
  return (
    <svg width="18" height="12" viewBox="0 0 18 12" fill="none" aria-hidden="true">
      <rect x="0" y="8" width="3" height="4" rx="1" fill="currentColor" />
      <rect x="5" y="5.5" width="3" height="6.5" rx="1" fill="currentColor" opacity="0.3" />
      <rect x="10" y="3" width="3" height="9" rx="1" fill="currentColor" opacity="0.3" />
      <rect x="15" y="0" width="3" height="12" rx="1" fill="currentColor" opacity="0.3" />
    </svg>
  )
}

function WifiIcon() {
  return (
    <svg width="17" height="12" viewBox="0 0 17 12" fill="none" aria-hidden="true">
      <path d="M1 3.6a11 11 0 0 1 15 0" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M3.9 6.7a7 7 0 0 1 9.2 0" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M6.8 9.7a3 3 0 0 1 3.4 0" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  )
}

function BatteryIcon() {
  return (
    <svg width="26" height="13" viewBox="0 0 26 13" fill="none" aria-hidden="true">
      <rect x="0.6" y="0.6" width="22" height="11.8" rx="3.4" stroke="currentColor" strokeWidth="1.1" opacity="0.4" />
      <rect x="2.2" y="2.2" width="12" height="8.6" rx="2.2" fill="currentColor" />
      <path d="M24.4 4.6v3.8a2 2 0 0 0 0-3.8Z" fill="currentColor" opacity="0.4" />
    </svg>
  )
}

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
  // 417px design width (the 393pt screen plus the 12px shell each side). Both
  // contexts fit to a design HEIGHT shorter than the phone's real 876 and let
  // the rest run off the bottom, which is what keeps the type legible. With no
  // nav bar the button's bottom edge lands at 423 (measured, not derived — the
  // line-heights don't sum to anything tidy), so both clear it: the tile by a
  // sliver, the modal by more. Expressing these as heights rather than fixed
  // zooms means the cut holds at any tile or modal size.
  const card = variant === 'card'
  const fitRef = useFitScale(417, card ? 0.7 : 1, card ? 445 : 470)
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
          <div className="swp-status-left">
            <span className="swp-time">5:42</span>
            <BellSlashIcon />
          </div>
          <div className="swp-island">
            <span className="swp-lens" />
          </div>
          <div className="swp-status-right">
            <CellularIcon />
            <WifiIcon />
            <BatteryIcon />
          </div>
        </div>

        {/* No nav bar: the tab bar already names the screen, so the content
            field starts straight off the status bar. */}
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
