import { defineStore } from 'pinia'
import type { AxiosError } from 'axios'
import api from '@/core/api/axios'
import axios from 'axios'

// 1. Описываем интерфейс пользователя согласно ролям из ТЗ
export interface User {
  id: number;
  name: string;
  email: string;
  role: 'student' | 'leader' | 'company' | 'mentor' | 'evaluator' | 'admin' | 'super_admin';
  organization_id?: number | null; // Для сотрудников фирм
}

// 2. Описываем структуру состояния (State)
interface AuthState {
  token: string | null;
  user: User | null;
  loading: boolean;
  error: string | null;
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    token: localStorage.getItem('token'),
    user: null,
    loading: false,
    error: null,
  }),

  getters: {
    isAuthenticated: (state): boolean => !!state.token,

    // Полезное дополнение для NTI: проверка прав
    isAdmin: (state): boolean => state.user?.role === 'admin' || state.user?.role === 'super_admin',
    isCompany: (state): boolean => state.user?.role === 'company',
  },

  actions: {
    async login(email: string, password: string): Promise<void> {
      this.loading = true
      this.error = null

      try {
        const { data } = await api.post<{ token: string; user: User }>('/login', {
          email,
          password
        })

        this.token = data.token
        this.user = data.user

        localStorage.setItem('token', data.token)

      } catch (error: unknown) {
        const err = error as AxiosError<{ message: string }>
        this.error = err.response?.data?.message || 'Login failed'
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
        const { data } = await api.get<{ user: User }>('/auth/me')
        this.user = data.user
      } catch (error) {
        this.logout()
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