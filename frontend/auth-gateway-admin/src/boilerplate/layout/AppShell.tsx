import type { ReactNode } from 'react'
import type {
  AppConfig,
  AppNavigationGroup,
} from '@/boilerplate/config/app-config'
import {
  SidebarInset,
  SidebarProvider,
} from '@/boilerplate/components/ui/sidebar'
import { AppSidebar } from '@/boilerplate/layout/Sidebar'
import { Topbar } from '@/boilerplate/layout/Topbar'

export interface AppShellProps {
  config: AppConfig
  navigation: readonly AppNavigationGroup[]
  children: ReactNode
}

export function AppShell({ config, navigation, children }: AppShellProps) {
  return (
    <SidebarProvider>
      <AppSidebar config={config} navigation={navigation} />
      <SidebarInset>
        <Topbar config={config} navigation={navigation} />
        <main id="main-content">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
