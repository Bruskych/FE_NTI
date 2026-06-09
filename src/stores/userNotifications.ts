import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { AxiosError } from 'axios'
import api from '@/core/api/axios'
import { useNotificationStore } from '@/stores/notifications'
import { useAuthStore } from '@/stores/auth'

// ---------------------------------------------------------
// Интерфейсы данных
// ---------------------------------------------------------

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

// ---------------------------------------------------------
// Стор уведомлений пользователя (Setup Store)
// ---------------------------------------------------------

export const useUserNotificationsStore = defineStore('userNotifications', () => {
    // Dependencies
    const toastStore = useNotificationStore()
    const authStore = useAuthStore()

    // State
    const notifications = ref<UserNotification[]>([])
    const loading = ref(false)

    // Getters
    const sortedNotifications = computed(() => {
        if (!Array.isArray(notifications.value)) return []
        return [...notifications.value].sort((a, b) => {
            // Сначала непрочитанные (read_at === null)
            if (a.read_at === null && b.read_at !== null) return -1
            if (a.read_at !== null && b.read_at === null) return 1

            const dateA = a.created_at ? new Date(a.created_at).getTime() : 0
            const dateB = b.created_at ? new Date(b.created_at).getTime() : 0
            return dateB - dateA
        })
    })

    const unreadCount = computed(() => {
        if (!Array.isArray(notifications.value)) return 0
        return notifications.value.filter(n => n.read_at === null).length
    })

    // Actions
    async function fetchNotifications(): Promise<void> {
        loading.value = true
        try {
            const response = await api.get('/notifications')
            const incoming = response.data?.data
            notifications.value = Array.isArray(incoming) ? incoming : []
        } catch (error) {
            console.error('Failed to fetch notifications:', error)
        } finally {
            loading.value = false
        }
    }

    async function markAsRead(notificationId: number): Promise<void> {
        try {
            await api.post(`/notifications/${notificationId}/read`)

            const notification = notifications.value.find(n => n.id === notificationId)
            if (notification) {
                notification.read_at = new Date().toISOString()
            }
        } catch (error) {
            console.error('Failed to mark notification as read:', error)
        }
    }

    async function acceptInvite(notificationId: number): Promise<void> {
        try {
            await api.post(`/notifications/${notificationId}/accept`)
            toastStore.add('notification.toast.accept_success', 'success')

            const notification = notifications.value.find(n => n.id === notificationId)
            if (notification) {
                notification.read_at = new Date().toISOString()
            }

            await authStore.fetchMe()
        } catch (error: unknown) {
            const err = error as AxiosError<{ message?: string }>
            const errorMessage = err.response?.data?.message || 'notification.toast.error'
            toastStore.add(errorMessage, 'error')
        }
    }

    async function declineInvite(notificationId: number): Promise<void> {
        try {
            await api.post(`/notifications/${notificationId}/reject`)
            toastStore.add('notification.toast.decline_success', 'success')

            const notification = notifications.value.find(n => n.id === notificationId)
            if (notification) {
                notification.read_at = new Date().toISOString()
            }
        } catch (error: unknown) {
            const err = error as AxiosError<{ message?: string }>
            const errorMessage = err.response?.data?.message || 'notification.toast.error'
            toastStore.add(errorMessage, 'error')
        }
    }

    function clearNotifications(): void {
        notifications.value = []
    }

    return {
        notifications,
        loading,
        sortedNotifications,
        unreadCount,
        fetchNotifications,
        markAsRead,
        acceptInvite,
        declineInvite,
        clearNotifications,
    }
})