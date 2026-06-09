/**
 * Конфигурация Axios для взаимодействия с Laravel API.
 * Возможные функции:
 * - Динамическая подстановка Bearer токена для авторизации.
 * - Автоматическая передача текущего языка системы для локализации ответов бэкенда.
 * - Глобальный перехватчик ответов: автоматически вызывает Toast-уведомление,
 * когда сервер возвращает свойство "message".
 */

import axios from 'axios'
import { useNotificationStore } from '@/stores/notifications'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
})

// (Перехватчик запросов)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    const lang = localStorage.getItem('lang') || 'en'

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    config.headers['Accept-Language'] = lang
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// (Перехватчик ответов)
api.interceptors.response.use(
  (response) => {

    const notifications = useNotificationStore()

    if (response.data?.message) {
      notifications.add(response.data.message, 'success')
    }
    return response
  },
  (error) => {
    const notifications = useNotificationStore()

    if (error.response?.status === 422) {
      return Promise.reject(error)
    }

    // Для всех остальных критических ошибок (401, 403, 404, 500) выводим глобальный тост
    const errorMessage = error.response?.data?.message || 'System error (Connection failed)'
    notifications.add(errorMessage, 'error')

    return Promise.reject(error)
  }
)

api.defaults.withCredentials = true;

export default api