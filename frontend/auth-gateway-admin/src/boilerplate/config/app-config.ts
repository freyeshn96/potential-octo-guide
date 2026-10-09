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

export interface AppShellSearch {
  placeholder: string
}

export interface AppShellEnvironment {
  label: string
}

export interface AppShellPrimaryAction {
  label: string
}

export interface AppConfig {
  identity: AppShellIdentity
  workspace: AppShellWorkspace
  user: AppShellUser
  search: AppShellSearch
  environment: AppShellEnvironment
  primaryAction: AppShellPrimaryAction
}

export interface AppNavigationItem {
  to?: string
  label: string
  icon: LucideIcon
  order: number
  visible: boolean
  exact?: boolean
  children?: readonly AppNavigationItem[]
}

export interface AppNavigationGroup {
  id: string
  label: string
  order: number
  items: readonly AppNavigationItem[]
}
