/* Minimal inline icon set — single stroke weight, matches the outline aesthetic. */

const base = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  viewBox: '0 0 24 24',
}

export const ArrowUpRight = (p) => (
  <svg {...base} {...p}>
    <path d="M7 17 17 7" />
    <path d="M8 7h9v9" />
  </svg>
)

export const Close = (p) => (
  <svg {...base} {...p}>
    <path d="M18 6 6 18" />
    <path d="M6 6l12 12" />
  </svg>
)

export const Globe = (p) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18" />
    <path d="M12 3a15 15 0 0 1 0 18a15 15 0 0 1 0-18" />
  </svg>
)

export const Leaf = (p) => (
  <svg {...base} {...p}>
    <path d="M11 20A7 7 0 0 1 4 13c0-5 4-8 15-9c-1 11-4 15-9 15Z" />
    <path d="M4 20c3-4 6-6 11-7" />
  </svg>
)

/* Brand marks — outlined/simplified to stay on-theme */
export const GitHub = (p) => (
  <svg {...base} {...p}>
    <path d="M9 19c-4 1.5-4-2-6-2m12 4v-3.5c0-1 .1-1.4-.5-2c2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2a4.3 4.3 0 0 0-.1-3.2s-1-.3-3.4 1.3a11.7 11.7 0 0 0-6 0C6.3 3 5.3 3.3 5.3 3.3a4.3 4.3 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.7c0 4.6 2.7 5.7 5.5 6c-.6.6-.6 1.2-.5 2V21" />
  </svg>
)

export const LinkedIn = (p) => (
  <svg {...base} {...p}>
    <rect x="3" y="3" width="18" height="18" rx="3" />
    <path d="M8 10v7" />
    <path d="M8 7v.01" />
    <path d="M12 17v-4a2 2 0 0 1 4 0v4" />
    <path d="M12 13v4" />
  </svg>
)

export const XMark = (p) => (
  <svg {...base} {...p}>
    <path d="M4 4l16 16" />
    <path d="M20 4 4 20" />
  </svg>
)

export const Mail = (p) => (
  <svg {...base} {...p}>
    <rect x="3" y="5" width="18" height="14" rx="2.5" />
    <path d="m4 7 8 6 8-6" />
  </svg>
)

/* Tab icons */
export const Grid = (p) => (
  <svg {...base} {...p}>
    <rect x="3" y="3" width="7" height="7" rx="1.6" />
    <rect x="14" y="3" width="7" height="7" rx="1.6" />
    <rect x="3" y="14" width="7" height="7" rx="1.6" />
    <rect x="14" y="14" width="7" height="7" rx="1.6" />
  </svg>
)

export const Book = (p) => (
  <svg {...base} {...p}>
    <path d="M12 7v13" />
    <path d="M3 5.5A1.5 1.5 0 0 1 4.5 4H9a3 3 0 0 1 3 3 3 3 0 0 1 3-3h4.5A1.5 1.5 0 0 1 21 5.5v11a1.5 1.5 0 0 1-1.5 1.5H14a2 2 0 0 0-2 2 2 2 0 0 0-2-2H4.5A1.5 1.5 0 0 1 3 16.5z" />
  </svg>
)
