import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider, createMemoryHistory } from '@tanstack/react-router'
import { createQueryClient } from '@/boilerplate/query/create-query-client'
import { createAppRouter } from '@/router'

beforeEach(() => {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          service: 'AuthGateway.Admin',
          status: 'running',
          version: '1.0.0',
        }),
        { status: 200 },
      ),
    ),
  )
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('createAppRouter', () => {
  it('supports direct navigation to the overview route', async () => {
    const router = createAppRouter()
    const history = createMemoryHistory({
      initialEntries: ['/overview'],
    })
    router.update({ history })
    render(
      <QueryClientProvider client={createQueryClient()}>
        <RouterProvider router={router} />
      </QueryClientProvider>,
    )
    expect(
      await screen.findByRole('heading', { name: /A clear foundation/ }),
    ).toBeInTheDocument()
  })

  it('renders the not-found page for unknown routes', async () => {
    const router = createAppRouter()
    const history = createMemoryHistory({
      initialEntries: ['/missing'],
    })
    router.update({ history })
    render(
      <QueryClientProvider client={createQueryClient()}>
        <RouterProvider router={router} />
      </QueryClientProvider>,
    )
    expect(
      await screen.findByRole('heading', { name: 'Page not found' }),
    ).toBeInTheDocument()
  })
})
