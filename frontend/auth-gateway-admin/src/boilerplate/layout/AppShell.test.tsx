import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { cleanup, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithRouter } from '@/test/render-with-router'
import { Fingerprint, Home, Layers3 } from 'lucide-react'
import { AppShell } from '@/boilerplate/layout/AppShell'
import type { AppConfig } from '@/boilerplate/config/app-config'
import { useNavigation } from '@/boilerplate/navigation/navigation-state'

const testConfig: AppConfig = {
  identity: {
    name: 'Sample Admin',
    initials: 'SA',
  },
  workspace: {
    name: 'Demo Workspace',
    initials: 'D',
  },
  user: {
    name: 'Sample User',
    initials: 'S',
  },
}

const testNavigation = [
  {
    id: 'main',
    labelKey: 'groups.testMain',
    order: 0,
    items: [
      {
        to: '/',
        labelKey: 'items.testHome',
        icon: Layers3,
        order: 0,
        visible: true,
        exact: true,
      },
      {
        to: '/runtime',
        labelKey: 'items.testDiagnostics',
        icon: Home,
        order: 1,
        visible: true,
      },
      {
        labelKey: 'items.testIdentity',
        icon: Fingerprint,
        order: 2,
        visible: true,
        children: [
          {
            to: '/providers',
            labelKey: 'items.testCatalog',
            icon: Fingerprint,
            order: 0,
            visible: true,
          },
        ],
      },
    ],
  },
]

describe('AppShell', () => {
  beforeEach(() => {
    useNavigation.setState({ menuOpen: false, sidebarCollapsed: false })
  })

  afterEach(() => {
    cleanup()
  })

  it('renders configurable chrome without Auth Gateway-specific strings', async () => {
    await renderWithRouter(
      <AppShell config={testConfig} navigation={testNavigation}>
        <p>Child content</p>
      </AppShell>,
    )
    expect(screen.getByText('Sample Admin')).toBeInTheDocument()
    expect(screen.getByText('Demo Workspace')).toBeInTheDocument()
    expect(screen.getByText('Sample User')).toBeInTheDocument()
    expect(screen.getByText('Producción')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Nueva aplicación' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Child content')).toBeInTheDocument()
    expect(screen.queryByText('Auth Gateway')).not.toBeInTheDocument()
  })

  it('filters navigation items from the sidebar search', async () => {
    await renderWithRouter(
      <AppShell config={testConfig} navigation={testNavigation}>
        <p>Child content</p>
      </AppShell>,
    )
    await userEvent.type(
      screen.getByRole('searchbox', { name: 'Buscar' }),
      'diag',
    )
    expect(
      screen.getByRole('link', { name: 'Diagnostics' }),
    ).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Home' })).not.toBeInTheDocument()
  })

  it('expands nested navigation to reveal child destinations', async () => {
    await renderWithRouter(
      <AppShell config={testConfig} navigation={testNavigation}>
        <p>Child content</p>
      </AppShell>,
    )
    const branch = screen.getByRole('button', { name: 'Identity' })
    expect(branch).toHaveAttribute('aria-expanded', 'false')
    const panel = document.getElementById(
      branch.getAttribute('aria-controls') ?? '',
    )
    expect(panel).toHaveAttribute('data-open', 'false')
    await userEvent.click(branch)
    expect(branch).toHaveAttribute('aria-expanded', 'true')
    expect(panel).toHaveAttribute('data-open', 'true')
    expect(screen.getByRole('link', { name: 'Catalog' })).toBeInTheDocument()
  })
})
