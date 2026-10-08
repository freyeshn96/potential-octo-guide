import { Link } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import { ChevronRight, Menu, ShieldCheck, X } from 'lucide-react'
import type {
  AppConfig,
  AppNavigationItem,
} from '@/boilerplate/config/app-config'
import { Button } from '@/boilerplate/components/ui/button'
import { useNavigation } from '@/boilerplate/navigation/navigation-state'

export interface AppShellProps {
  config: AppConfig
  navigation: readonly AppNavigationItem[]
  children: ReactNode
}

export function AppShell({ config, navigation, children }: AppShellProps) {
  const { menuOpen, toggleMenu, closeMenu } = useNavigation()
  const visibleItems = [...navigation]
    .filter((item) => item.visible)
    .sort((left, right) => left.order - right.order)

  return (
    <div className="app-shell">
      <aside
        className={`sidebar ${menuOpen ? 'is-open' : ''}`}
        aria-label="Application navigation"
      >
        <Link to="/" className="brand" onClick={closeMenu}>
          <span className="brand-icon">
            <ShieldCheck size={25} aria-hidden />
          </span>
          <span>
            {config.identity.name}
            <small>{config.identity.workspaceSubtitle}</small>
          </span>
        </Link>
        <div className="nav-label">{config.navLabel}</div>
        <nav aria-label="Main">
          {visibleItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.to}
                to={item.to}
                activeOptions={item.exact ? { exact: true } : undefined}
                activeProps={{ className: 'active' }}
                onClick={closeMenu}
              >
                <Icon size={18} aria-hidden /> {item.label}
              </Link>
            )
          })}
        </nav>
        <div className="sidebar-note">
          <span className="note-dot" />
          <strong>{config.sidebarNote.title}</strong>
          <p>{config.sidebarNote.body}</p>
          <span className="note-version">
            {config.sidebarNote.versionLabel}
          </span>
        </div>
        <div className="sidebar-footer">
          {config.identity.name} <span>v{config.identity.version}</span>
        </div>
      </aside>
      <div className="workspace">
        <header className="topbar">
          <div className="breadcrumb">
            <Button
              size="icon"
              variant="ghost"
              className="menu-toggle"
              aria-label="Toggle navigation"
              aria-expanded={menuOpen}
              onClick={toggleMenu}
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </Button>
            <span>{config.topbar.breadcrumbSegment}</span>
            <ChevronRight size={14} aria-hidden />
            <strong>{config.topbar.breadcrumbCurrent}</strong>
          </div>
          <span className="environment-badge">
            <span />
            {config.topbar.environmentBadge}
          </span>
        </header>
        <main id="main-content">{children}</main>
        <footer className="workspace-footer">
          {config.footer.left}
          <span>{config.footer.right}</span>
        </footer>
      </div>
    </div>
  )
}
