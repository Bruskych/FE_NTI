import { ref } from 'vue'
import { useAuthStore } from './auth'
import { defineStore } from 'pinia'
import api from '@/core/api/axios'
import axios from 'axios'

export const useUserStore = defineStore('user', () => {
  const authStore = useAuthStore()

  const loading = ref(false)
  const error = ref<string | null>(null)

  /**
   * Обновление имени пользователя в настройках
   */
  const updateProfileInfo = async (payload: { name: string }) => {
    loading.value = true
    error.value = null

    try {
      const { data } = await api.put('/settings/update-profile', payload)
      if (data.user) {
        authStore.user = data.user
        localStorage.setItem('cached_user', JSON.stringify(data.user))
      }
      return data
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        error.value = err.response?.data?.message || 'Error updating profile'
      } else {
        error.value = 'Error updating profile'
      }
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    error,
    updateProfileInfo
  }
})