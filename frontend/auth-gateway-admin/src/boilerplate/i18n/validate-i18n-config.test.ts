import { describe, expect, it } from 'vitest'
import { assertI18nConfig } from '@/boilerplate/i18n/validate-i18n-config'

describe('assertI18nConfig', () => {
  it('requires defaultLocale to be listed in supportedLocales', () => {
    expect(() =>
      assertI18nConfig(
        {
          defaultLocale: 'en',
          supportedLocales: [{ code: 'es', label: 'Español' }],
        },
        ['es'],
      ),
    ).toThrow(/defaultLocale/)
  })

  it('requires resource bundles for every supported locale', () => {
    expect(() =>
      assertI18nConfig(
        {
          defaultLocale: 'es',
          supportedLocales: [
            { code: 'es', label: 'Español' },
            { code: 'en', label: 'English' },
          ],
        },
        ['es'],
      ),
    ).toThrow(/Missing i18n resource bundles/)
  })
})
