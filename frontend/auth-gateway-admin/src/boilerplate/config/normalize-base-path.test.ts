import { describe, expect, it } from 'vitest'
import {
  normalizeViteBasePath,
  routerBasepathFromViteBase,
} from '@/boilerplate/config/normalize-base-path'

describe('normalizeViteBasePath', () => {
  it('normalizes root and prefixed paths', () => {
    expect(normalizeViteBasePath('/')).toBe('/')
    expect(normalizeViteBasePath('admin')).toBe('/admin/')
    expect(normalizeViteBasePath('/admin/')).toBe('/admin/')
    expect(normalizeViteBasePath('/corporate/auth/')).toBe('/corporate/auth/')
  })
  it('rejects full URLs', () => {
    expect(() => normalizeViteBasePath('https://example.com/admin/')).toThrow()
  })
})

describe('routerBasepathFromViteBase', () => {
  it('maps vite base URLs to router basepaths', () => {
    expect(routerBasepathFromViteBase('/')).toBe('/')
    expect(routerBasepathFromViteBase('/admin/')).toBe('/admin')
    expect(routerBasepathFromViteBase('/corporate/auth/')).toBe(
      '/corporate/auth',
    )
  })
})
