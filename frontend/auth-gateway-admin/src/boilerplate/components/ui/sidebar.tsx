/* eslint-disable react-refresh/only-export-components -- SidebarProvider context hook is part of the primitive. */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ComponentProps,
  type CSSProperties,
} from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { PanelLeftIcon } from 'lucide-react'
import { Slot } from 'radix-ui'
import { Button } from '@/boilerplate/components/ui/button'
import { Input } from '@/boilerplate/components/ui/input'
import { Separator } from '@/boilerplate/components/ui/separator'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/boilerplate/components/ui/sheet'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/boilerplate/components/ui/tooltip'
import { useIsMobile } from '@/boilerplate/hooks/use-mobile'
import { cn } from '@/boilerplate/lib/cn'

const SIDEBAR_WIDTH = '15.5rem'
const SIDEBAR_WIDTH_MOBILE = '18rem'
const SIDEBAR_WIDTH_ICON = '3.5rem'
const SIDEBAR_KEYBOARD_SHORTCUT = 'b'

interface SidebarContextValue {
  state: 'expanded' | 'collapsed'
  open: boolean
  setOpen: (open: boolean | ((current: boolean) => boolean)) => void
  openMobile: boolean
  setOpenMobile: (open: boolean | ((current: boolean) => boolean)) => void
  isMobile: boolean
  toggleSidebar: () => void
}

const SidebarContext = createContext<SidebarContextValue | null>(null)

export function useSidebar(): SidebarContextValue {
  const context = useContext(SidebarContext)
  if (context === null) {
    throw new Error('useSidebar must be used within a SidebarProvider.')
  }
  return context
}

export function SidebarProvider({
  defaultOpen = true,
  open: openProp,
  onOpenChange,
  className,
  style,
  children,
  ...props
}: ComponentProps<'div'> & {
  defaultOpen?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
}) {
  const isMobile = useIsMobile()
  const [openMobile, setOpenMobile] = useState(false)
  const [internalOpen, setInternalOpen] = useState(defaultOpen)
  const open = openProp ?? internalOpen

  const setOpen = useCallback(
    (value: boolean | ((current: boolean) => boolean)) => {
      const next = typeof value === 'function' ? value(open) : value
      if (onOpenChange) {
        onOpenChange(next)
        return
      }
      setInternalOpen(next)
    },
    [onOpenChange, open],
  )

  const toggleSidebar = useCallback(() => {
    if (isMobile) {
      setOpenMobile((current) => !current)
      return
    }
    setOpen((current) => !current)
  }, [isMobile, setOpen])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.key === SIDEBAR_KEYBOARD_SHORTCUT &&
        (event.metaKey || event.ctrlKey)
      ) {
        event.preventDefault()
        toggleSidebar()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [toggleSidebar])

  const state: 'expanded' | 'collapsed' = open ? 'expanded' : 'collapsed'
  const contextValue = useMemo(
    () => ({
      state,
      open,
      setOpen,
      isMobile,
      openMobile,
      setOpenMobile,
      toggleSidebar,
    }),
    [state, open, setOpen, isMobile, openMobile, toggleSidebar],
  )

  return (
    <SidebarContext.Provider value={contextValue}>
      <TooltipProvider delayDuration={0}>
        <div
          data-slot="sidebar-wrapper"
          style={
            {
              '--sidebar-width': SIDEBAR_WIDTH,
              '--sidebar-width-icon': SIDEBAR_WIDTH_ICON,
              ...style,
            } as CSSProperties
          }
          className={cn(
            'group/sidebar-wrapper flex min-h-svh w-full',
            className,
          )}
          {...props}
        >
          {children}
        </div>
      </TooltipProvider>
    </SidebarContext.Provider>
  )
}

