import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { AxiosError } from 'axios'
import api from '@/core/api/axios'

export interface NotificationPreferences {
  email_enabled: boolean
  system_enabled: boolean
  marketing_enabled: boolean
  deadline_alerts_enabled: boolean
}

export const useNotificationPreferencesStore = defineStore('notificationPreferences', () => {
  const prefs = ref<NotificationPreferences>({
    email_enabled: true,
    system_enabled: true,
    marketing_enabled: false,
    deadline_alerts_enabled: true,
  })
  const loading = ref(false)
  const saving = ref(false)
  const error = ref<string | null>(null)
  const saved = ref(false)

  async function fetchPreferences(): Promise<void> {
    loading.value = true
    error.value = null
    try {
      const res = await api.get('/settings/notifications')
      const data = res.data.data ?? res.data
      prefs.value = {
        email_enabled: data.email_enabled ?? true,
        system_enabled: data.system_enabled ?? true,
        marketing_enabled: data.marketing_enabled ?? false,
        deadline_alerts_enabled: data.deadline_alerts_enabled ?? true,
      }
    } catch (err: unknown) {
      const e = err as AxiosError<{ message?: string }>
      error.value = e.response?.data?.message ?? 'Failed to load notification preferences'
    } finally {
      loading.value = false
    }
  }

  async function updatePreferences(payload: Partial<NotificationPreferences>): Promise<void> {
    saving.value = true
    error.value = null
    try {
      const res = await api.patch('/settings/notifications', payload)
      const data = res.data.data ?? res.data
      prefs.value = {
        email_enabled: data.email_enabled ?? prefs.value.email_enabled,
        system_enabled: data.system_enabled ?? prefs.value.system_enabled,
        marketing_enabled: data.marketing_enabled ?? prefs.value.marketing_enabled,
        deadline_alerts_enabled: data.deadline_alerts_enabled ?? prefs.value.deadline_alerts_enabled,
      }
      saved.value = true
      setTimeout(() => { saved.value = false }, 3000)
    } catch (err: unknown) {
      const e = err as AxiosError<{ message?: string }>
      error.value = e.response?.data?.message ?? 'Failed to update preferences'
      throw new Error(e.response?.data?.message ?? 'Failed to update preferences', { cause: err })
    } finally {
      saving.value = false
    }
  }

  return { prefs, loading, saving, error, saved, fetchPreferences, updatePreferences }
})
