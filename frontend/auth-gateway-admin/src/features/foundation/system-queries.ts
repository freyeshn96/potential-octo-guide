import { queryOptions, useQuery } from '@tanstack/react-query'
import { getSystemInformation } from '@/features/foundation/system-api'

export const systemKeys = {
  all: ['system'] as const,
  info: () => [...systemKeys.all, 'info'] as const,
}

export function systemInformationQueryOptions() {
  return queryOptions({
    queryKey: systemKeys.info(),
    queryFn: ({ signal }) => getSystemInformation(signal),
    retry: false,
    staleTime: 15_000,
    refetchInterval: 30_000,
  })
}

export function useSystemInformation() {
  return useQuery(systemInformationQueryOptions())
}
