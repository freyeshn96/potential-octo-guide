import { useRouterState } from '@tanstack/react-router'
import { Bell, CircleHelp, Menu, Plus, X } from 'lucide-react'
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
  const { menuOpen, toggleMenu } = useNavigation()
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })
  const currentItem = findNavigationItem(navigation, pathname)

  return (
    <header className="topbar">
      <div className="topbar-leading">
        <Button
          size="icon"
          variant="ghost"
          className="menu-toggle"
          aria-label="Toggle navigation"
          aria-expanded={menuOpen}
          onClick={toggleMenu}
        >
          {menuOpen ? <X size={18} /> : <Menu size={18} />}
        </Button>
        <p className="topbar-page">
          {currentItem?.label ?? config.identity.name}
        </p>
      </div>
      <div className="topbar-actions">
        <button
          type="button"
          className="environment-chip"
          aria-label="Environment"
        >
          <span className="environment-dot" />
          {config.environment.label}
        </button>
        <button
          type="button"
          className="topbar-icon"
          aria-label="Notifications"
        >
          <Bell size={15} aria-hidden />
        </button>
        <button type="button" className="topbar-icon" aria-label="Help">
          <CircleHelp size={15} aria-hidden />
        </button>
        <button type="button" className="user-chip" aria-label="Account">
          <span className="user-avatar" aria-hidden>
            {config.user.initials}
          </span>
          <span>{config.user.name}</span>
        </button>
        <Button className="primary-action" type="button">
          <Plus size={14} aria-hidden />
          {config.primaryAction.label}
        </Button>
      </div>
    </header>
  )
}
