import { createI18n } from 'vue-i18n'
import skHeader from './sk/header.json'
import enHeader from './en/header.json'

import skFooter from './sk/footer.json'
import enFooter from './en/footer.json'

const messages = {
    sk: {
        header: skHeader,
        footer: skFooter,
    },
    en: {
        header: enHeader,
        footer: enFooter,
    }
}

export const i18n = createI18n({
    legacy: false,
    locale: localStorage.getItem('lang') || 'sk', // Берем язык из памяти или ставим SK
    fallbackLocale: 'en', // Если перевода нет на SK, покажет EN
    messages
})