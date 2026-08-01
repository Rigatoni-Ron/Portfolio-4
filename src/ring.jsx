import { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'
import SocialLinks from './components/SocialLinks.jsx'
import Header from './components/Header.jsx'
import Tabs from './components/Tabs.jsx'
import Learnings from './components/Learnings.jsx'
import CustomCursor from './components/CustomCursor.jsx'
import Ring from './components/Ring.jsx'
import './index.css'
import './tailwind.css'
import './ring.css'

/* Dev-only prototype page: the site, with the two Work columns replaced by
   one ring. Tabs stay; Words is untouched. */
function RingApp() {
  const [tab, setTab] = useState('work')
  return (
    <div className="page is-ready">
      <div className="container">
        <div className="topbar">
          <SocialLinks />
        </div>
        <Header />
        <Tabs current={tab} onChange={setTab} />
        {tab === 'work' ? <Ring /> : <Learnings />}
      </div>
      <CustomCursor />
    </div>
  )
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RingApp />
  </StrictMode>
)
