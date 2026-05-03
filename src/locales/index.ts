import { createI18n } from 'vue-i18n'
import skAuth from './sk/auth.json'
import skCommon from './sk/common.json'
import enAuth from './en/auth.json'
import enCommon from './en/common.json'

const messages = {
    sk: {
        auth: skAuth,
        common: skCommon
    },
    en: {
        auth: enAuth,
        common: enCommon
    }
}

export const i18n = createI18n({
    legacy: false, // Обязательно для Composition API
    locale: localStorage.getItem('lang') || 'sk', // Берем язык из памяти или ставим SK
    fallbackLocale: 'en', // Если перевода нет на SK, покажет EN
    messages
})