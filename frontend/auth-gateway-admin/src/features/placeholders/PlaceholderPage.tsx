import { useRouterState } from '@tanstack/react-router'
import { findNavigationItem } from '@/boilerplate/navigation/navigation'
import { mainNavigation } from '@/navigation/registry'

export function PlaceholderPage() {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })
  const item = findNavigationItem(mainNavigation, pathname)

  return (
    <div className="page-heading">
      <h1>{item?.label ?? 'Page'}</h1>
    </div>
  )
}
