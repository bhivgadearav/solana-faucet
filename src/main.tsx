import { Buffer } from "buffer"
window.Buffer = Buffer

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <div className="min-h-screen bg-black text-white overflow-hidden relative">
      {/* Checks background */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: "linear-gradient(white 1px, transparent 1px), linear-gradient(to right, white 1px, transparent 1px)",
          backgroundSize: "40px 40px"
        }}>
        </div>
      </div>
      <App/>
    </div>
  </StrictMode>,
)
