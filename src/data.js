/* Content for the two work columns.
   Recently-shipped titles/descriptions come straight from the wireframe.
   Playground titles reference real builds so the tiles read as real work. */

// Project screens exported from the Portfolio-4 Figma (2x → 1200w WebP).
// Each carries its pixel dims so the modal carousel can preserve aspect.
import colGlacier from './assets/collateral-glacier.webp'
import escrowField from './assets/escrow-field.webp'
import settleRiver from './assets/settlements-river.webp'
import colHero from './assets/collateral-hero.webp'
import colDashboard from './assets/collateral-dashboard.webp'
import colLoanDetails from './assets/collateral-loan-details.webp'
import colLoanDetails2 from './assets/collateral-loan-details-2.webp'
import colEmptyState from './assets/collateral-empty-state.webp'
import setCutout from './assets/settlements-cutout.webp'
import triCutout from './assets/triparty-cutout.webp'
import triDetail from './assets/triparty-detail.webp'
import triPanel from './assets/triparty-panel.webp'

export const projects = [
  {
    id: 'collateral',
    title: 'Collateral management',
    desc: 'Lending and borrowing of digital assets',
    heroBg: colGlacier, // experiment: landscape product-shot thumbnail
    cutout: 'tall',
    images: [
      { src: colHero, w: 1400, h: 1734 },
      { src: colDashboard, w: 2400, h: 1625 },
      { src: colLoanDetails, w: 2400, h: 1632 },
      { src: colLoanDetails2, w: 2400, h: 1632 },
      { src: colEmptyState, w: 2400, h: 1722 },
    ],
    year: '2025',
    role: 'Product Design',
    body: 'An institutional-grade collateral management experience for crypto-backed lending, part of Anchorage Digital’s Atlas platform. Lenders track loan health, loan-to-value (LTV), and margin thresholds in real time, so credit programs can scale through market volatility without losing visibility.',
    highlights: [
      'Real-time LTV and loan-health monitoring',
      'Automated margin calls with 24/7 risk oversight',
      'Assets held in federally regulated custody',
      'APIs and reporting for continuous position visibility',
    ],
    link: {
      label: 'Read the announcement',
      href: 'https://www.anchorage.com/insights/expanding-atlas-anchorage-digital-launches-institutional-grade-collateral-management-offering',
    },
    tags: ['DeFi', 'Lending', 'Dashboard', 'Risk'],
    metrics: [
      { value: '+62%', label: 'pledged AUC' },
      { value: '4\u00d7', label: 'collateral deals' },
    ],
  },
  {
    id: 'settlements',
    title: 'Settlements',
    desc: 'B2B payments — singular & multi-party settlements',
    heroBg: settleRiver, // experiment: landscape product-shot thumbnail
    heroComponent: 'send',
    cutout: 'tall',
    images: [{ src: setCutout, w: 1400, h: 1349 }],
    year: '2025',
    role: 'Product Design',
    body: 'End-to-end settlement rails for business payments, covering single and multi-party flows. Focused on making counterparties, amounts, and status legible at a glance, and on reducing the failure modes that make B2B payments stressful.',
    tags: ['Payments', 'Fintech', 'Flows', 'Usability'],
    metrics: [
      { value: '+20%', label: 'volume' },
      { value: '2\u00d7', label: 'settlements / mo' },
    ],
  },
  {
    id: 'escrow',
    title: 'Escrow accounts',
    desc: 'Also known as tri-party agreements',
    heroBg: escrowField, // experiment: landscape product-shot thumbnail
    heroComponent: 'agreement',
    cutout: 'wide',
    images: [
      { src: triCutout, w: 1600, h: 688 },
      { src: triDetail, w: 2400, h: 1820 },
      { src: triPanel, w: 2400, h: 1820 },
    ],
    year: '2024',
    role: 'Product Design',
    body: 'Tri-party escrow arrangements reimagined for a digital-asset context — clear roles, release conditions, and an audit trail that all three parties can trust. Designed the states and edge cases first, then the happy path.',
    tags: ['Escrow', 'DeFi', 'Systems', 'Edge cases'],
    metrics: [
      { value: '+90%', label: 'pledged AUC' },
    ],
  },
]

// `mode` controls how a tile opens: 'iframe' (vendored standalone build in
// /public) or 'native' (a ported React component). Tiles without a mode are
// not yet wired to open.
export const playground = [
  {
    id: 'portfolio-node-builder',
    title: 'Portfolio Node Builder',
    tag: 'Backtest or project future earnings',
    mode: 'native',
    fullBleed: true, // canvas fills the viewer edge-to-edge
    liveTile: true,
  },
  {
    id: 'card-stacker',
    title: 'Card Stacker',
    tag: 'Compare liquidity between lenders',
    mode: 'native',
    fullBleed: true,
    liveTile: true,
  },
  {
    id: 'crypto-glass-widget',
    title: 'Trading Widget',
    tag: 'Purchase Ether on any network from any wallet',
    mode: 'native',
    bg: 'var(--pg-canvas)', // shared opened-playground canvas token
    liveTile: true, // renders a live compact view in the tile
  },
  {
    id: 'animated-menu',
    title: 'Animated Menu',
    tag: 'Browse, drill in, and drop a line',
    mode: 'native',
    bg: 'var(--pg-canvas)', // shared opened-playground canvas token
    liveTile: true,
  },
]