export function Sidebar({
  side = 'left',
  variant = 'sidebar',
  collapsible = 'offcanvas',
  className,
  children,
  ...props
}: ComponentProps<'div'> & {
  side?: 'left' | 'right'
  variant?: 'sidebar' | 'floating' | 'inset'
  collapsible?: 'offcanvas' | 'icon' | 'none'
}) {
  const { isMobile, state, openMobile, setOpenMobile } = useSidebar()

  if (collapsible === 'none') {
    return (
      <div
        data-slot="sidebar"
        className={cn(
          'flex h-full w-(--sidebar-width) flex-col bg-sidebar text-sidebar-foreground',
          className,
        )}
        {...props}
      >
        {children}
      </div>
    )
  }

  if (isMobile) {
    return (
      <Sheet open={openMobile} onOpenChange={setOpenMobile}>
        <SheetContent
          data-sidebar="sidebar"
          data-slot="sidebar"
          data-mobile="true"
          showCloseButton={false}
          side={side}
          className="w-(--sidebar-width) bg-sidebar p-0 text-sidebar-foreground [&>button]:hidden"
          style={
            {
              '--sidebar-width': SIDEBAR_WIDTH_MOBILE,
            } as CSSProperties
          }
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Sidebar</SheetTitle>
            <SheetDescription>Application navigation</SheetDescription>
          </SheetHeader>
          <div className="flex h-full w-full flex-col">{children}</div>
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <div
      className="group peer hidden text-sidebar-foreground md:block"
      data-state={state}
      data-collapsible={state === 'collapsed' ? collapsible : ''}
      data-variant={variant}
      data-side={side}
      data-slot="sidebar"
    >
      <div
        data-slot="sidebar-gap"
        className={cn(
          'relative w-(--sidebar-width) bg-transparent transition-[width] duration-200 ease-linear',
          'group-data-[collapsible=offcanvas]:w-0',
          'group-data-[collapsible=icon]:w-(--sidebar-width-icon)',
        )}
      />
      <div
        data-slot="sidebar-container"
        className={cn(
          'fixed inset-y-0 z-10 hidden h-svh w-(--sidebar-width) transition-[left,right,width] duration-200 ease-linear md:flex',
          side === 'left'
            ? 'left-0 group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)]'
            : 'right-0 group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1)]',
          'group-data-[collapsible=icon]:w-(--sidebar-width-icon) group-data-[side=left]:border-r group-data-[side=right]:border-l',
          className,
        )}
        {...props}
      >
        <div
          data-sidebar="sidebar"
          data-slot="sidebar-inner"
          className="flex h-full w-full flex-col bg-sidebar"
        >
          {children}
        </div>
      </div>
    </div>
  )
}

export function SidebarTrigger({
  className,
  onClick,
  ...props
}: ComponentProps<typeof Button>) {
  const { open, openMobile, isMobile, toggleSidebar } = useSidebar()
  const expanded = isMobile ? openMobile : open

  return (
    <Button
      data-sidebar="trigger"
      data-slot="sidebar-trigger"
      variant="ghost"
      size="icon"
      aria-label="Toggle navigation"
      aria-expanded={expanded}
      className={cn('size-7', className)}
      onClick={(event) => {
        onClick?.(event)
        toggleSidebar()
      }}
      {...props}
    >
      <PanelLeftIcon className="size-4" />
      <span className="sr-only">Toggle navigation</span>
    </Button>
  )
}

export function SidebarRail({ className, ...props }: ComponentProps<'button'>) {
  const { toggleSidebar } = useSidebar()
  return (
    <button
      type="button"
      data-sidebar="rail"
      data-slot="sidebar-rail"
      aria-label="Resize navigation"
      tabIndex={-1}
      title="Resize navigation"
      onClick={toggleSidebar}
      className={cn(
        'absolute inset-y-0 z-20 hidden w-4 -translate-x-1/2 transition-all ease-linear group-data-[side=left]:-right-4 sm:flex',
        'in-data-[side=left]:cursor-w-resize [[data-side=left][data-state=collapsed]_&]:cursor-e-resize',
        className,
      )}
      {...props}
    />
  )
}

export function SidebarInset({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="sidebar-inset"
      className={cn(
        'relative flex min-w-0 flex-1 flex-col bg-background',
        className,
      )}
      {...props}
    />
  )
}

export function SidebarInput({ className, ...props }: ComponentProps<'input'>) {
  return (
    <Input
      data-slot="sidebar-input"
      className={cn('h-8 bg-background', className)}
      {...props}
    />
  )
}

export function SidebarHeader({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="sidebar-header"
      data-sidebar="header"
      className={cn('flex flex-col gap-2 p-2', className)}
      {...props}
    />
  )
}

export function SidebarFooter({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="sidebar-footer"
      data-sidebar="footer"
      className={cn('flex flex-col gap-2 p-2', className)}
      {...props}
    />
  )
}

export function SidebarSeparator({
  className,
  ...props
}: ComponentProps<typeof Separator>) {
  return (
    <Separator
      data-slot="sidebar-separator"
      className={cn('mx-2 w-auto bg-sidebar-border', className)}
      {...props}
    />
  )
}

export function SidebarContent({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="sidebar-content"
      data-sidebar="content"
      className={cn(
        'flex min-h-0 flex-1 flex-col gap-2 overflow-auto group-data-[collapsible=icon]:overflow-hidden',
        className,
      )}
      {...props}
    />
  )
}

export function SidebarGroup({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="sidebar-group"
      data-sidebar="group"
      className={cn('relative flex w-full min-w-0 flex-col p-2', className)}
      {...props}
    />
  )
}

export function SidebarGroupLabel({
  className,
  ...props
}: ComponentProps<'div'>) {
  return (
    <div
      data-slot="sidebar-group-label"
      data-sidebar="group-label"
      className={cn(
        'flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium tracking-wider text-sidebar-foreground/70 uppercase',
        'group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0',
        className,
      )}
      {...props}
    />
  )
}

export function SidebarGroupContent({
  className,
  ...props
}: ComponentProps<'div'>) {
  return (
    <div
      data-slot="sidebar-group-content"
      className={cn('w-full text-sm', className)}
      {...props}
    />
  )
}

export function SidebarMenu({ className, ...props }: ComponentProps<'ul'>) {
  return (
    <ul
      data-slot="sidebar-menu"
      className={cn('flex w-full min-w-0 flex-col gap-1', className)}
      {...props}
    />
  )
}

export function SidebarMenuItem({ className, ...props }: ComponentProps<'li'>) {
  return (
    <li
      data-slot="sidebar-menu-item"
      className={cn('group/menu-item relative', className)}
      {...props}
    />
  )
}

const sidebarMenuButtonVariants = cva(
  'peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-hidden ring-sidebar-ring transition-[width,height,padding] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:p-2! [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0 data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground',
  {
    variants: {
      size: {
        default: 'h-8 text-sm',
        sm: 'h-7 text-xs',
        lg: 'h-12 text-sm',
      },
    },
    defaultVariants: { size: 'default' },
  },
)

export function SidebarMenuButton({
  asChild = false,
  isActive = false,
  size = 'default',
  tooltip,
  className,
  ...props
}: ComponentProps<'button'> & {
  asChild?: boolean
  isActive?: boolean
  tooltip?: string
} & VariantProps<typeof sidebarMenuButtonVariants>) {
  const Component = asChild ? Slot.Root : 'button'
  const { isMobile, state } = useSidebar()
  const button = (
    <Component
      data-slot="sidebar-menu-button"
      data-size={size}
      data-active={isActive}
      className={cn(sidebarMenuButtonVariants({ size }), className)}
      {...props}
    />
  )

  if (!tooltip) {
    return button
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent
        side="right"
        align="center"
        hidden={state !== 'collapsed' || isMobile}
      >
        {tooltip}
      </TooltipContent>
    </Tooltip>
  )
}
