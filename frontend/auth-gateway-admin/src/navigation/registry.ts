import { Home, LayoutDashboard } from 'lucide-react'
import type { AppNavigationGroup } from '@/boilerplate/config/app-config'

export const mainNavigation: readonly AppNavigationGroup[] = [
  {
    id: 'main',
    label: 'Main',
    order: 0,
    items: [
      {
        to: '/',
        label: 'Inicio',
        icon: Home,
        order: 0,
        visible: true,
        exact: true,
      },
      {
        to: '/overview',
        label: 'Overview',
        icon: LayoutDashboard,
        order: 1,
        visible: true,
      },
    ],
  },
]
