import './index.css'
import './tailwind.css'
import './preview-light.css'
import { createRoot } from 'react-dom/client'
import LoanCard from './components/LoanCard.jsx'
import AgreementAssets from './components/AgreementAssets.jsx'
import SendTransfer from './components/SendTransfer.jsx'

// Throwaway preview: the rebuilt product UIs in dark vs light. Not part of the
// site; reachable at /preview.html on the dev server.
const ROWS = [
  { name: 'Loan Card — Collateral', Comp: LoanCard, w: 460 },
  { name: 'Agreement Assets — Escrow', Comp: AgreementAssets, w: 880, zoom: 0.62 },
  { name: 'Send Transfer — Settlements', Comp: SendTransfer, w: 460 },
]

function App() {
  return (
    <div className="pv">
      <h1 className="pv-title">Recently-shipped UI — light-mode preview</h1>
      <p className="pv-sub">The rebuilt Anchorage components, dark (as shipped) vs a light theme.</p>
      {ROWS.map(({ name, Comp, w, zoom }) => (
        <section className="pv-row" key={name}>
          <div className="pv-label">{name}</div>
          <div className="pv-pair">
            <div className="pv-tag">
              <span>Dark</span>
              <span>Light</span>
            </div>
            <div className="pv-stage pv-dark">
              <div style={{ width: w, zoom }}>
                <Comp />
              </div>
            </div>
            <div className="pv-stage pv-light ui-theme-light">
              <div style={{ width: w, zoom }}>
                <Comp />
              </div>
            </div>
          </div>
        </section>
      ))}
    </div>
  )
}

createRoot(document.getElementById('root')).render(<App />)
