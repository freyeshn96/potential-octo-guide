import '@testing-library/jest-dom/vitest'
import { vi } from 'vitest'
import { i18n } from '@/i18n/init'

i18n.addResourceBundle(
  'es',
  'navigation',
  {
    groups: {
      testMain: 'Test Main',
    },
    items: {
      testHome: 'Home',
      testDiagnostics: 'Diagnostics',
      testIdentity: 'Identity',
      testCatalog: 'Catalog',
    },
  },
  true,
  true,
)

Object.defineProperty(window, 'scrollTo', { value: vi.fn(), writable: true })
