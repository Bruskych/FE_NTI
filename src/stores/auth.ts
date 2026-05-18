import { defineStore } from 'pinia'
import type { AxiosError } from 'axios'
import api from '@/core/api/axios'
import axios from 'axios'

// Описываем структуру уведомлений
interface Notification {
  id: number
  title: string
  message: string
  type: string
  read_at: string | null
}

// Описываем интерфейс пользователя согласно ролям из ТЗ
export interface User {
  id: number;
  name: string;
  email: string;
  roles: { name: string }[];
  organization_id?: number | null; // Для сотрудников фирм
  avatar?: string | null;
}

// Описываем структуру состояния (State)
interface AuthState {
  token: string | null;
  user: User | null;
  notifications: Notification[];
  loading: boolean;
  error: string | null;
}

// Описываем структуру ошибок
type LoginErrorResponse = {
  message?: string
  errors?: {
    email?: string[]
    password?: string[]
  }
}

// Описываем тип ответа для входа в аккаунт
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

    isAdmin: (state) =>
      state.user?.roles?.some(r => r.name === 'admin' || r.name === 'super_admin'),
    isCompany: (state) =>
      state.user?.roles?.some(r => r.name === 'company'),
  },

  actions: {
    async login(email: string, password: string): Promise<void> {
      this.loading = true
      this.error = null

      try {
        // Отправка запроса на сервер, и дальше данные уходят в src/core/api/axios.ts
        const { data } = await api.post<LoginResponse>('/login', {
          email,
          password
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

    async register(userData: Record<string, unknown>) {
      this.loading = true
      try {
        // Формируем payload для Laravel, если там ожидается единое поле name
        const payload = {
          name: `${userData.first_name} ${userData.last_name}`.trim(),
          email: userData.email,
          password: userData.password,
          password_confirmation: userData.password_confirmation,
          role: userData.role
        }
        const { data } = await api.post('/register', payload)
        this.token = data.token
        this.user = data.user
        localStorage.setItem('token', data.token)
      } catch (error) {
        this.error = 'Register failed'
      } finally {
        this.loading = false
      }
    },

    async fetchMe(): Promise<void> {
      if (!this.token) return
      try {
        const { data } = await api.get('/me')
        this.user = data.user
        this.notifications = data.notifications
      } catch (error) {
        this.logout()
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
  },
})