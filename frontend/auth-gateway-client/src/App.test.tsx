import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { App } from './App'
import { useNavigation } from './state/navigation'
import { config } from './config'

beforeEach(() => {
  window.history.replaceState({}, '', '/')
  useNavigation.setState({ menuOpen: false })
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          service: config.service,
          status: 'running',
          version: '1.0.0',
        }),
        { status: 200 },
      ),
    ),
  )
})
afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

describe('Client foundation', () => {
  it('mounts the independent application and connects to its backend', async () => {
    render(<App />)
    expect(
      await screen.findByRole('heading', { name: /A clear foundation/ }),
    ).toBeInTheDocument()
    expect(await screen.findByText('API connected')).toBeInTheDocument()
    expect(screen.getByText(config.service)).toBeInTheDocument()
  })
  it('renders a loading state while the request is pending', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => new Promise(() => {})),
    )
    render(<App />)
    expect(await screen.findByText('Checking connection…')).toBeInTheDocument()
  })
  it('renders a recoverable connection error', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new TypeError('Network failed')),
    )
    render(<App />)
    expect(
      await screen.findByText('Connection unavailable'),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Check connection' }),
    ).toBeEnabled()
  })
  it('rejects a response from the wrong backend', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            service: 'Unexpected.Service',
            status: 'running',
            version: '1.0.0',
          }),
        ),
      ),
    )
    render(<App />)
    expect(
      await screen.findByText('Connection unavailable'),
    ).toBeInTheDocument()
  })
  it('navigates to runtime without reloading the application', async () => {
    render(<App />)
    await screen.findByText('API connected')
    await userEvent.click(screen.getByRole('link', { name: 'Runtime' }))
    expect(
      await screen.findByRole('heading', { name: 'Runtime' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Service diagnostics' }),
    ).toBeInTheDocument()
  })
  it('shares navigation state between the header and navigation', async () => {
    render(<App />)
    const toggle = await screen.findByRole('button', {
      name: 'Toggle navigation',
    })
    await userEvent.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'true')
    await userEvent.click(screen.getByRole('link', { name: 'Runtime' }))
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
  })
})
