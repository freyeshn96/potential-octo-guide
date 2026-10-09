import type { LucideIcon } from 'lucide-react'

export interface AppShellIdentity {
  name: string
  initials: string
}

export interface AppShellWorkspace {
  name: string
  initials: string
}

export interface AppShellUser {
  name: string
  initials: string
}

export interface AppConfig {
  identity: AppShellIdentity
  workspace: AppShellWorkspace
  user: AppShellUser
}

export interface AppNavigationItem {
  to?: string
  labelKey: string
  icon: LucideIcon
  order: number
  visible: boolean
  exact?: boolean
  children?: readonly AppNavigationItem[]
}

export interface AppNavigationGroup {
  id: string
  labelKey: string
  order: number
  items: readonly AppNavigationItem[]
}
