/**
 * Конфигурация Axios для связи с Laravel API.

 * передача Bearer токена для авторизации.
 * передача текущего языка на сайте бэкенду.
 * любой ответ от сервера, содержащий "message",
     автоматически отображается пользователю в виде всплывающего окна (Toast)
 */

import axios from 'axios'
import { useNotificationStore } from '@/stores/notifications'

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api',
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
})
// (Request) Срабатывает ПЕРЕД тем, как запрос уйдет на сервер
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
// (Response) Срабатывает ПОСЛЕ того, как сервер прислал ответ
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
    const errorMessage = error.response?.data?.message || 'Chyba systému (Chyba spojenia)'

    notifications.add(errorMessage, 'error')

    return Promise.reject(error)
  }
)

export default api