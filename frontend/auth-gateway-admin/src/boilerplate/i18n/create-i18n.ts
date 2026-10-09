import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import shellEs from '@/boilerplate/locales/es/shell.json'

export type AppLocaleResources = Record<string, Record<string, unknown>>

export async function createI18n(appResources: AppLocaleResources) {
  const instance = i18n.createInstance()
  await instance.use(initReactI18next).init({
    lng: 'es',
    fallbackLng: 'es',
    interpolation: {
      escapeValue: false,
    },
    resources: {
      es: {
        shell: shellEs,
        ...appResources,
      },
    },
  })
  return instance
}
