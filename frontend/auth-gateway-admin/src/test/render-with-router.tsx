import type { ReactElement } from 'react'
import { render } from '@testing-library/react'
import {
  createMemoryHistory,
  createRootRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router'

export async function renderWithRouter(
  ui: ReactElement,
  initialEntry: string = '/',
) {
  const rootRoute = createRootRoute({
    component: () => ui,
  })
  const router = createRouter({
    routeTree: rootRoute,
    history: createMemoryHistory({ initialEntries: [initialEntry] }),
  })
  await router.load()
  return render(<RouterProvider router={router} />)
}
