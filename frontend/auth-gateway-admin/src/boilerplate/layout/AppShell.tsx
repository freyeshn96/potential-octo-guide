import type { ReactNode } from 'react'
import type {
  AppConfig,
  AppNavigationGroup,
} from '@/boilerplate/config/app-config'
import { Sidebar } from '@/boilerplate/layout/Sidebar'
import { Topbar } from '@/boilerplate/layout/Topbar'

export interface AppShellProps {
  config: AppConfig
  navigation: readonly AppNavigationGroup[]
  children: ReactNode
}

export function AppShell({ config, navigation, children }: AppShellProps) {
  return (
    <div className="app-shell">
      <Sidebar config={config} navigation={navigation} />
      <div className="workspace">
        <Topbar config={config} navigation={navigation} />
        <main id="main-content">{children}</main>
      </div>
    </div>
  )
}
