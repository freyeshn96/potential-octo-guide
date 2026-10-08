export interface RuntimeEnv {
  apiBaseUrl: string
  appBasePath: string
}

function validateApiBaseUrl(raw: string): string {
  if (raw !== '/' && !/^https?:\/\//.test(raw)) {
    throw new Error(
      'VITE_API_BASE_URL must be an HTTP(S) URL or / for same-origin access.',
    )
  }
  return raw.replace(/\/$/, '')
}

function readViteApiBaseUrl(): string {
  const configuredApiUrl: unknown = import.meta.env.VITE_API_BASE_URL
  if (typeof configuredApiUrl === 'string' && configuredApiUrl.length > 0) {
    return configuredApiUrl
  }
  return 'http://localhost:5081'
}

export function readRuntimeEnv(): RuntimeEnv {
  const apiRaw = readViteApiBaseUrl()
  const appBasePath: string = import.meta.env.BASE_URL
  return {
    apiBaseUrl: validateApiBaseUrl(apiRaw),
    appBasePath,
  }
}
