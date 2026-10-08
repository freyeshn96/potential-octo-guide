import { Activity, Layers3 } from 'lucide-react'
import type { AppNavigationItem } from '@/boilerplate/config/app-config'

export const mainNavigation: readonly AppNavigationItem[] = [
  {
    to: '/',
    label: 'Overview',
    icon: Layers3,
    order: 0,
    visible: true,
    exact: true,
  },
  {
    to: '/runtime',
    label: 'Runtime',
    icon: Activity,
    order: 1,
    visible: true,
  },
]
