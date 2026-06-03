import { ref } from 'vue'
import { i18n } from '@/locales' // Используем точный alias @ для импорта локалей

// Получаем сохраненный язык из localStorage или берем 'sk' по умолчанию
const currentLang = ref(localStorage.getItem('lang') || 'sk')

export function useLanguage() {
    const setLanguage = (lang: 'en' | 'sk') => {
        // Обновляем глобальный контекст vue-i18n для мгновенного переключения
        i18n.global.locale.value = lang
        currentLang.value = lang
        localStorage.setItem('lang', lang)
    }

    return {
        currentLang,
        setLanguage
    }
}