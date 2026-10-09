import {
  Activity,
  BarChart3,
  Clock3,
  FileText,
  Fingerprint,
  KeyRound,
  LayoutDashboard,
  Link2,
  Settings,
  ShieldCheck,
  Users,
} from 'lucide-react'
import type { AppNavigationGroup } from '@/boilerplate/config/app-config'

export const mainNavigation: readonly AppNavigationGroup[] = [
  {
    id: 'overview',
    label: 'Overview',
    order: 0,
    items: [
      {
        to: '/',
        label: 'Overview',
        icon: LayoutDashboard,
        order: 0,
        visible: true,
        exact: true,
      },
      {
        to: '/users',
        label: 'Users',
        icon: Users,
        order: 1,
        visible: true,
      },
      {
        to: '/sessions',
        label: 'Sessions',
        icon: Clock3,
        order: 2,
        visible: true,
      },
      {
        to: '/mfa-policies',
        label: 'MFA Policies',
        icon: ShieldCheck,
        order: 3,
        visible: true,
      },
    ],
  },
  {
    id: 'identity',
    label: 'Identity',
    order: 1,
    items: [
      {
        to: '/providers',
        label: 'Providers',
        icon: Fingerprint,
        order: 0,
        visible: true,
      },
      {
        to: '/sso',
        label: 'SSO Config',
        icon: Link2,
        order: 1,
        visible: true,
      },
      {
        to: '/api-keys',
        label: 'API Keys',
        icon: KeyRound,
        order: 2,
        visible: true,
      },
      {
        to: '/audit-logs',
        label: 'Audit Logs',
        icon: FileText,
        order: 3,
        visible: true,
      },
    ],
  },
  {
    id: 'system',
    label: 'System',
    order: 2,
    items: [
      {
        to: '/runtime',
        label: 'Runtime',
        icon: Activity,
        order: 0,
        visible: true,
      },
      {
        to: '/analytics',
        label: 'Analytics',
        icon: BarChart3,
        order: 1,
        visible: true,
      },
      {
        to: '/settings',
        label: 'Settings',
        icon: Settings,
        order: 2,
        visible: true,
      },
    ],
  },
]
