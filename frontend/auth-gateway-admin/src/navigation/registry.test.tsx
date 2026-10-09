import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithRouter } from '@/test/render-with-router'
import { AppShell } from '@/boilerplate/layout/AppShell'
import { appConfig } from '@/app.config'
import { mainNavigation } from '@/navigation/registry'

describe('mainNavigation registry', () => {
  it('renders grouped sidebar links from the navigation registry', async () => {
    await renderWithRouter(
      <AppShell config={appConfig} navigation={mainNavigation}>
        <div>Page</div>
      </AppShell>,
    )
    expect(screen.getByRole('link', { name: 'Overview' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Users' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Providers' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Runtime' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Settings' })).toBeInTheDocument()
    expect(screen.getByText('Identity')).toBeInTheDocument()
  })
})
