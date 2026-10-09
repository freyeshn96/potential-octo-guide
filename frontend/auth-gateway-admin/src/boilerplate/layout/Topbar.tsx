import { useRouterState } from '@tanstack/react-router'
import { Bell, CircleHelp, Plus } from 'lucide-react'
import type {
  AppConfig,
  AppNavigationGroup,
} from '@/boilerplate/config/app-config'
import { Avatar, AvatarFallback } from '@/boilerplate/components/ui/avatar'
import { Badge } from '@/boilerplate/components/ui/badge'
import { Button } from '@/boilerplate/components/ui/button'
import { SidebarTrigger, useSidebar } from '@/boilerplate/components/ui/sidebar'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/boilerplate/components/ui/tooltip'
import { findNavigationItem } from '@/boilerplate/navigation/navigation'

export interface TopbarProps {
  config: AppConfig
  navigation: readonly AppNavigationGroup[]
}

export function Topbar({ config, navigation }: TopbarProps) {
  const { isMobile } = useSidebar()
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })
  const currentItem = findNavigationItem(navigation, pathname)

  return (
    <header className="flex h-14 items-center justify-between gap-4 border-b border-border px-4 md:px-6">
      <div className="flex min-w-0 items-center gap-2.5">
        {isMobile ? <SidebarTrigger /> : null}
        <p className="topbar-page m-0 truncate text-[13px] text-muted-foreground">
          {currentItem?.label ?? config.identity.name}
        </p>
      </div>
      <div className="flex items-center gap-2.5">
        <Badge
          variant="outline"
          className="h-8 gap-2 px-2.5 max-[600px]:hidden"
        >
          <span className="size-1.5 rounded-full bg-emerald-500" />
          {config.environment.label}
        </Badge>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              size="icon"
              variant="outline"
              className="size-8 rounded-full"
              aria-label="Notifications"
            >
              <Bell size={15} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Notifications</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              size="icon"
              variant="outline"
              className="size-8 rounded-full"
              aria-label="Help"
            >
              <CircleHelp size={15} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Help</TooltipContent>
        </Tooltip>
        <Button
          type="button"
          variant="outline"
          className="h-8 rounded-full px-2.5 text-xs"
          aria-label="Account"
        >
          <Avatar className="size-5">
            <AvatarFallback className="text-[9px]">
              {config.user.initials}
            </AvatarFallback>
          </Avatar>
          <span className="max-[850px]:hidden">{config.user.name}</span>
        </Button>
        <Button type="button" className="h-8 px-3 text-xs">
          <Plus size={14} aria-hidden />
          {config.primaryAction.label}
        </Button>
      </div>
    </header>
  )
}
