import { useI18n } from 'vue-i18n'
import { ref } from 'vue'

const currentLang = ref(localStorage.getItem('lang') || 'en')

export function useLanguage() {
  const { locale } = useI18n()
  const setLanguage = (lang: string) => {
    locale.value = lang as 'en' | 'sk'
    currentLang.value = lang
    localStorage.setItem('lang', lang)
  }
  return {
    currentLang,
    setLanguage
  }
}