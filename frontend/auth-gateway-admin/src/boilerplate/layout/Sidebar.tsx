import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { ChevronsLeft, ChevronsRight, Hexagon, Search } from 'lucide-react'
import type {
  AppConfig,
  AppNavigationGroup,
  AppNavigationItem,
} from '@/boilerplate/config/app-config'
import { Button } from '@/boilerplate/components/ui/button'
import { cn } from '@/boilerplate/lib/cn'
import { filterNavigationGroups } from '@/boilerplate/navigation/navigation'
import { useNavigation } from '@/boilerplate/navigation/navigation-state'

export interface SidebarProps {
  config: AppConfig
  navigation: readonly AppNavigationGroup[]
}

function SidebarNavLink({
  item,
  onNavigate,
}: {
  item: AppNavigationItem
  onNavigate: () => void
}) {
  const Icon = item.icon
  return (
    <Link
      to={item.to}
      aria-label={item.label}
      title={item.label}
      activeOptions={item.exact ? { exact: true } : undefined}
      activeProps={{ className: 'active' }}
      onClick={onNavigate}
    >
      <Icon size={16} aria-hidden />
      <span className="nav-item-label">{item.label}</span>
    </Link>
  )
}

export function Sidebar({ config, navigation }: SidebarProps) {
  const { menuOpen, sidebarCollapsed, closeMenu, toggleSidebar } =
    useNavigation()
  const [query, setQuery] = useState('')
  const visibleGroups = filterNavigationGroups(navigation, query)

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
          onClick={toggleSidebar}
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
              <SidebarNavLink
                key={item.to}
                item={item}
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
