import { useId, useMemo, useState } from 'react'
import { Link, useRouterState } from '@tanstack/react-router'
import {
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Hexagon,
  Search,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
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
  itemLabel,
  onNavigate,
}: {
  item: AppNavigationItem
  nested?: boolean
  itemLabel: string
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
      aria-label={itemLabel}
      title={itemLabel}
      activeOptions={item.exact ? { exact: true } : undefined}
      activeProps={{ className: 'active' }}
      onClick={onNavigate}
    >
      {nested ? null : <Icon size={16} aria-hidden />}
      <span className="nav-item-label">{itemLabel}</span>
    </Link>
  )
}

function SidebarNavBranch({
  item,
  itemLabel,
  sidebarCollapsed,
  flyoutLabelKey,
  setFlyoutLabelKey,
  resolveItemLabel,
  onNavigate,
}: {
  item: AppNavigationItem
  itemLabel: string
  sidebarCollapsed: boolean
  flyoutLabelKey: string | null
  setFlyoutLabelKey: (labelKey: string | null) => void
  resolveItemLabel: (labelKey: string) => string
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
  const flyoutOpen = flyoutLabelKey === item.labelKey

  const toggleBranch = () => {
    if (sidebarCollapsed) {
      setFlyoutLabelKey(flyoutOpen ? null : item.labelKey)
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
        <span className="nav-item-label">{itemLabel}</span>
        <ChevronRight size={16} aria-hidden className="nav-branch-chevron" />
      </button>
      {sidebarCollapsed ? (
        flyoutOpen ? (
          <div className="nav-flyout" role="menu" aria-label={itemLabel}>
            {children.map((child) => (
              <SidebarNavLink
                key={child.labelKey}
                item={child}
                itemLabel={resolveItemLabel(child.labelKey)}
                onNavigate={() => {
                  setFlyoutLabelKey(null)
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
                key={child.labelKey}
                item={child}
                nested
                itemLabel={resolveItemLabel(child.labelKey)}
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
  resolveItemLabel,
  sidebarCollapsed,
  flyoutLabelKey,
  setFlyoutLabelKey,
  onNavigate,
}: {
  item: AppNavigationItem
  resolveItemLabel: (labelKey: string) => string
  sidebarCollapsed: boolean
  flyoutLabelKey: string | null
  setFlyoutLabelKey: (labelKey: string | null) => void
  onNavigate: () => void
}) {
  const itemLabel = resolveItemLabel(item.labelKey)
  if (item.children !== undefined && item.children.length > 0) {
    return (
      <SidebarNavBranch
        item={item}
        itemLabel={itemLabel}
        sidebarCollapsed={sidebarCollapsed}
        flyoutLabelKey={flyoutLabelKey}
        setFlyoutLabelKey={setFlyoutLabelKey}
        resolveItemLabel={resolveItemLabel}
        onNavigate={onNavigate}
      />
    )
  }
  return (
    <SidebarNavLink item={item} itemLabel={itemLabel} onNavigate={onNavigate} />
  )
}

export function Sidebar({ config, navigation }: SidebarProps) {
  const { t: tNav } = useTranslation('navigation')
  const { t: tShell } = useTranslation('shell')
  const { menuOpen, sidebarCollapsed, closeMenu, toggleSidebar } =
    useNavigation()
  const [query, setQuery] = useState('')
  const [flyoutLabelKey, setFlyoutLabelKey] = useState<string | null>(null)
  const resolveItemLabel = useMemo(
    () => (labelKey: string) => tNav(labelKey),
    [tNav],
  )
  const visibleGroups = filterNavigationGroups(
    navigation,
    query,
    resolveItemLabel,
  )
  const searchPlaceholder = tShell('sidebar.searchPlaceholder')

  const handleToggleSidebar = () => {
    setFlyoutLabelKey(null)
    toggleSidebar()
  }

  return (
    <aside
      className={cn(
        'sidebar',
        menuOpen && 'is-open',
        sidebarCollapsed && 'is-collapsed',
      )}
      aria-label={tShell('sidebar.ariaLabel')}
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
            sidebarCollapsed
              ? tShell('sidebar.expand')
              : tShell('sidebar.collapse')
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
          placeholder={searchPlaceholder}
          aria-label={searchPlaceholder}
          onChange={(event) => {
            setQuery(event.target.value)
          }}
        />
      </label>
      <nav aria-label={tShell('sidebar.mainNav')}>
        {visibleGroups.map((group) => (
          <section key={group.id} className="nav-group">
            <h2 className="nav-group-label">{tNav(group.labelKey)}</h2>
            {group.items.map((item) => (
              <SidebarNavItem
                key={item.labelKey}
                item={item}
                resolveItemLabel={resolveItemLabel}
                sidebarCollapsed={sidebarCollapsed}
                flyoutLabelKey={flyoutLabelKey}
                setFlyoutLabelKey={setFlyoutLabelKey}
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
