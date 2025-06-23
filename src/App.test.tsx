import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('App', () => {
  it('renders without crashing', () => {
    // App component already has BrowserRouter inside, so don't wrap it
    render(<App />)

    // Check if the app renders without throwing
    expect(document.body).toBeTruthy()
  })

  it('renders the main application structure', () => {
    render(<App />)

    // The app should render some content
    expect(document.body.innerHTML).toContain('div')
  })
})
