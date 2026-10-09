import { useEffect } from 'react'
import { Link, Outlet } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { AppShell } from '@/boilerplate/layout/AppShell'
import { appConfig } from '@/app.config'
import { mainNavigation } from '@/navigation/registry'

function useDocumentMeta() {
  const { t } = useTranslation('meta')
  useEffect(() => {
    document.title = t('title')
    document.documentElement.lang = 'es'
    const description = document.querySelector('meta[name="description"]')
    if (description !== null) {
      description.setAttribute('content', t('description'))
    }
  }, [t])
}

export function RootLayout() {
  useDocumentMeta()
  return (
    <AppShell config={appConfig} navigation={mainNavigation}>
      <Outlet />
    </AppShell>
  )
}

export function NotFoundPage() {
  const { t } = useTranslation('shell', { keyPrefix: 'notFound' })
  return (
    <div className="page-heading">
      <h1>{t('title')}</h1>
      <Link to="/">{t('backHome')}</Link>
    </div>
  )
}
