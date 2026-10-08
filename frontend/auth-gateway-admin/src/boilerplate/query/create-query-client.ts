import { QueryClient } from '@tanstack/react-query'
import { HttpError } from '@/boilerplate/http/http-error'

const DEFAULT_GC_TIME_MS = 5 * 60 * 1000
const DEFAULT_STALE_TIME_MS = 30 * 1000
const MAX_QUERY_RETRIES = 2

function shouldRetryQuery(failureCount: number, error: Error): boolean {
  if (failureCount >= MAX_QUERY_RETRIES) {
    return false
  }
  if (error instanceof HttpError) {
    if (error.kind === 'canceled' || error.kind === 'timeout') {
      return false
    }
    if (error.kind === 'http' && error.status !== undefined) {
      if (error.status >= 400 && error.status < 500) {
        return false
      }
      if (error.status >= 500) {
        return true
      }
    }
    if (error.kind === 'network') {
      return true
    }
    return false
  }
  return failureCount < MAX_QUERY_RETRIES
}

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: DEFAULT_STALE_TIME_MS,
        gcTime: DEFAULT_GC_TIME_MS,
        retry: shouldRetryQuery,
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
      },
      mutations: {
        retry: false,
      },
    },
  })
}
