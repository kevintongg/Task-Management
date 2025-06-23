import { SpeedInsights } from '@vercel/speed-insights/react'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// Vite HMR types are already declared in vite-env.d.ts

// Get the root element
const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('Failed to find the root element')
}

// Create root and render app
const root = ReactDOM.createRoot(rootElement)

root.render(
  <React.StrictMode>
    <App />
    <SpeedInsights />
  </React.StrictMode>
)

// Hot Module Replacement (HMR) - API
if (import.meta.hot) {
  import.meta.hot.accept('./App', () => {
    // Re-render the app when App.tsx changes
    root.render(
      <React.StrictMode>
        <App />
        <SpeedInsights />
      </React.StrictMode>
    )
  })
}
