import { createRootRoute } from '@tanstack/react-router'
import { NotFoundPage, RootLayout } from '@/layout/root-layout'

export const Route = createRootRoute({
  component: RootLayout,
  notFoundComponent: NotFoundPage,
})
