import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { initServiceWorker } from './registerSW'
import { initSafeBottom } from './lib/safeBottom'
import '@fontsource-variable/figtree'
import './index.css'

initServiceWorker()
initSafeBottom()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
