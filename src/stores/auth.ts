import { defineStore } from 'pinia'
import type { AxiosError } from 'axios'
import api from '@/core/api/axios'
import { useUserNotificationsStore, type UserNotification } from '@/stores/userNotifications'
import { setCookie } from '@/utils/cookies'
import { i18n } from '@/locales'

export interface RegisterFormData {
    first_name: string
    last_name: string
    email: string
    password: string
    password_confirmation: string
    role: 'student' | 'company' | 'mentor'
    company_name?: string
    company_tax_id?: string
    sector?: string
    website_link?: string
    description?: string
}

interface RegisterResponse {
    token: string
    user: User
    notifications?: UserNotification[]
}

export interface User {
    id: number
    name: string
    surname: string
    email: string
    roles: { name: string }[]
    organization_id?: number | null
    avatar_path?: string | null
    avatar_url?: string | null
    email_verified_at?: string | null
}

interface AuthState {
    token: string | null
    user: User | null
    isInitialized: boolean
    loading: boolean
    error: string | null
}

type LoginErrorResponse = {
    message?: string
    errors?: {
        email?: string[]
        password?: string[]
    }
}

type LoginResponse = {
    token: string
    user: User
    notifications?: UserNotification[]
}

const cachedUser = localStorage.getItem('cached_user')

export const useAuthStore = defineStore('auth', {
    state: (): AuthState => ({
        token: localStorage.getItem('token'),
        user: cachedUser ? JSON.parse(cachedUser) : null,
        isInitialized: false,
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
        async loadPreferences(): Promise<void> {
            try {
                const { data } = await api.get<{ theme?: string; lang?: string }>('/get-theme')
                if (data.theme && ['dark', 'light'].includes(data.theme)) {
                    setCookie('theme', data.theme)
                    document.documentElement.classList.toggle('dark', data.theme === 'dark')
                }
                if (data.lang && ['sk', 'en'].includes(data.lang)) {
                    setCookie('lang', data.lang)
                    i18n.global.locale.value = data.lang as 'sk' | 'en'
                }
            } catch {
                // не критично — лишаємо поточні значення з cookie
            }
        },

        async login(email: string, password: string): Promise<void> {
            this.loading = true
            this.error = null
            const userNotificationsStore = useUserNotificationsStore()
            try {
                const { data } = await api.post<LoginResponse>('/auth/login', { email, password })
                this.token = data.token
                this.user = data.user
                localStorage.setItem('cached_user', JSON.stringify(data.user))
                localStorage.setItem('token', data.token)

                userNotificationsStore.notifications = Array.isArray(data.notifications)
                  ? data.notifications
                  : []

                await userNotificationsStore.fetchNotifications()
                await this.loadPreferences()
            } catch (error: unknown) {
                const err = error as AxiosError<LoginErrorResponse>
                this.error = err.response?.data?.errors?.email?.[0] || err.response?.data?.message || 'Login failed'
                throw error
            } finally {
                this.loading = false
            }
        },

        async register(userData: RegisterFormData): Promise<void> {
            this.loading = true
            this.error = null
            const userNotificationsStore = useUserNotificationsStore()
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
                localStorage.setItem('token', data.token)

                userNotificationsStore.notifications = Array.isArray(data.notifications)
                  ? data.notifications
                  : []
            } catch (error: unknown) {
                const err = error as AxiosError<{ message?: string }>
                this.error = err.response?.data?.message || 'Register failed'
                throw error
            } finally {
                this.loading = false
            }
        },

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

        async fetchMe(): Promise<void> {
            if (!this.token) {
                this.isInitialized = true
                return
            }
            const userNotificationsStore = useUserNotificationsStore()
            try {
                const { data } = await api.get<{ user: User; notifications?: UserNotification[] }>('/auth/me')
                this.user = data.user
                localStorage.setItem('cached_user', JSON.stringify(data.user))

                if (data.notifications) {
                    userNotificationsStore.notifications = Array.isArray(data.notifications)
                      ? data.notifications
                      : []
                }
                await this.loadPreferences()
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
            const userNotificationsStore = useUserNotificationsStore()
            try {
                await api.post('/auth/logout')
            } catch (error) {
                console.error('Logout failed:', error)
            } finally {
                this.token = null
                this.user = null
                userNotificationsStore.clearNotifications()
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
                const { data } = await api.post<{ user: User }>('/settings/update-profile/avatar', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                })
                if (data.user) {
                    this.user = data.user
                    localStorage.setItem('cached_user', JSON.stringify(data.user))
                }
            } catch (error: unknown) {
                const err = error as AxiosError<{ message?: string }>
                this.error = err.response?.data?.message || 'Failed to upload avatar'
                throw error
            } finally {
                this.loading = false
            }
        },

        async updateProfileInfo(payload: { name?: string; email?: string }): Promise<void> {
            this.loading = true
            this.error = null
            try {
                if (payload.name !== undefined) {
                    const { data } = await api.post<{ user: User }>('/settings/update-profile/name', { name: payload.name })
                    if (data.user) {
                        this.user = data.user
                        localStorage.setItem('cached_user', JSON.stringify(data.user))
                    }
                }
                if (payload.email !== undefined) {
                    const { data } = await api.post<{ user: User }>('/settings/update-profile/email', { email: payload.email })
                    if (data.user) {
                        this.user = data.user
                        localStorage.setItem('cached_user', JSON.stringify(data.user))
                    }
                }
            } catch (error: unknown) {
                const err = error as AxiosError<{ message?: string }>
                this.error = err.response?.data?.message || 'Failed to update profile'
                throw error
            } finally {
                this.loading = false
            }
        },
    },
})
