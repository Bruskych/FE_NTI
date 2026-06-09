import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { AxiosError } from 'axios'
import api from '@/core/api/axios'

export interface MentorshipProject {
  id: number
  title: string
  status: string
}

export interface Consultation {
  id: number
  scheduled_at: string | null
  completed_at: string | null
  is_completed: boolean
  is_upcoming: boolean
  notes: string | null
  recommendations: string | null
}

export interface Mentorship {
  id: number
  status: 'pending' | 'active' | 'finished' | 'cancelled'
  is_active: boolean
  started_at: string | null
  finished_at: string | null
  project: MentorshipProject | null
  mentor: { id: number; name: string; email: string; avatar_url: string | null } | null
  consultations: Consultation[]
}

export const useMentorshipsStore = defineStore('mentorships', () => {
  const mentorships = ref<Mentorship[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchMentorships() {
    loading.value = true
    error.value = null
    try {
      const res = await api.get('/mentorships')
      mentorships.value = Array.isArray(res.data.data) ? res.data.data : res.data
    } catch (err: unknown) {
      const e = err as AxiosError<{ message?: string }>
      error.value = e.response?.data?.message ?? 'Failed to load mentorships'
    } finally {
      loading.value = false
    }
  }

  return { mentorships, loading, error, fetchMentorships }
})
