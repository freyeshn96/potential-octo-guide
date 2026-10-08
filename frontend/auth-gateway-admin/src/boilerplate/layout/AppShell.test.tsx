import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithRouter } from '@/test/render-with-router'
import { Layers3 } from 'lucide-react'
import { AppShell } from '@/boilerplate/layout/AppShell'
import type { AppConfig } from '@/boilerplate/config/app-config'

const testConfig: AppConfig = {
  identity: {
    name: 'Sample Admin',
    workspaceSubtitle: 'Demo workspace',
    version: '9.9.9',
  },
  navLabel: 'MENU',
  sidebarNote: {
    title: 'Note',
    body: 'Generic boilerplate identity.',
    versionLabel: 'PREVIEW',
  },
  topbar: {
    breadcrumbSegment: 'Demo',
    breadcrumbCurrent: 'Home',
    environmentBadge: 'Sandbox',
  },
  footer: {
    left: 'Left footer',
    right: 'Right footer',
  },
}

describe('AppShell', () => {
  it('renders configurable identity without Auth Gateway-specific strings', async () => {
    await renderWithRouter(
      <AppShell
        config={testConfig}
        navigation={[
          {
            to: '/',
            label: 'Home',
            icon: Layers3,
            order: 0,
            visible: true,
            exact: true,
          },
        ]}
      >
        <p>Child content</p>
      </AppShell>,
    )
    expect(screen.getAllByText('Sample Admin').length).toBeGreaterThan(0)
    expect(screen.getByText('Demo workspace')).toBeInTheDocument()
    expect(screen.getByText('Sandbox')).toBeInTheDocument()
    expect(screen.getByText('Child content')).toBeInTheDocument()
    expect(screen.queryByText('Auth Gateway')).not.toBeInTheDocument()
  })
})
