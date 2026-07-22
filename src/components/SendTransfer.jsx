import usdtIcon from '../assets/set-icon-usdt.svg'
import walletIcon from '../assets/set-icon-wallet.svg'

/*
 * Send Transfer — rebuilt from Figma (node 422:20734), the Settlements send
 * flow. Faithful content + tokens; the container is a frosted-glass panel
 * (same product-shot treatment as the other two). Renders at a fixed design
 * width and is scaled to fit by the hero-shot overlay.
 */

const EthBadge = () => (
  <span className="send-net-badge" aria-hidden="true">
    <svg width="7" height="7" viewBox="0 0 10 16" fill="#fff">
      <path d="M5 0 L0 8.2 5 11.2 10 8.2Z" opacity="0.9" />
      <path d="M5 12.2 L0 9.2 5 16 10 9.2Z" opacity="0.6" />
    </svg>
  </span>
)

export default function SendTransfer() {
  return (
    <div className="send">
      <div className="send-to">
        <div className="send-to-label">To</div>
        <div className="send-desc">
          <span>Patrick Fitsimmons</span>
          <span className="send-sep" />
          <span>Goldman Sachs</span>
        </div>
      </div>

      <div className="send-source">
        <div className="send-amount">
          <div className="send-amount-main">
            <div className="send-amount-row">
              <span className="send-digit">0</span>
              <span className="send-caret" />
              <span className="send-unit">USDT</span>
            </div>
            <div className="send-usd">$0.00</div>
          </div>
          <div className="send-max">Max</div>
        </div>

        <div className="send-attached">
          <div className="send-cell">
            <div className="send-net">
              <img className="send-net-icon" src={usdtIcon} alt="" draggable="false" />
              <EthBadge />
            </div>
            <div className="send-cell-text">
              <div className="send-cell-title">Asset</div>
              <div className="send-desc">
                <span>USDT</span>
                <span className="send-sep" />
                <span>Ethereum regnet</span>
              </div>
            </div>
          </div>

          <div className="send-cell send-cell-from">
            <img className="send-cell-icon" src={walletIcon} alt="" draggable="false" />
            <div className="send-cell-text">
              <div className="send-cell-title">From</div>
              <div className="send-desc">
                <span>USDT wallet 2</span>
                <span className="send-sep" />
                <span>Main vault</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
