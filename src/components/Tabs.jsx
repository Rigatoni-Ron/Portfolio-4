import { motion } from 'framer-motion'
import { Grid, Book } from './icons.jsx'

const TABS = [
  { id: 'work', label: 'Work', Icon: Grid },
  { id: 'learnings', label: 'Learnings', Icon: Book },
]

// Same bouncy spring the original tab component used.
const bouncy = { type: 'spring', stiffness: 480, damping: 18, mass: 0.9 }

export default function Tabs({ current, onChange }) {
  return (
    <nav className="tabs-wrap" aria-label="Sections">
      <div className="tabs">
        {TABS.map((tab) => {
          const active = current === tab.id
          const { Icon } = tab
          return (
            <button
              key={tab.id}
              type="button"
              className={`tab ${active ? 'tab-active' : ''}`}
              onClick={() => onChange(tab.id)}
              aria-pressed={active}
            >
              {active && (
                <motion.span
                  layoutId="tab-indicator"
                  className="tab-indicator"
                  transition={bouncy}
                />
              )}
              <motion.span
                className="tab-icon"
                initial={false}
                animate={{
                  width: active ? 18 : 0,
                  opacity: active ? 1 : 0,
                  scale: active ? 1 : 0.4,
                  marginRight: active ? 6 : 0,
                }}
                transition={bouncy}
              >
                <Icon />
              </motion.span>
              <span className="tab-label">{tab.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
