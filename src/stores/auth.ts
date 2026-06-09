import { defineStore } from 'pinia'
import type { AxiosError } from 'axios'
import api from '@/core/api/axios'
// Импортируем стор уведомлений (тостов) для вывода красивых плашек успеха/ошибки
import { useNotificationStore } from '@/stores/notifications'

// Интерфейс для данных, поступающих из формы регистрации
export interface RegisterFormData {
    first_name: string
    last_name: string
    email: string
    password: string
    password_confirmation: string
    role: 'student' | 'company'
    company_name?: string
    company_tax_id?: string
    sector?: string
    website_link?: string
    description?: string
}

// Интерфейс ответа сервера при успешной регистрации
interface RegisterResponse {
    token: string
    user: User
    notifications?: Notification[]
}

// Структура уведомлений пользователя (соответствует тому, что возвращает TeamController@myNotifications)
interface Notification {
    id: number
    title: string
    message: string
    type: string // Например: 'team_invite', 'company_registration_rejected'
    read_at: string | null
    data?: {
        team_id?: number
        team_name?: string
        invited_by?: string
        organization_id?: number
    }
}

// Интерфейс пользователя согласно техническим требованиям проекта
export interface User {
    id: number
    name: string
    email: string
    roles: { name: string }[]
    organization_id?: number | null
    avatar_path?: string | null
    avatar_url?: string | null
    email_verified_at?: string | null
}

// Определение структуры состояния (State) хранилища
interface AuthState {
    token: string | null
    user: User | null
    notifications: Notification[]
    isInitialized: boolean
    loading: boolean
    error: string | null
}

// Структура ошибки при входе
type LoginErrorResponse = {
    message?: string
    errors?: {
        email?: string[]
        password?: string[]
    }
}

// Структура успешного ответа при входе
type LoginResponse = {
    token: string
    user: User
    notifications: Notification[]
}

