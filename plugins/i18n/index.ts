import { createI18n } from 'vue-i18n'
import en from './en'

// Ready translated locale messages
const messages = {
  en: en
}

const options = {
  locale: 'en', // set locale
  legacy: false,
  messages // set locale messages
}

const i18n = createI18n(options)

export default i18n

export const t = i18n.global.t;
