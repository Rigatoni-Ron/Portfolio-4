import './pnb.css'
import { Canvas } from './components/Canvas'

/*
 * Portfolio Node Builder — ported from the standalone app (Builds/
 * portfolio-node-builder). React Flow canvas for composing stock/ETF
 * portfolios; runs on deterministic mock price data here (no API key).
 *   variant="full" → the real interactive canvas (viewer)
 *   variant="tile" → nothing yet; the tile micro-moment is built separately
 */
export default function PortfolioNodeBuilder({ variant = 'full' }: { variant?: 'tile' | 'full' }) {
  if (variant === 'tile') return null
  return (
    <div className="pnb">
      <Canvas />
    </div>
  )
}
