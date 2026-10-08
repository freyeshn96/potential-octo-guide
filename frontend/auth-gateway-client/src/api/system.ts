import { config } from '@/config'

export interface SystemInformation {
  service: string
  status: string
  version: string
}

export class ApiError extends Error {
  constructor(public readonly status: number) {
    super('The service could not complete the request.')
    this.name = 'ApiError'
  }
}

export async function getSystemInformation(
  signal?: AbortSignal,
): Promise<SystemInformation> {
  const response = await fetch(`${config.apiBaseUrl}/api/v1/system/info`, {
    headers: { Accept: 'application/json' },
    signal,
  })
  if (!response.ok) throw new ApiError(response.status)
  const data: unknown = await response.json()
  if (
    typeof data !== 'object' ||
    data === null ||
    !('service' in data) ||
    typeof data.service !== 'string' ||
    !('status' in data) ||
    typeof data.status !== 'string' ||
    !('version' in data) ||
    typeof data.version !== 'string'
  ) {
    throw new Error(
      'The service returned an invalid system information response.',
    )
  }
  if (data.service !== config.service || data.status !== 'running') {
    throw new Error(
      'The configured endpoint is not the expected running service.',
    )
  }
  return { service: data.service, status: data.status, version: data.version }
}
