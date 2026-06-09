import { ref } from 'vue'
import { useAuthStore } from './auth'
import { defineStore } from 'pinia'
import api from '@/core/api/axios'

export interface StudentProfile {
  study_program: string
  year: number
  avg_grade: number | null
  skills_json: string[]
  has_carried_subjects: boolean
}

export const useUserStore = defineStore('user', () => {
  const authStore = useAuthStore()

  const loading = ref(false)
  const error = ref<string | null>(null)
  const studentProfile = ref<StudentProfile | null>(null)
  const studentProfileLoaded = ref(false)

  const updateProfileInfo = async (payload: { name?: string; email?: string }) => {
    loading.value = true
    error.value = null
    try {
      await authStore.updateProfileInfo(payload)
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } }
      error.value = e.response?.data?.message ?? 'Error updating profile'
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchStudentProfile = async () => {
    loading.value = true
    try {
      const { data } = await api.get('/settings/student-profile')
      studentProfile.value = data.data ?? null
      studentProfileLoaded.value = true
    } finally {
      loading.value = false
    }
  }

  const updateStudentProfile = async (payload: Partial<StudentProfile>) => {
    loading.value = true
    error.value = null
    try {
      const { data } = await api.put('/settings/student-profile', payload)
      studentProfile.value = data.data ?? (payload as StudentProfile)
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } }
      error.value = e.response?.data?.message ?? 'Error updating student profile'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    error,
    studentProfile,
    studentProfileLoaded,
    updateProfileInfo,
    fetchStudentProfile,
    updateStudentProfile,
  }
})
