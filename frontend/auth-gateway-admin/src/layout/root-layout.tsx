import { Link, Outlet } from '@tanstack/react-router'
import { AppShell } from '@/boilerplate/layout/AppShell'
import { appConfig } from '@/app.config'
import { mainNavigation } from '@/navigation/registry'

export function RootLayout() {
  return (
    <AppShell config={appConfig} navigation={mainNavigation}>
      <Outlet />
    </AppShell>
  )
}

export function NotFoundPage() {
  return (
    <div className="page-heading">
      <h1>Page not found</h1>
      <Link to="/">Back to overview</Link>
    </div>
  )
}
