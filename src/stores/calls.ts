import { defineStore } from 'pinia'
import type { AxiosError } from 'axios'
import api from '@/core/api/axios'

export interface Program {
  id: number
  name: string
  type: string
  description: string | null
  is_active: boolean
  is_grant: boolean
  is_practice: boolean
}

export interface Specialization {
  id: number
  name: string
  slug: string
  description: string | null
}

export interface Call {
  id: number
  title: string
  description: string | null
  deadline: string | null
  is_expired: boolean
  status: 'draft' | 'open' | 'closed'
  budget: number | null
  program: Program | null
  specializations: Specialization[]
  applications_count: number | null
  created_at: string
}

interface CallsState {
  calls: Call[]
  loading: boolean
  actionLoading: number | null
  error: string | null
}

export const useCallsStore = defineStore('calls', {
  state: (): CallsState => ({
    calls: [],
    loading: false,
    actionLoading: null,
    error: null,
  }),

  getters: {
    openCalls: (state) => state.calls.filter(c => c.status === 'open'),
    draftCalls: (state) => state.calls.filter(c => c.status === 'draft'),
    closedCalls: (state) => state.calls.filter(c => c.status === 'closed'),
  },

  actions: {
    async fetchCalls(): Promise<void> {
      this.loading = true
      this.error = null
      try {
        const { data } = await api.get('/calls')
        this.calls = data.data ?? data
      } catch (error: unknown) {
        const err = error as AxiosError<{ message?: string }>
        this.error = err.response?.data?.message || 'Failed to load calls'
      } finally {
        this.loading = false
      }
    },

    async openCall(callId: number): Promise<void> {
      this.actionLoading = callId
      try {
        const { data } = await api.post(`/calls/${callId}/open`)
        const updated = data.data ?? data
        const idx = this.calls.findIndex(c => c.id === callId)
        if (idx !== -1) this.calls[idx] = updated
      } catch (error: unknown) {
        const err = error as AxiosError<{ message?: string }>
        throw err.response?.data?.message || 'Failed to open call'
      } finally {
        this.actionLoading = null
      }
    },

    async closeCall(callId: number): Promise<void> {
      this.actionLoading = callId
      try {
        const { data } = await api.post(`/calls/${callId}/close`)
        const updated = data.data ?? data
        const idx = this.calls.findIndex(c => c.id === callId)
        if (idx !== -1) this.calls[idx] = updated
      } catch (error: unknown) {
        const err = error as AxiosError<{ message?: string }>
        throw err.response?.data?.message || 'Failed to close call'
      } finally {
        this.actionLoading = null
      }
    },

    async deleteCall(callId: number): Promise<void> {
      this.actionLoading = callId
      try {
        await api.delete(`/calls/${callId}`)
        this.calls = this.calls.filter(c => c.id !== callId)
      } catch (error: unknown) {
        const err = error as AxiosError<{ message?: string }>
        throw err.response?.data?.message || 'Failed to delete call'
      } finally {
        this.actionLoading = null
      }
    },

    async createCall(payload: object): Promise<Call> {
      const { data } = await api.post('/calls', payload)
      const created: Call = data.data ?? data
      this.calls.unshift(created)
      return created
    },

    async updateCall(callId: number, payload: object): Promise<void> {
      const { data } = await api.put(`/calls/${callId}`, payload)
      const updated: Call = data.data ?? data
      const idx = this.calls.findIndex(c => c.id === callId)
      if (idx !== -1) this.calls[idx] = updated
    },
  },
})
