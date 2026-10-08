export function normalizeViteBasePath(raw: string | undefined): string {
  const trimmed = (raw ?? '/').trim()
  if (/^https?:\/\//i.test(trimmed)) {
    throw new Error('VITE_APP_BASE_PATH must be a path prefix, not a URL.')
  }
  if (trimmed === '' || trimmed === '/') {
    return '/'
  }
  let path = trimmed.startsWith('/') ? trimmed : `/${trimmed}`
  path = path.replace(/\/+/g, '/')
  if (!path.endsWith('/')) {
    path = `${path}/`
  }
  return path
}

export function routerBasepathFromViteBase(baseUrl: string): string {
  if (baseUrl === '/' || baseUrl === '') {
    return '/'
  }
  const withoutTrailing = baseUrl.replace(/\/$/, '')
  return withoutTrailing === '' ? '/' : withoutTrailing
}
