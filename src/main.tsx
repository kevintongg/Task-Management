import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// Type declaration for Vite HMR
declare global {
  interface ImportMeta {
    hot?: {
      accept(cb?: () => void): void
      accept(dep: string, cb: () => void): void
    }
  }
}

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
  </React.StrictMode>
)

// Hot Module Replacement (HMR) - API
if (import.meta.hot) {
  import.meta.hot.accept('./App', () => {
    // Re-render the app when App.tsx changes
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    )
  })
}
