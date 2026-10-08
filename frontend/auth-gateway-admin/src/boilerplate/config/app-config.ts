import type { LucideIcon } from 'lucide-react'

export interface AppShellIdentity {
  name: string
  workspaceSubtitle: string
  version: string
}

export interface AppShellSidebarNote {
  title: string
  body: string
  versionLabel: string
}

export interface AppShellTopbar {
  breadcrumbSegment: string
  breadcrumbCurrent: string
  environmentBadge: string
}

export interface AppShellFooter {
  left: string
  right: string
}

export interface AppConfig {
  identity: AppShellIdentity
  navLabel: string
  sidebarNote: AppShellSidebarNote
  topbar: AppShellTopbar
  footer: AppShellFooter
}

export interface AppNavigationItem {
  to: string
  label: string
  icon: LucideIcon
  order: number
  visible: boolean
  exact?: boolean
}
