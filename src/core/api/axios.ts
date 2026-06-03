/**
 * Axios configuration for communication with the Laravel API.
 * * Features:
 * - Dynamic Bearer token injection for authorization.
 * - Dynamic system language injection for backend localization on every request.
 * - Global response interceptor: automatically triggers a Toast notification
 * whenever the server returns a "message" property.
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

// (Request Interceptor) Triggers dynamically RIGHT BEFORE the request is sent to the server
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token')

        // FIX: Always fetch the latest language from localStorage dynamically on every single request
        const lang = localStorage.getItem('lang') || 'en'

        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }

        // Inject the current active language code into the request headers
        config.headers['Accept-Language'] = lang

        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

// (Response Interceptor) Triggers immediately AFTER the server responds
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
        const errorMessage = error.response?.data?.message || 'System error (Connection failed)'

        notifications.add(errorMessage, 'error')

        return Promise.reject(error)
    }
)

export default api