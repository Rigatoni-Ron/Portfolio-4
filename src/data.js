/* Content for the two work columns.
   Recently-shipped titles/descriptions come straight from the wireframe.
   Playground titles reference real builds so the tiles read as real work. */

import collateralImg from './assets/collateral-management.png'

export const projects = [
  {
    id: 'collateral',
    title: 'Collateral management',
    desc: 'Lending and borrowing of digital assets',
    image: collateralImg,
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
  },
  {
    id: 'settlements',
    title: 'Settlements',
    desc: 'B2B payments — singular & multi-party settlements',
    year: '2025',
    role: 'Product Design',
    body: 'End-to-end settlement rails for business payments, covering single and multi-party flows. Focused on making counterparties, amounts, and status legible at a glance, and on reducing the failure modes that make B2B payments stressful.',
    tags: ['Payments', 'Fintech', 'Flows', 'Usability'],
  },
  {
    id: 'escrow',
    title: 'Escrow accounts',
    desc: 'Also known as tri-party agreements',
    year: '2024',
    role: 'Product Design',
    body: 'Tri-party escrow arrangements reimagined for a digital-asset context — clear roles, release conditions, and an audit trail that all three parties can trust. Designed the states and edge cases first, then the happy path.',
    tags: ['Escrow', 'DeFi', 'Systems', 'Edge cases'],
  },
]

// `mode` controls how a tile opens: 'iframe' (vendored standalone build in
// /public) or 'native' (a ported React component). Tiles without a mode are
// not yet wired to open.
export const playground = [
  {
    id: 'portfolio-node-builder',
    title: 'Portfolio Node Builder',
    tag: 'React Flow',
    mode: 'iframe',
    src: '/playground/portfolio-node-builder/index.html',
  },
  {
    id: 'card-stacker',
    title: 'Card Stacker',
    tag: 'Gesture / stack',
    mode: 'iframe',
    src: '/playground/card-stacker/index.html',
  },
  {
    id: 'crypto-glass-widget',
    title: 'Crypto Glass Widget',
    tag: 'Material',
    mode: 'iframe',
    src: '/playground/crypto-glass-widget/index.html',
  },
  {
    id: 'plan-your-trip-globe',
    title: 'Plan Your Trip Globe',
    tag: '3D globe',
    mode: 'iframe',
    src: '/playground/plan-your-trip-globe/index.html',
  },
  {
    id: '3d-shape-animator',
    title: '3D Shape Animator',
    tag: 'Three.js',
    mode: 'iframe',
    src: '/playground/3d-shape-animator/index.html',
  },
  { id: 'animated-menu', title: 'Animated Menu', tag: 'Interaction', mode: 'native' },
]
