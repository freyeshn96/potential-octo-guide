import { useRouterState } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { findNavigationItem } from '@/boilerplate/navigation/navigation'
import { mainNavigation } from '@/navigation/registry'

export function PlaceholderPage() {
  const { t } = useTranslation('navigation')
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })
  const item = findNavigationItem(mainNavigation, pathname)

  return (
    <div className="page-heading">
      <h1>{item === undefined ? pathname : t(item.labelKey)}</h1>
    </div>
  )
}