const cachedUser = localStorage.getItem('cached_user')
export const useAuthStore = defineStore('auth', {
    state: (): AuthState => ({
        token: localStorage.getItem('token'),
        user: cachedUser ? JSON.parse(cachedUser) : null,
        isInitialized: false,
        notifications: [],
        loading: false,
        error: null,
    }),

    getters: {
        isAuthenticated: (state) => !!state.token,
        hasRole: (state) => {
            return (role: string) =>
                state.user?.roles?.some(r => r.name === role) ?? false
        },
        hasAnyRole: (state) => {
            return (roles: string[]) =>
                state.user?.roles?.some(r => roles.includes(r.name)) ?? false
        },
    },

    actions: {
        // Авторизация (Вход) - Исправлен путь на /auth/login
        async login(email: string, password: string): Promise<void> {
            this.loading = true
            this.error = null
            try {
                const { data } = await api.post<LoginResponse>('/auth/login', { email, password })
                this.token = data.token
                this.user = data.user
                localStorage.setItem('cached_user', JSON.stringify(data.user))
                this.notifications = data.notifications || []
                localStorage.setItem('token', data.token)
            } catch (error: unknown) {
                const err = error as AxiosError<LoginErrorResponse>
                this.error = err.response?.data?.errors?.email?.[0] || err.response?.data?.message || 'Login failed'
                throw error
            } finally {
                this.loading = false
            }
        },

        // Регистрация - Исправлен путь на /auth/register
        async register(userData: RegisterFormData): Promise<void> {
            this.loading = true
            this.error = null
            try {
                const payload: Record<string, string | undefined> = {
                    name:                  `${userData.first_name} ${userData.last_name}`.trim(),
                    email:                 userData.email,
                    password:              userData.password,
                    password_confirmation: userData.password_confirmation,
                    role:                  userData.role,
                }

                if (userData.role === 'company') {
                    payload.company_name   = userData.company_name
                    payload.company_tax_id = userData.company_tax_id
                    payload.sector         = userData.sector
                    payload.website_link   = userData.website_link
                    payload.description    = userData.description
                }

                const { data } = await api.post<RegisterResponse>('/auth/register', payload)
                this.token = data.token
                this.user = data.user
                localStorage.setItem('cached_user', JSON.stringify(data.user))
                this.notifications = data.notifications || []
                localStorage.setItem('token', data.token)
            } catch (error: unknown) {
                const err = error as AxiosError<{ message?: string }>
                this.error = err.response?.data?.message || 'Register failed'
                throw error
            } finally {
                this.loading = false
            }
        },

        // Сброс пароля - Исправлен путь на /auth/forgot-password
        async forgotPassword(email: string): Promise<void> {
            this.loading = true
            this.error = null
            try {
                await api.post('/auth/forgot-password', { email })
            } catch (error: unknown) {
                const err = error as AxiosError<{ errors?: Record<string, string[]>; message?: string }>
                if (err.response?.data) {
                    const responseData = err.response.data
                    if (responseData.errors) {
                        this.error = Object.values(responseData.errors).flat().join(', ')
                    } else if (responseData.message) {
                        this.error = `Server: ${responseData.message}`
                    } else {
                        this.error = `Server error (Status: ${err.response.status})`
                    }
                } else {
                    this.error = `Connection error: ${err.message || 'API is unreachable'}`
                }
                throw error
            } finally {
                this.loading = false
            }
        },

        // Получение профиля - Исправлен путь на /auth/me
        async fetchMe(): Promise<void> {
            if (!this.token) {
                this.isInitialized = true
                return
            }
            try {
                const { data } = await api.get('/auth/me')
                this.user = data.user
                localStorage.setItem('cached_user', JSON.stringify(data.user))
            } catch (error: unknown) {
                const err = error as AxiosError
                const status = err.response?.status
                if (status === 401) {
                    await this.logout()
                    return
                }
                console.warn('fetchMe failed but user stays logged in:', status)
            } finally {
                this.isInitialized = true
            }
        },

        async logout(): Promise<void> {
            try {
                await api.post('/auth/logout')
            } catch (error) {
                console.error('Logout failed:', error)
            } finally {
                this.token = null
                this.user = null
                this.notifications = [] // Очищаем уведомления при выходе
                localStorage.removeItem('token')
                localStorage.removeItem('cached_user')
                this.isInitialized = false
            }
        },

        async uploadAvatar(file: File): Promise<void> {
            this.loading = true
            this.error = null
            try {
                const formData = new FormData()
                formData.append('avatar', file)
                const { data } = await api.post('/settings/update-profile/avatar', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                })
                if (data.user) {
                    this.user = data.user
                    localStorage.setItem('cached_user', JSON.stringify(data.user))
                }
            } finally {
                this.loading = false
            }
        },

        async updateProfileInfo(payload: { name?: string; email?: string }): Promise<void> {
            this.loading = true
            this.error = null
            try {
                if (payload.name !== undefined) {
                    const { data } = await api.post('/settings/update-profile/name', { name: payload.name })
                    if (data.user) {
                        this.user = data.user
                        localStorage.setItem('cached_user', JSON.stringify(data.user))
                    }
                }
                if (payload.email !== undefined) {
                    const { data } = await api.post('/settings/update-profile/email', { email: payload.email })
                    if (data.user) {
                        this.user = data.user
                        localStorage.setItem('cached_user', JSON.stringify(data.user))
                    }
                }
            } finally {
                this.loading = false
            }
        },

        // =========================================================
        // ЭКШЕНЫ ДЛЯ РАБОТЫ С УВЕДОМЛЕНИЯМИ И ИНВАЙТАМИ (СИНХРОНИЗИРОВАНО С БЭКЕНДОМ)
        // =========================================================

        /**
         * 1. Загрузка списка уведомлений с бэкенда.
         * Вызывает эндпоинт GET /api/v1/notifications (TeamController@myNotifications)
         */
        async fetchNotifications(): Promise<void> {
            try {
                // Бэкенд возвращает ['data' => $notifications], поэтому забираем data.data
                const { data } = await api.get<{ data: Notification[] }>('/v1/notifications')
                this.notifications = data.data || []
            } catch (error) {
                console.error('Failed to fetch notifications:', error)
            }
        },

        /**
         * 2. Принятие инвайта в команду.
         * Вызывает эндпоинт POST /api/v1/teams/invite/{notification}/accept (TeamController@acceptInvite)
         */
        async acceptInvite(notificationId: number): Promise<void> {
            const toastStore = useNotificationStore()
            try {
                await api.post(`/v1/teams/invite/${notificationId}/accept`)
                // Передаем системный ключ i18n для вывода успешного тоста
                toastStore.add('notification.toast.accept_success', 'success')
                // Удаляем уведомление из списка, чтобы оно исчезло из выпадающего меню
                this.notifications = this.notifications.filter(n => n.id !== notificationId)
                // Перезапрашиваем профиль, так как у пользователя изменился список команд или ролей
                await this.fetchMe()
            } catch (error: unknown) {
                const err = error as AxiosError<{ message?: string }>
                const errorMessage = err.response?.data?.message || 'notification.toast.error'
                toastStore.add(errorMessage, 'error')
            }
        },

        /**
         * 3. Отклонение инвайта в команду.
         * Вызывает эндпоинт POST /api/v1/teams/invite/{notification}/decline (TeamController@declineInvite)
         */
        async declineInvite(notificationId: number): Promise<void> {
            const toastStore = useNotificationStore()
            try {
                await api.post(`/v1/teams/invite/${notificationId}/decline`)
                // Передаем системный ключ i18n для вывода тоста об отклонении
                toastStore.add('notification.toast.decline_success', 'success')
                // Удаляем уведомление из списка на фронтенде
                this.notifications = this.notifications.filter(n => n.id !== notificationId)
            } catch (error: unknown) {
                const err = error as AxiosError<{ message?: string }>
                const errorMessage = err.response?.data?.message || 'notification.toast.error'
                toastStore.add(errorMessage, 'error')
            }
        }
    },
})