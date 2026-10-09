import type { ReactElement } from 'react'
import { render } from '@testing-library/react'
import {
  createMemoryHistory,
  createRootRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router'
import { I18nextProvider } from 'react-i18next'
import { i18n } from '@/i18n/init'

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
  return render(
    <I18nextProvider i18n={i18n}>
      <RouterProvider router={router} />
    </I18nextProvider>,
  )
}
