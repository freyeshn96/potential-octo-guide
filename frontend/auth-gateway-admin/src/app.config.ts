import type { AppConfig } from '@/boilerplate/config/app-config'

export const appConfig: AppConfig = {
  identity: {
    name: 'Auth Gateway',
    workspaceSubtitle: 'Admin workspace',
    version: '1.0.0',
  },
  navLabel: 'WORKSPACE',
  sidebarNote: {
    title: 'Foundation',
    body: 'A focused starting point for secure application integration.',
    versionLabel: 'DELIVERY 01',
  },
  topbar: {
    breadcrumbSegment: 'Admin',
    breadcrumbCurrent: 'Foundation',
    environmentBadge: 'Technical preview',
  },
  footer: {
    left: 'Independent by design.',
    right: 'Auth Gateway / Admin',
  },
}
