import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { AxiosError } from 'axios'
import api from '@/core/api/axios'

export interface ChallengeOrg {
  id: number
  name: string
}

export interface ChallengeProgram {
  id: number
  name: string
  type: string
}

export interface ChallengeSpec {
  id: number
  name: string
  slug: string
}

export interface Challenge {
  id: number
  title: string
  description: string | null
  technical_specification: string | null
  budget: number | null
  deadline: string | null
  status: 'draft' | 'published' | 'pairing' | 'assigned' | 'active' | 'closed'
  max_applications: number | null
  has_capacity: boolean
  backlog_order: number | null
  program: ChallengeProgram | null
  organization: ChallengeOrg | null
  product_owner: { id: number; name: string; email: string } | null
  specializations: ChallengeSpec[]
  applications_count: number | null
  created_at: string
}

export interface Program {
  id: number
  name: string
  type: string
  is_active: boolean
}

export interface Specialization {
  id: number
  name: string
  slug: string
}

export const useChallengesStore = defineStore('challenges', () => {
  const challenges = ref<Challenge[]>([])
  const programs = ref<Program[]>([])
  const specializations = ref<Specialization[]>([])
  const loading = ref(false)
  const actionLoading = ref<number | null>(null)
  const error = ref<string | null>(null)

  async function fetchChallenges() {
    loading.value = true
    error.value = null
    try {
      const res = await api.get('/challenges')
      challenges.value = Array.isArray(res.data.data) ? res.data.data : res.data
    } catch (err: unknown) {
      const e = err as AxiosError<{ message?: string }>
      error.value = e.response?.data?.message ?? 'Failed to load challenges'
    } finally {
      loading.value = false
    }
  }

  async function fetchPrograms() {
    const res = await api.get('/programs')
    programs.value = Array.isArray(res.data.data) ? res.data.data : res.data
  }

  async function fetchSpecializations() {
    const res = await api.get('/specializations')
    specializations.value = Array.isArray(res.data.data) ? res.data.data : res.data
  }

  async function createChallenge(payload: object): Promise<Challenge> {
    const res = await api.post('/challenges', payload)
    const created: Challenge = res.data.data ?? res.data
    challenges.value.unshift(created)
    return created
  }

  async function updateChallenge(id: number, payload: object): Promise<void> {
    actionLoading.value = id
    try {
      const res = await api.put(`/challenges/${id}`, payload)
      const updated: Challenge = res.data.data ?? res.data
      const idx = challenges.value.findIndex(c => c.id === id)
      if (idx !== -1) challenges.value[idx] = updated
    } finally {
      actionLoading.value = null
    }
  }

  async function deleteChallenge(id: number): Promise<void> {
    actionLoading.value = id
    try {
      await api.delete(`/challenges/${id}`)
      challenges.value = challenges.value.filter(c => c.id !== id)
    } finally {
      actionLoading.value = null
    }
  }

  return {
    challenges,
    programs,
    specializations,
    loading,
    actionLoading,
    error,
    fetchChallenges,
    fetchPrograms,
    fetchSpecializations,
    createChallenge,
    updateChallenge,
    deleteChallenge,
  }
})
