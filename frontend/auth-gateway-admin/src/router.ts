import { createRouter } from '@tanstack/react-router'
import { routerBasepathFromViteBase } from '@/boilerplate/config/normalize-base-path'
import { routeTree } from '@/routeTree.gen'

export function createAppRouter() {
  const basepath = routerBasepathFromViteBase(import.meta.env.BASE_URL)
  return createRouter({
    routeTree,
    defaultPreload: 'intent',
    basepath: basepath === '/' ? undefined : basepath,
  })
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof createAppRouter>
  }
}
