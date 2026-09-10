import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { initServiceWorker } from './registerSW'
import './index.css'

initServiceWorker()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
