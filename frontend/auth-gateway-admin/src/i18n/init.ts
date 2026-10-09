import { appConfig } from '@/app.config'
import { createI18n } from '@/boilerplate/i18n/create-i18n'
import {
  appResourcesByLocale,
  shellResourcesByLocale,
} from '@/i18n/locale-resources'

export const i18n = await createI18n({
  config: appConfig.i18n,
  shellResourcesByLocale,
  appResourcesByLocale,
})
