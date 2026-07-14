/* Content for the two work columns.
   Recently-shipped titles/descriptions come straight from the wireframe.
   Playground titles reference real builds so the tiles read as real work. */

export const projects = [
  {
    id: 'collateral',
    title: 'Collateral management',
    desc: 'Lending and borrowing of digital assets',
    year: '2025',
    role: 'Product Design',
    body: 'A workflow for posting and managing on-chain collateral across lending positions — margin health, liquidation thresholds, and asset selection surfaced without overwhelming the user. Prototyped the flows in code to pressure-test the interactions before hand-off.',
    tags: ['DeFi', 'Web app', 'Prototyping', 'Design system'],
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

export const playground = [
  { id: 'card-stacker', title: 'Card Stacker', tag: 'Gesture / stack' },
  { id: 'audio-player', title: 'Audio Player', tag: 'Apple-style' },
  { id: 'dynamic-clock', title: 'Dynamic Clock', tag: 'Motion' },
  { id: 'crypto-widget', title: 'Crypto Glass Widget', tag: 'Material' },
  { id: 'animated-menu', title: 'Animated Menu', tag: 'Interaction' },
  { id: 'shader-grid', title: 'Shader Wave Grid', tag: 'WebGL' },
]
