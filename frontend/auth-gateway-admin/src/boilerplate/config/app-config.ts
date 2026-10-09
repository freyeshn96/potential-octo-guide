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

/** BCP 47 locale code (for example `es`). */
export type AppLocaleCode = string

export interface AppLocaleDefinition {
  code: AppLocaleCode
  /** End-user label for a future language switcher. */
  label: string
}

export interface AppI18nConfig {
  defaultLocale: AppLocaleCode
  supportedLocales: readonly AppLocaleDefinition[]
}

export interface AppConfig {
  identity: AppShellIdentity
  workspace: AppShellWorkspace
  user: AppShellUser
  i18n: AppI18nConfig
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
