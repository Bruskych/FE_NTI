import { defineStore } from 'pinia'
import type { AxiosError } from 'axios'
import api from '@/core/api/axios'

// Интерфейс для данных, поступающих из формы регистрации
export interface RegisterFormData {
    first_name: string
    last_name: string
    email: string
    password: string
    password_confirmation: string
    role: 'student' | 'company'
    // Необязательные поля для компании
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

// Структура уведомлений пользователя
interface Notification {
    id: number
    title: string
    message: string
    type: string
    read_at: string | null
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

export const useAuthStore = defineStore('auth', {
    state: (): AuthState => ({
        token: localStorage.getItem('token'),
        user: null,
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
        async login(email: string, password: string): Promise<void> {
            this.loading = true
            this.error = null

            try {
                const { data } = await api.post<LoginResponse>('/login', {
                    email,
                    password,
                })

                this.token = data.token
                this.user = data.user
                this.notifications = data.notifications
                localStorage.setItem('token', data.token)

            } catch (error: unknown) {
                const err = error as AxiosError<LoginErrorResponse>

                this.error =
                    err.response?.data?.errors?.email?.[0] ||
                    err.response?.data?.message ||
                    'Login failed'
                throw error

            } finally {
                this.loading = false
            }
        },

        async register(userData: RegisterFormData): Promise<void> {
            this.loading = true
            this.error = null

            try {
                const payload: Record<string, string | undefined> = {
                    name:                  `${userData.first_name} ${userData.last_name}`.trim(),
                    email:                 userData.email,
                    password:              userData.password,
                    password_confirmation: userData.password_confirmation,
                    account_type:          userData.role,
                    gdpr_consent:          '1',
                }

                if (userData.role === 'company') {
                    payload.company_name   = userData.company_name
                    payload.company_tax_id = userData.company_tax_id
                    payload.sector         = userData.sector
                    payload.website_link   = userData.website_link
                    payload.description    = userData.description
                }

                const { data } = await api.post<RegisterResponse>('/register', payload)

                this.token = data.token
                this.user = data.user
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

        async forgotPassword(email: string): Promise<void> {
            this.loading = true
            this.error = null

            try {
                await api.post('/forgot-password', { email })
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
            if (!this.token) return
            try {
                const { data } = await api.get('/me')
                this.user = data.user
            } catch (error: unknown) {
                const err = error as AxiosError
                const status = err.response?.status
                if (status === 401) {
                    await this.logout()
                    return
                }
                console.warn('fetchMe failed but user stays logged in:', status)
            }
        },

        async logout(): Promise<void> {
            try {
                await api.post('/logout')
            } catch (error) {
                console.error('Logout failed:', error)
            } finally {
                this.token = null
                this.user = null
                localStorage.removeItem('token')
            }
        },

        // Загрузка фото в профиль пользователя
        async uploadAvatar(file: File): Promise<void> {
            this.loading = true;
            this.error = null;

            try {
                const formData = new FormData();
                formData.append('photo', file);
                const { data } = await api.post('/auth/store', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
                if (data.user) {
                    this.user = data.user;
                }
            } catch (error: unknown) {
                console.error('Avatar upload failed:', error);
                throw error;
            } finally {
                this.loading = false;
            }
        }
    },
})