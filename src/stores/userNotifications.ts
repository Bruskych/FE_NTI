import { defineStore } from 'pinia'
import type { AxiosError } from 'axios'
import api from '@/core/api/axios'
import { useNotificationStore } from '@/stores/notifications'
import { useAuthStore } from '@/stores/auth'

export interface UserNotification {
  id: number
  user_id: number
  type: 'project_status' | 'milestone_reminder' | 'consultation_scheduled' | string
  channel: 'system' | 'email' | 'push' | string
  title: string
  message: string
  data_json?: {
    action_url?: string
    team_id?: number
    team_name?: string
    [key: string]: unknown
  }
  read_at: string | null
  created_at?: string
  updated_at?: string
}

interface UserNotificationsState {
  notifications: UserNotification[]
  loading: boolean
}

export const useUserNotificationsStore = defineStore('userNotifications', {
  state: (): UserNotificationsState => ({
    notifications: [],
    loading: false,
  }),

  getters: {
    sortedNotifications(state): UserNotification[] {
      if (!Array.isArray(state.notifications)) return []
      return [...state.notifications].sort((a, b) => {
        // Сначала непрочитанные (read_at === null)
        if (a.read_at === null && b.read_at !== null) return -1
        if (a.read_at !== null && b.read_at === null) return 1

        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0
        return dateB - dateA
      })
    },
    unreadCount(state): number {
      if (!Array.isArray(state.notifications)) return 0
      return state.notifications.filter(n => n.read_at === null).length
    }
  },

  actions: {
    /**
     * Загрузка списка уведомлений с бэкенда.
     * GET /api/notifications
     */
    async fetchNotifications(): Promise<void> {
      this.loading = true
      try {
        const response = await api.get('/notifications')
        const incoming = response.data?.data
        this.notifications = Array.isArray(incoming) ? incoming : []
      } catch (error) {
        console.error('Failed to fetch notifications:', error)
      } finally {
        this.loading = false
      }
    },

    /**
     * Пометка уведомления как прочитанного.
     * POST /api/notifications/{id}/read
     */
    async markAsRead(notificationId: number): Promise<void> {
      try {
        await api.post(`/notifications/${notificationId}/read`)

        const notification = this.notifications.find(n => n.id === notificationId)
        if (notification) {
          notification.read_at = new Date().toISOString()
        }
      } catch (error) {
        console.error('Failed to mark notification as read:', error)
      }
    },

    /**
     * Принятие инвайта/действия из уведомления.
     * POST /api/notifications/{id}/accept
     */
    async acceptInvite(notificationId: number): Promise<void> {
      const toastStore = useNotificationStore()
      const authStore = useAuthStore()
      try {
        await api.post(`/notifications/${notificationId}/accept`)
        toastStore.add('notification.toast.accept_success', 'success')

        const notification = this.notifications.find(n => n.id === notificationId)
        if (notification) {
          notification.read_at = new Date().toISOString()
        }

        await authStore.fetchMe()
      } catch (error: unknown) {
        const err = error as AxiosError<{ message?: string }>
        const errorMessage = err.response?.data?.message || 'notification.toast.error'
        toastStore.add(errorMessage, 'error')
      }
    },

    /**
     * Отклонение инвайта/действия из уведомления.
     * POST /api/notifications/{id}/reject
     */
    async declineInvite(notificationId: number): Promise<void> {
      const toastStore = useNotificationStore()
      try {
        await api.post(`/notifications/${notificationId}/reject`)
        toastStore.add('notification.toast.decline_success', 'success')

        const notification = this.notifications.find(n => n.id === notificationId)
        if (notification) {
          notification.read_at = new Date().toISOString()
        }
      } catch (error: unknown) {
        const err = error as AxiosError<{ message?: string }>
        const errorMessage = err.response?.data?.message || 'notification.toast.error'
        toastStore.add(errorMessage, 'error')
      }
    },

    /**
     * Локальное удаление или очистка при выходе из системы
     */
    clearNotifications() {
      this.notifications = []
    }
  }
})