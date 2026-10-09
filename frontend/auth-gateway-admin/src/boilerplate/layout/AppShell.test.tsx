import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithRouter } from '@/test/render-with-router'
import { Home, Layers3 } from 'lucide-react'
import { AppShell } from '@/boilerplate/layout/AppShell'
import type { AppConfig } from '@/boilerplate/config/app-config'

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
  search: {
    placeholder: 'Find',
  },
  environment: {
    label: 'Sandbox',
  },
  primaryAction: {
    label: 'New Resource',
  },
}

const testNavigation = [
  {
    id: 'main',
    label: 'Main',
    order: 0,
    items: [
      {
        to: '/',
        label: 'Home',
        icon: Layers3,
        order: 0,
        visible: true,
        exact: true,
      },
      {
        to: '/runtime',
        label: 'Diagnostics',
        icon: Home,
        order: 1,
        visible: true,
      },
    ],
  },
]

describe('AppShell', () => {
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
    expect(screen.getByText('Sandbox')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'New Resource' }),
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
      screen.getByRole('searchbox', { name: 'Find' }),
      'diag',
    )
    expect(
      screen.getByRole('link', { name: 'Diagnostics' }),
    ).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Home' })).not.toBeInTheDocument()
  })
})
