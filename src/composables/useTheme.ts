import { ref, onMounted } from 'vue'
import { getCookie, setCookie } from '@/utils/cookies'
import api from '@/core/api/axios'

const isDark = ref(false)

function applyTheme(dark: boolean) {
  isDark.value = dark
  document.documentElement.classList.toggle('dark', dark)
}

function syncToBackend(theme: 'dark' | 'light') {
  const token = localStorage.getItem('token')
  if (!token) return
  api.post('/set-theme', { theme }).catch(() => {/* fire-and-forget */})
}

export function useTheme() {
  const initTheme = () => {
    const saved = getCookie('theme')
    applyTheme(saved === 'dark')
  }

  const toggleTheme = () => {
    const next = !isDark.value
    applyTheme(next)
    const value = next ? 'dark' : 'light'
    setCookie('theme', value)
    syncToBackend(value)
  }

  const setTheme = (dark: boolean) => {
    applyTheme(dark)
    setCookie('theme', dark ? 'dark' : 'light')
  }

  onMounted(() => initTheme())

  return { isDark, toggleTheme, setTheme }
}
