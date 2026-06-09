import { ref } from 'vue'
import { i18n } from '@/locales'
import { getCookie, setCookie } from '@/utils/cookies'
import api from '@/core/api/axios'

const currentLang = ref(getCookie('lang') || 'sk')

function syncToBackend(lang: 'en' | 'sk') {
  const token = localStorage.getItem('token')
  if (!token) return
  api.post('/set-theme', { lang }).catch(() => {/* fire-and-forget */})
}

export function useLanguage() {
  const setLanguage = (lang: 'en' | 'sk') => {
    i18n.global.locale.value = lang
    currentLang.value = lang
    setCookie('lang', lang)
    syncToBackend(lang)
  }

  return { currentLang, setLanguage }
}
