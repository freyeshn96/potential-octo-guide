import connectivityEs from '@/locales/es/connectivity.json'
import metaEs from '@/locales/es/meta.json'
import navigationEs from '@/locales/es/navigation.json'
import pagesEs from '@/locales/es/pages.json'
import { createI18n } from '@/boilerplate/i18n/create-i18n'

export const i18n = await createI18n({
  connectivity: connectivityEs,
  meta: metaEs,
  navigation: navigationEs,
  pages: pagesEs,
})
