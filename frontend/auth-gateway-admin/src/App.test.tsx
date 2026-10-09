import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { App } from './App'
import { useNavigation } from '@/boilerplate/navigation/navigation-state'
import { foundationServiceConfig } from '@/features/foundation/foundation-config'

beforeEach(() => {
  window.history.replaceState({}, '', '/')
  useNavigation.setState({ menuOpen: false, sidebarCollapsed: false })
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          service: foundationServiceConfig.expectedService,
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

describe('Admin foundation', () => {
  it('renders the home screen at the root route', async () => {
    render(<App />)
    expect(
      await screen.findByRole('heading', { name: /panel de administración/ }),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Inicio' })).toBeInTheDocument()
  })

  it('mounts the application and connects to its backend from overview', async () => {
    render(<App />)
    await userEvent.click(await screen.findByRole('link', { name: 'Overview' }))
    expect(
      await screen.findByRole('heading', { name: /A clear foundation/ }),
    ).toBeInTheDocument()
    expect(await screen.findByText('API connected')).toBeInTheDocument()
    expect(
      screen.getByText(foundationServiceConfig.expectedService),
    ).toBeInTheDocument()
  })

  it('renders a loading state while the request is pending', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => new Promise(() => {})),
    )
    render(<App />)
    await userEvent.click(await screen.findByRole('link', { name: 'Overview' }))
    expect(await screen.findByText('Checking connection…')).toBeInTheDocument()
  })

  it('renders a recoverable connection error', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new TypeError('Network failed')),
    )
    render(<App />)
    await userEvent.click(await screen.findByRole('link', { name: 'Overview' }))
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
    await userEvent.click(await screen.findByRole('link', { name: 'Overview' }))
    expect(
      await screen.findByText('Connection unavailable'),
    ).toBeInTheDocument()
  })

  it('navigates to overview without reloading the application', async () => {
    render(<App />)
    await userEvent.click(await screen.findByRole('link', { name: 'Overview' }))
    expect(
      await screen.findByRole('heading', { name: /A clear foundation/ }),
    ).toBeInTheDocument()
    expect(screen.getByText('Overview', { selector: '.topbar-page' })).toBeInTheDocument()
  })

  it('shares navigation state between the header and navigation', async () => {
    render(<App />)
    const toggle = await screen.findByRole('button', {
      name: 'Toggle navigation',
    })
    await userEvent.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'true')
    await userEvent.click(await screen.findByRole('link', { name: 'Overview' }))
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
  })
})
