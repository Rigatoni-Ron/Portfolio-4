import { lazy } from 'react'

// Native (ported) Playground components, code-split so a component's code +
// deps load only when its tile is opened. Add new entries here as we port more.
export const nativeComponents = {
  'animated-menu': lazy(() => import('./animated-menu/AnimatedMenu.jsx')),
}
