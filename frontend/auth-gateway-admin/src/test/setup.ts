import '@testing-library/jest-dom/vitest'
import { vi } from 'vitest'

// JSDOM has no layout engine; routing calls the browser's scroll API.
Object.defineProperty(window, 'scrollTo', { value: vi.fn(), writable: true })

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }),
})
