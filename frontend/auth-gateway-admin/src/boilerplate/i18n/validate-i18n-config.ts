import type { AppI18nConfig, AppLocaleCode } from '@/boilerplate/config/app-config'

export function supportedLocaleCodes(
  config: AppI18nConfig,
): readonly AppLocaleCode[] {
  return config.supportedLocales.map((locale) => locale.code)
}

export function assertI18nConfig(
  config: AppI18nConfig,
  registeredLocales: readonly AppLocaleCode[],
): void {
  if (config.supportedLocales.length === 0) {
    throw new Error('appConfig.i18n.supportedLocales must not be empty.')
  }
  const codes = new Set(supportedLocaleCodes(config))
  if (!codes.has(config.defaultLocale)) {
    throw new Error(
      `appConfig.i18n.defaultLocale "${config.defaultLocale}" must be listed in supportedLocales.`,
    )
  }
  for (const code of codes) {
    if (!registeredLocales.includes(code)) {
      throw new Error(
        `Missing i18n resource bundles for locale "${code}". Add locales under src/locales and boilerplate/locales.`,
      )
    }
  }
}
