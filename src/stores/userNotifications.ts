import { defineStore } from 'pinia'
import type { AxiosError } from 'axios'
import api from '@/core/api/axios'
import { useNotificationStore } from '@/stores/notifications'
import { useAuthStore } from '@/stores/auth'

// Интерфейс уведомления, полностью синхронизированный с твоей бэкенд-фабрикой
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
    unreadNotifications: (state): UserNotification[] => {
      const list: UserNotification[] = Array.isArray(state.notifications)
        ? state.notifications
        : Object.values(state.notifications || {})
      return list.filter((n: UserNotification) => n.read_at === null)
    },
    unreadCount(): number {
      return this.unreadNotifications.length
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
     * Принятие инвайта/действия из уведомления.
     * POST /api/notifications/{id}/accept
     */
    async acceptInvite(notificationId: number): Promise<void> {
      const toastStore = useNotificationStore()
      const authStore = useAuthStore()
      try {
        await api.post(`/notifications/${notificationId}/accept`)

        toastStore.add('notification.toast.accept_success', 'success')

        // Вместо удаления можно либо удалить, либо пометить прочитанным:
        this.notifications = this.notifications.filter(n => n.id !== notificationId)

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
        this.notifications = this.notifications.filter(n => n.id !== notificationId)
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