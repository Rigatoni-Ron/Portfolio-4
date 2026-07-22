/*
 * Loan Card — rebuilt from Figma (node 402:19474), the Collateral-management
 * loan row. Faithful to the design's content + tokens, but the container is a
 * frosted-glass panel (the Figma fill is near-transparent white, meant to sit
 * on a dark app bg — over the bright glacier photo it needs its own backing to
 * stay legible). Experiment: floats over a landscape as a "product shot".
 */
export default function LoanCard() {
  return (
    <div className="loancard">
      <div className="loancard-top">
        <div className="loancard-head">
          <div className="loancard-amount">
            <span className="loancard-amount-value">$32,143,573.11</span>
            <span className="loancard-amount-unit">loaned</span>
          </div>
          <div className="loancard-account">Solana Foundation</div>
        </div>
        <div className="loancard-badge">Healthy</div>
      </div>

      <div className="loancard-ltv">
        <div className="loancard-bars">
          {/* fill fractions per the Figma: full, half, empty, empty */}
          {[1, 0.5, 0, 0].map((fill, i) => (
            <div className="loancard-bar" key={i}>
              <span className="loancard-bar-fill" style={{ width: `${fill * 100}%` }} />
            </div>
          ))}
        </div>
        <span className="loancard-ltv-label">24.7% LTV</span>
      </div>
    </div>
  )
}
