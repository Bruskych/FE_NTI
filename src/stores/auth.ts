import { defineStore } from 'pinia'
import type { AxiosError } from 'axios'
import api from '@/core/api/axios'

// Interface for data coming from the registration form
export interface RegisterFormData {
    first_name: string
    last_name: string
    email: string
    password: string
    password_confirmation: string
    role: 'student' | 'company'
    // Company optional fields
    company_name?: string
    company_tax_id?: string
    sector?: string
    website_link?: string
    description?: string
}

// Interface for server response upon registration
interface RegisterResponse {
    token: string
    user: User
    notifications?: Notification[]
}

// Notification structure definition
interface Notification {
    id: number
    title: string
    message: string
    type: string
    read_at: string | null
}

// User interface definition according to the requirements specifications
export interface User {
    id: number
    name: string
    email: string
    roles: { name: string }[]
    organization_id?: number | null
    avatar?: string | null
    email_verified_at?: string | null
}

// State structure definition
interface AuthState {
    token: string | null
    user: User | null
    notifications: Notification[]
    loading: boolean
    error: string | null
}

// Error response structure definition
type LoginErrorResponse = {
    message?: string
    errors?: {
        email?: string[]
        password?: string[]
    }
}

// Login response type definition
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
                const { data } = await api.post<LoginResponse>('/auth/login', {
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
                    // FIX: backend expects account_type instead of role
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

                const { data } = await api.post<RegisterResponse>('/auth/register', payload)

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

        async fetchMe(): Promise<void> {
            if (!this.token) return
            try {
                const { data } = await api.get('/auth/me')
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
                await api.post('/auth/logout')
            } catch (error) {
                console.error('Logout failed:', error)
            } finally {
                this.token = null
                this.user = null
                localStorage.removeItem('token')
            }
        },
    },
})