import { useRef, useState } from 'react'
import SocialLinks from './components/SocialLinks.jsx'
import Header from './components/Header.jsx'
import RecentlyShipped from './components/RecentlyShipped.jsx'
import Playground from './components/Playground.jsx'
import ProjectModal from './components/ProjectModal.jsx'

export default function App() {
  const [active, setActive] = useState(null)
  // Tracks the card currently morphing back so it can sit above the overlay.
  const [closingId, setClosingId] = useState(null)
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
    // Clear once the reverse morph has finished.
    closeTimer.current = setTimeout(() => setClosingId(null), 550)
  }

  return (
    <div className="page">
      <div className="container">
        <div className="topbar">
          <SocialLinks />
        </div>

        <Header />

        <main className="work">
          <RecentlyShipped
            onOpen={open}
            activeId={active?.id}
            closingId={closingId}
          />
          <Playground />
        </main>
      </div>

      <ProjectModal project={active} onClose={close} />
    </div>
  )
}
