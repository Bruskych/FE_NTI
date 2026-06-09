import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/core/api/axios'

export interface ApplicationCall {
  id: number
  title: string
  deadline: string | null
}

export interface ApplicationProgram {
  id: number
  name: string
  type: string
}

export interface ApplicationTeam {
  id: number
  name: string
}

export interface Application {
  id: number
  status: string
  is_program_a: boolean
  is_program_b: boolean
  can_be_edited: boolean
  can_be_submitted: boolean
  total_score: string | null
  decision_comment: string | null
  submitted_at: string | null
  approved_at: string | null
  rejected_at: string | null
  program: ApplicationProgram | null
  call: ApplicationCall | null
  team: ApplicationTeam | null
  created_at: string
}

export const useApplicationsStore = defineStore('applications', () => {
  const applications = ref<Application[]>([])
  const loading = ref(false)
  const actionLoading = ref<number | null>(null)

  async function fetchApplications() {
    loading.value = true
    try {
      const res = await api.get('/applications')
      const data = res.data.data ?? res.data
      applications.value = Array.isArray(data) ? data : (data.data ?? [])
    } finally {
      loading.value = false
    }
  }

  async function createApplication(payload: { program_id: number; call_id?: number; challenge_id?: number }) {
    const res = await api.post('/applications', payload)
    const app: Application = res.data.data ?? res.data
    applications.value.unshift(app)
    return app
  }

  async function submitApplication(id: number) {
    actionLoading.value = id
    try {
      await api.post(`/applications/${id}/submit`)
      const idx = applications.value.findIndex(a => a.id === id)
      if (idx !== -1) {
        applications.value[idx] = { ...applications.value[idx], status: 'submitted', can_be_submitted: false, can_be_edited: false }
      }
    } finally {
      actionLoading.value = null
    }
  }

  async function deleteApplication(id: number) {
    actionLoading.value = id
    try {
      await api.delete(`/applications/${id}`)
      applications.value = applications.value.filter(a => a.id !== id)
    } finally {
      actionLoading.value = null
    }
  }

  return {
    applications,
    loading,
    actionLoading,
    fetchApplications,
    createApplication,
    submitApplication,
    deleteApplication,
  }
})
