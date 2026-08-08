import './index.css'
import { createRoot } from 'react-dom/client'
import ColourLab from './lab/ColourLab.jsx'

// Throwaway prototype: the Wireframe piece in the reference photo's palette.
// Not part of the site; reachable at /colour.html on the dev server.
createRoot(document.getElementById('root')).render(<ColourLab />)
