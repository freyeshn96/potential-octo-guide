import { httpGet } from '@/boilerplate/http/http-client'
import { foundationServiceConfig } from '@/features/foundation/foundation-config'

export interface SystemInformation {
  service: string
  status: string
  version: string
}

export async function getSystemInformation(
  signal?: AbortSignal,
): Promise<SystemInformation> {
  const data = await httpGet<SystemInformation>('/api/v1/system/info', {
    signal,
  })
  if (
    data === undefined ||
    typeof data.service !== 'string' ||
    typeof data.status !== 'string' ||
    typeof data.version !== 'string'
  ) {
    throw new Error(
      'The service returned an invalid system information response.',
    )
  }
  if (
    data.service !== foundationServiceConfig.expectedService ||
    data.status !== 'running'
  ) {
    throw new Error(
      'The configured endpoint is not the expected running service.',
    )
  }
  return data
}
