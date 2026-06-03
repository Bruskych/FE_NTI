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
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api',
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    },
})

// (Перехватчик запросов) Срабатывает динамически НЕПОСРЕДСТВЕННО ПЕРЕД отправкой запроса на сервер
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token')

        // Исправление: Всегда динамически получаем самый актуальный язык из localStorage для каждого запроса
        const lang = localStorage.getItem('lang') || 'en'

        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }

        // Добавляем код текущего активного языка в заголовки запроса
        config.headers['Accept-Language'] = lang

        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

// (Перехватчик ответов) Срабатывает сразу ЖЕ ПОСЛЕ того, как сервер прислал ответ
api.interceptors.response.use(
    (response) => {
        const notifications = useNotificationStore()

        // Если сервер прислал успешное сообщение, выводим его через хранилище уведомлений
        if (response.data?.message) {
            notifications.add(response.data.message, 'success')
        }
        return response
    },
    (error) => {
        const notifications = useNotificationStore()
        const errorMessage = error.response?.data?.message || 'System error (Connection failed)'

        // Выводим текст ошибки с сервера в Toast-уведомление
        notifications.add(errorMessage, 'error')

        return Promise.reject(error)
    }
)

export default api