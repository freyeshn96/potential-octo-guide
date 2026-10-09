import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import type { AppI18nConfig } from '@/boilerplate/config/app-config'
import { assertI18nConfig, supportedLocaleCodes } from '@/boilerplate/i18n/validate-i18n-config'

export type AppLocaleResources = Record<string, Record<string, unknown>>

export interface CreateI18nOptions {
  config: AppI18nConfig
  shellResourcesByLocale: Readonly<Record<string, Record<string, unknown>>>
  appResourcesByLocale: Readonly<Record<string, AppLocaleResources>>
}

function mergeLocaleResources(
  shellResourcesByLocale: Readonly<Record<string, Record<string, unknown>>>,
  appResourcesByLocale: Readonly<Record<string, AppLocaleResources>>,
  locale: string,
): AppLocaleResources {
  const shell = shellResourcesByLocale[locale] ?? {}
  const app = appResourcesByLocale[locale] ?? {}
  return {
    shell,
    ...app,
  }
}

export async function createI18n(options: CreateI18nOptions) {
  const registeredLocales = [
    ...new Set([
      ...Object.keys(options.shellResourcesByLocale),
      ...Object.keys(options.appResourcesByLocale),
    ]),
  ]
  assertI18nConfig(options.config, registeredLocales)

  const resources: Record<string, AppLocaleResources> = {}
  for (const locale of supportedLocaleCodes(options.config)) {
    resources[locale] = mergeLocaleResources(
      options.shellResourcesByLocale,
      options.appResourcesByLocale,
      locale,
    )
  }

  const instance = i18n.createInstance()
  await instance.use(initReactI18next).init({
    lng: options.config.defaultLocale,
    fallbackLng: options.config.defaultLocale,
    supportedLngs: [...supportedLocaleCodes(options.config)],
    interpolation: {
      escapeValue: false,
    },
    resources,
  })
  return instance
}
