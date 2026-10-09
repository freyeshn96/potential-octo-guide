import { useId, useState } from 'react'
import { Link, useRouterState } from '@tanstack/react-router'
import {
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Hexagon,
  Search,
} from 'lucide-react'
import type {
  AppConfig,
  AppNavigationGroup,
  AppNavigationItem,
} from '@/boilerplate/config/app-config'
import { Button } from '@/boilerplate/components/ui/button'
import { cn } from '@/boilerplate/lib/cn'
import {
  filterNavigationGroups,
  itemOrChildIsActive,
} from '@/boilerplate/navigation/navigation'
import { useNavigation } from '@/boilerplate/navigation/navigation-state'

export interface SidebarProps {
  config: AppConfig
  navigation: readonly AppNavigationGroup[]
}

function SidebarNavLink({
  item,
  nested = false,
  onNavigate,
}: {
  item: AppNavigationItem
  nested?: boolean
  onNavigate: () => void
}) {
  const to = item.to
  if (to === undefined) {
    return null
  }

  const Icon = item.icon

  return (
    <Link
      to={to}
      className={cn(nested && 'nav-sub-link')}
      aria-label={item.label}
      title={item.label}
      activeOptions={item.exact ? { exact: true } : undefined}
      activeProps={{ className: 'active' }}
      onClick={onNavigate}
    >
      {nested ? null : <Icon size={16} aria-hidden />}
      <span className="nav-item-label">{item.label}</span>
    </Link>
  )
}

function SidebarNavBranch({
  item,
  sidebarCollapsed,
  flyoutLabel,
  setFlyoutLabel,
  onNavigate,
}: {
  item: AppNavigationItem
  sidebarCollapsed: boolean
  flyoutLabel: string | null
  setFlyoutLabel: (label: string | null) => void
  onNavigate: () => void
}) {
  const panelId = useId()
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })
  const Icon = item.icon
  const children = item.children ?? []
  const childActive = itemOrChildIsActive(item, pathname)
  const [open, setOpen] = useState(false)
  const panelOpen = childActive || open
  const flyoutOpen = flyoutLabel === item.label

  const toggleBranch = () => {
    if (sidebarCollapsed) {
      setFlyoutLabel(flyoutOpen ? null : item.label)
      return
    }
    setOpen(!panelOpen)
  }

  return (
    <div
      className={cn(
        'nav-branch',
        panelOpen && 'is-open',
        childActive && 'is-active',
      )}
    >
      <button
        type="button"
        className={cn('nav-branch-trigger', childActive && 'is-active')}
        aria-expanded={sidebarCollapsed ? flyoutOpen : panelOpen}
        aria-controls={panelId}
        onClick={toggleBranch}
      >
        <Icon size={16} aria-hidden />
        <span className="nav-item-label">{item.label}</span>
        <ChevronRight size={16} aria-hidden className="nav-branch-chevron" />
      </button>
      {sidebarCollapsed ? (
        flyoutOpen ? (
          <div className="nav-flyout" role="menu" aria-label={item.label}>
            {children.map((child) => (
              <SidebarNavLink
                key={child.label}
                item={child}
                onNavigate={() => {
                  setFlyoutLabel(null)
                  onNavigate()
                }}
              />
            ))}
          </div>
        ) : null
      ) : (
        <div
          id={panelId}
          className="nav-sub-panel"
          data-open={panelOpen ? 'true' : 'false'}
        >
          <div className="nav-sub-inner">
            {children.map((child) => (
              <SidebarNavLink
                key={child.label}
                item={child}
                nested
                onNavigate={onNavigate}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function SidebarNavItem({
  item,
  sidebarCollapsed,
  flyoutLabel,
  setFlyoutLabel,
  onNavigate,
}: {
  item: AppNavigationItem
  sidebarCollapsed: boolean
  flyoutLabel: string | null
  setFlyoutLabel: (label: string | null) => void
  onNavigate: () => void
}) {
  if (item.children !== undefined && item.children.length > 0) {
    return (
      <SidebarNavBranch
        item={item}
        sidebarCollapsed={sidebarCollapsed}
        flyoutLabel={flyoutLabel}
        setFlyoutLabel={setFlyoutLabel}
        onNavigate={onNavigate}
      />
    )
  }
  return <SidebarNavLink item={item} onNavigate={onNavigate} />
}

export function Sidebar({ config, navigation }: SidebarProps) {
  const { menuOpen, sidebarCollapsed, closeMenu, toggleSidebar } =
    useNavigation()
  const [query, setQuery] = useState('')
  const [flyoutLabel, setFlyoutLabel] = useState<string | null>(null)
  const visibleGroups = filterNavigationGroups(navigation, query)

  const handleToggleSidebar = () => {
    setFlyoutLabel(null)
    toggleSidebar()
  }

  return (
    <aside
      className={cn(
        'sidebar',
        menuOpen && 'is-open',
        sidebarCollapsed && 'is-collapsed',
      )}
      aria-label="Application navigation"
    >
      <div className="sidebar-brand-row">
        <Link to="/" className="brand" onClick={closeMenu}>
          <span className="brand-icon">
            <Hexagon size={18} aria-hidden />
          </span>
          <span className="brand-name">{config.identity.name}</span>
        </Link>
        <Button
          size="icon"
          variant="ghost"
          className="sidebar-collapse"
          aria-label={
            sidebarCollapsed ? 'Expand navigation' : 'Collapse navigation'
          }
          aria-expanded={!sidebarCollapsed}
          onClick={handleToggleSidebar}
        >
          {sidebarCollapsed ? (
            <ChevronsRight size={16} aria-hidden />
          ) : (
            <ChevronsLeft size={16} aria-hidden />
          )}
        </Button>
      </div>
      <label className="sidebar-search">
        <Search size={14} aria-hidden />
        <input
          type="search"
          value={query}
          placeholder={config.search.placeholder}
          aria-label={config.search.placeholder}
          onChange={(event) => {
            setQuery(event.target.value)
          }}
        />
      </label>
      <nav aria-label="Main">
        {visibleGroups.map((group) => (
          <section key={group.id} className="nav-group">
            <h2 className="nav-group-label">{group.label}</h2>
            {group.items.map((item) => (
              <SidebarNavItem
                key={item.label}
                item={item}
                sidebarCollapsed={sidebarCollapsed}
                flyoutLabel={flyoutLabel}
                setFlyoutLabel={setFlyoutLabel}
                onNavigate={closeMenu}
              />
            ))}
          </section>
        ))}
      </nav>
      <div className="sidebar-workspace">
        <span className="workspace-avatar" aria-hidden>
          {config.workspace.initials}
        </span>
        <span className="workspace-meta">{config.workspace.name}</span>
      </div>
    </aside>
  )
}
