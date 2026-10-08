import { describe, expect, it } from 'vitest'
import { createQueryClient } from '@/boilerplate/query/create-query-client'

describe('createQueryClient', () => {
  it('configures default freshness and disables mutation retries', () => {
    const client = createQueryClient()
    const queryDefaults = client.getDefaultOptions().queries
    const mutationDefaults = client.getDefaultOptions().mutations
    expect(queryDefaults?.staleTime).toBe(30_000)
    expect(queryDefaults?.gcTime).toBe(300_000)
    expect(mutationDefaults?.retry).toBe(false)
  })
})
