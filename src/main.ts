import './assets/css/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { i18n } from './locales'

import App from './App.vue'
import router from './core/router'
import { useAuthStore } from "@/stores/auth"

const app = createApp(App)

// 1 pinia
const pinia = createPinia()
app.use(pinia)

// 2 router + i18n
app.use(router)
app.use(i18n)

// 3 Взять store
const auth = useAuthStore(pinia)

// 4 bootstrap auth один раз
if (auth.token) {
  auth.fetchMe()
}

app.mount('#app')