const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5081'

if (apiBaseUrl !== '/' && !/^https?:\/\//.test(apiBaseUrl)) {
  throw new Error(
    'VITE_API_BASE_URL must be an HTTP(S) URL or / for same-origin access.',
  )
}

export const config = {
  application: 'Admin',
  service: 'AuthGateway.Admin',
  apiBaseUrl: apiBaseUrl.replace(/\/$/, ''),
} as const
