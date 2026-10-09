import { useRouterState } from '@tanstack/react-router'
import { Bell, CircleHelp, Menu, Plus, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type {
  AppConfig,
  AppNavigationGroup,
} from '@/boilerplate/config/app-config'
import { Button } from '@/boilerplate/components/ui/button'
import { findNavigationItem } from '@/boilerplate/navigation/navigation'
import { useNavigation } from '@/boilerplate/navigation/navigation-state'

export interface TopbarProps {
  config: AppConfig
  navigation: readonly AppNavigationGroup[]
}

export function Topbar({ config, navigation }: TopbarProps) {
  const { t: tShell } = useTranslation('shell')
  const { t: tNav } = useTranslation('navigation')
  const { menuOpen, toggleMenu } = useNavigation()
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })
  const currentItem = findNavigationItem(navigation, pathname)
  const pageTitle =
    currentItem === undefined
      ? config.identity.name
      : tNav(currentItem.labelKey)

  return (
    <header className="topbar">
      <div className="topbar-leading">
        <Button
          size="icon"
          variant="ghost"
          className="menu-toggle"
          aria-label={tShell('topbar.toggleNavigation')}
          aria-expanded={menuOpen}
          onClick={toggleMenu}
        >
          {menuOpen ? <X size={18} /> : <Menu size={18} />}
        </Button>
        <p className="topbar-page">{pageTitle}</p>
      </div>
      <div className="topbar-actions">
        <button
          type="button"
          className="environment-chip"
          aria-label={tShell('topbar.environment')}
        >
          <span className="environment-dot" />
          {tShell('environment.production')}
        </button>
        <button
          type="button"
          className="topbar-icon"
          aria-label={tShell('topbar.notifications')}
        >
          <Bell size={15} aria-hidden />
        </button>
        <button
          type="button"
          className="topbar-icon"
          aria-label={tShell('topbar.help')}
        >
          <CircleHelp size={15} aria-hidden />
        </button>
        <button
          type="button"
          className="user-chip"
          aria-label={tShell('topbar.account')}
        >
          <span className="user-avatar" aria-hidden>
            {config.user.initials}
          </span>
          <span>{config.user.name}</span>
        </button>
        <Button className="primary-action" type="button">
          <Plus size={14} aria-hidden />
          {tShell('topbar.primaryAction')}
        </Button>
      </div>
    </header>
  )
}
