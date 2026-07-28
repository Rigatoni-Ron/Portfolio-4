import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Cv from './components/Cv.jsx'
import './cv.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Cv />
  </StrictMode>
)
