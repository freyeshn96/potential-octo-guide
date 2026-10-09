import { Home, LayoutDashboard } from 'lucide-react'
import type { AppNavigationGroup } from '@/boilerplate/config/app-config'

export const mainNavigation: readonly AppNavigationGroup[] = [
  {
    id: 'main',
    labelKey: 'groups.main',
    order: 0,
    items: [
      {
        to: '/',
        labelKey: 'items.inicio',
        icon: Home,
        order: 0,
        visible: true,
        exact: true,
      },
      {
        to: '/overview',
        labelKey: 'items.overview',
        icon: LayoutDashboard,
        order: 1,
        visible: true,
      },
    ],
  },
]
