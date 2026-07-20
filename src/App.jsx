import { useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import SocialLinks from './components/SocialLinks.jsx'
import Header from './components/Header.jsx'
import Tabs from './components/Tabs.jsx'
import RecentlyShipped from './components/RecentlyShipped.jsx'
import Playground from './components/Playground.jsx'
import Learnings from './components/Learnings.jsx'
import ProjectModal from './components/ProjectModal.jsx'
import CustomCursor from './components/CustomCursor.jsx'

const panelVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
}
const panelTransition = { duration: 0.32, ease: [0.22, 1, 0.36, 1] }

export default function App() {
  const [active, setActive] = useState(null)
  // Tracks the card currently morphing back so it can sit above the overlay.
  const [closingId, setClosingId] = useState(null)
  const [tab, setTab] = useState('work')
  const closeTimer = useRef(null)

  const open = (p) => {
    clearTimeout(closeTimer.current)
    setClosingId(null)
    setActive(p)
  }

  const close = () => {
    setClosingId(active?.id ?? null)
    setActive(null)
    clearTimeout(closeTimer.current)
    closeTimer.current = setTimeout(() => setClosingId(null), 550)
  }

  const changeTab = (next) => {
    setActive(null) // close any open modal when switching sections
    setTab(next)
  }

  return (
    <div className="page">
      <div className="container">
        <div className="topbar">
          <SocialLinks />
        </div>

        <Header />
        <Tabs current={tab} onChange={changeTab} />

        <AnimatePresence mode="wait">
          {tab === 'work' ? (
            <motion.main
              key="work"
              className="work"
              variants={panelVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={panelTransition}
            >
              <RecentlyShipped
                onOpen={open}
                activeId={active?.id}
                closingId={closingId}
              />
              <Playground />
            </motion.main>
          ) : (
            <motion.div
              key="learnings"
              variants={panelVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={panelTransition}
            >
              <Learnings />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <ProjectModal project={active} onClose={close} />
      <CustomCursor />
    </div>
  )
}
