import { useState } from 'react'
import { Link, useRouterState } from '@tanstack/react-router'
import { Hexagon, Search } from 'lucide-react'
import type {
  AppConfig,
  AppNavigationGroup,
  AppNavigationItem,
} from '@/boilerplate/config/app-config'
import { Avatar, AvatarFallback } from '@/boilerplate/components/ui/avatar'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
} from '@/boilerplate/components/ui/sidebar'
import { filterNavigationGroups } from '@/boilerplate/navigation/navigation'

export interface AppSidebarProps {
  config: AppConfig
  navigation: readonly AppNavigationGroup[]
}

function SidebarNavLink({ item }: { item: AppNavigationItem }) {
  const { isMobile, setOpenMobile } = useSidebar()
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })
  const Icon = item.icon
  const isActive =
    item.exact === true ? pathname === item.to : pathname.startsWith(item.to)

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        isActive={isActive}
        tooltip={item.label}
        onClick={() => {
          if (isMobile) {
            setOpenMobile(false)
          }
        }}
      >
        <Link
          to={item.to}
          aria-label={item.label}
          activeOptions={item.exact ? { exact: true } : undefined}
        >
          <Icon />
          <span>{item.label}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}

export function AppSidebar({ config, navigation }: AppSidebarProps) {
  const { isMobile } = useSidebar()
  const [query, setQuery] = useState('')
  const visibleGroups = filterNavigationGroups(navigation, query)

  return (
    <Sidebar collapsible="icon" aria-label="Application navigation">
      <SidebarHeader>
        <div className="flex items-center justify-between gap-2 px-1">
          <Link to="/" className="flex min-w-0 items-center gap-2.5">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground">
              <Hexagon size={18} aria-hidden />
            </span>
            <span className="truncate text-sm font-semibold group-data-[collapsible=icon]:hidden">
              {config.identity.name}
            </span>
          </Link>
          {isMobile ? null : <SidebarTrigger />}
        </div>
      </SidebarHeader>
      <SidebarContent>
        <div className="px-2 group-data-[collapsible=icon]:hidden">
          <label className="relative flex items-center">
            <Search
              size={14}
              aria-hidden
              className="pointer-events-none absolute left-2.5 text-muted-foreground"
            />
            <SidebarInput
              type="search"
              value={query}
              placeholder={config.search.placeholder}
              aria-label={config.search.placeholder}
              className="pl-8"
              onChange={(event) => {
                setQuery(event.target.value)
              }}
            />
          </label>
        </div>
        {visibleGroups.map((group) => (
          <SidebarGroup key={group.id}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarNavLink key={item.to} item={item} />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarSeparator />
      <SidebarFooter>
        <div className="flex items-center gap-2.5 px-1 py-1">
          <Avatar>
            <AvatarFallback>{config.workspace.initials}</AvatarFallback>
          </Avatar>
          <span className="truncate text-sm font-medium group-data-[collapsible=icon]:hidden">
            {config.workspace.name}
          </span>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
