import './index.css'
import { createRoot } from 'react-dom/client'
import LabPage from './lab/LabPage.jsx'

// Throwaway prototype page for the vector line-drawing experiments.
// Not part of the site; reachable at /lab.html on the dev server.
createRoot(document.getElementById('root')).render(<LabPage />)
