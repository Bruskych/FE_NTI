//import './assets/css/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
// Если ты пока не используешь i18n, можешь закомментировать строку ниже
// import { i18n } from './locales'

import App from './App.vue'
import router from './core/router' // Исправленный путь к твоему роутеру

const app = createApp(App)

// Подключаем все плагины по очереди
app.use(createPinia())
app.use(router)
// app.use(i18n)

// Монтируем ОДИН раз в самом конце
app.mount('#app')
