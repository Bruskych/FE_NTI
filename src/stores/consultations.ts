import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { AxiosError } from 'axios'
import api from '@/core/api/axios'

export interface ConsultationMentor {
  id: number
  name: string
  email: string
  avatar_url: string | null
}

export interface ConsultationMilestone {
  id: number
  title: string
  status: string
}

export interface Consultation {
  id: number
  mentorship_id: number
  scheduled_at: string | null
  completed_at: string | null
  is_completed: boolean
  is_upcoming: boolean
  notes: string | null
  recommendations: string | null
  mentor: ConsultationMentor | null
  milestone: ConsultationMilestone | null
}

export interface CreateConsultationPayload {
  mentorship_id: number
  milestone_id?: number | null
  scheduled_at: string
}

export interface UpdateConsultationPayload {
  scheduled_at?: string
  completed_at?: string | null
  notes?: string | null
  recommendations?: string | null
}

export const useConsultationsStore = defineStore('consultations', () => {
  const consultations = ref<Consultation[]>([])
  const loading = ref(false)
  const saving = ref(false)
  const error = ref<string | null>(null)

  async function fetchConsultations() {
    loading.value = true
    error.value = null
    try {
      const { data } = await api.get('/consultations')
      consultations.value = Array.isArray(data.data) ? data.data : data
    } catch (err: unknown) {
      const e = err as AxiosError<{ message?: string }>
      error.value = e.response?.data?.message ?? 'Failed to load consultations'
    } finally {
      loading.value = false
    }
  }

  async function createConsultation(payload: CreateConsultationPayload): Promise<Consultation> {
    saving.value = true
    try {
      const { data } = await api.post<{ data: Consultation } | Consultation>('/consultations', payload)
      const item = (data as { data: Consultation }).data ?? (data as Consultation)
      consultations.value.unshift(item)
      return item
    } finally {
      saving.value = false
    }
  }

  async function updateConsultation(id: number, payload: UpdateConsultationPayload): Promise<void> {
    saving.value = true
    try {
      const { data } = await api.put<{ data: Consultation } | Consultation>(`/consultations/${id}`, payload)
      const updated = (data as { data: Consultation }).data ?? (data as Consultation)
      const idx = consultations.value.findIndex(c => c.id === id)
      if (idx !== -1) consultations.value[idx] = updated
    } finally {
      saving.value = false
    }
  }

  async function deleteConsultation(id: number): Promise<void> {
    await api.delete(`/consultations/${id}`)
    consultations.value = consultations.value.filter(c => c.id !== id)
  }

  return {
    consultations, loading, saving, error,
    fetchConsultations, createConsultation, updateConsultation, deleteConsultation,
  }
})
