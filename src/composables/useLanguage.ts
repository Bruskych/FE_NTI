import { ref } from 'vue'
import { i18n } from '@/locales'

const currentLang = ref(localStorage.getItem('lang') || 'sk')

export function useLanguage() {
    const setLanguage = (lang: 'en' | 'sk') => {
        i18n.global.locale.value = lang
        currentLang.value = lang
        localStorage.setItem('lang', lang)
    }

    return {
        currentLang,
        setLanguage
    }
}