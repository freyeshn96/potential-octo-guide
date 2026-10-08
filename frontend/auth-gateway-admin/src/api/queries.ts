import { useQuery } from '@tanstack/react-query'
import { getSystemInformation } from './system'

export function useSystemInformation() {
  return useQuery({
    queryKey: ['system', 'info'],
    queryFn: ({ signal }) => getSystemInformation(signal),
    retry: false,
    staleTime: 15_000,
    refetchInterval: 30_000,
  })
}
