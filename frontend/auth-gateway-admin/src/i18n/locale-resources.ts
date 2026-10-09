import shellEs from '@/boilerplate/locales/es/shell.json'
import connectivityEs from '@/locales/es/connectivity.json'
import metaEs from '@/locales/es/meta.json'
import navigationEs from '@/locales/es/navigation.json'
import pagesEs from '@/locales/es/pages.json'
import type { AppLocaleResources } from '@/boilerplate/i18n/create-i18n'

const appResourcesEs: AppLocaleResources = {
  connectivity: connectivityEs,
  meta: metaEs,
  navigation: navigationEs,
  pages: pagesEs,
}

export const shellResourcesByLocale: Readonly<
  Record<string, Record<string, unknown>>
> = {
  es: shellEs,
}

export const appResourcesByLocale: Readonly<Record<string, AppLocaleResources>> =
  {
    es: appResourcesEs,
  }
