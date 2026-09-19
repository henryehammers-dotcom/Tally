import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { initServiceWorker } from './registerSW'
import { initViewportHeightSync } from './lib/viewportHeight'
import './index.css'

initServiceWorker()
initViewportHeightSync()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
