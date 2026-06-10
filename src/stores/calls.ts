import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { AxiosError } from 'axios'
import api from '@/core/api/axios'

// ---------------------------------------------------------
// Интерфейсы данных
// ---------------------------------------------------------

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

// ---------------------------------------------------------
// Стор конкурсов (Setup Store)
// ---------------------------------------------------------

export const useCallsStore = defineStore('calls', () => {
    // State
    const calls = ref<Call[]>([])
    const loading = ref(false)
    const actionLoading = ref<number | null>(null)
    const error = ref<string | null>(null)

    // Getters
    const openCalls = computed(() => calls.value.filter(c => c.status === 'open'))
    const draftCalls = computed(() => calls.value.filter(c => c.status === 'draft'))
    const closedCalls = computed(() => calls.value.filter(c => c.status === 'closed'))

    // Actions
    async function fetchCalls(): Promise<void> {
        loading.value = true
        error.value = null
        try {
            const { data } = await api.get('/calls')
            calls.value = data.data ?? data
        } catch (err: unknown) {
            const e = err as AxiosError<{ message?: string }>
            error.value = e.response?.data?.message || 'Failed to load calls'
        } finally {
            loading.value = false
        }
    }

    // Публичный список открытых отборов с дедлайнами — доступен без авторизации (главная страница)
    async function fetchOpenCalls(): Promise<void> {
        loading.value = true
        error.value = null
        try {
            const { data } = await api.get('/calls/open')
            calls.value = data.data ?? data
        } catch (err: unknown) {
            const e = err as AxiosError<{ message?: string }>
            error.value = e.response?.data?.message || 'Failed to load open calls'
        } finally {
            loading.value = false
        }
    }

    async function openCall(callId: number): Promise<void> {
        actionLoading.value = callId
        try {
            const { data } = await api.post(`/calls/${callId}/open`)
            const updated = data.data ?? data
            const idx = calls.value.findIndex(c => c.id === callId)
            if (idx !== -1) calls.value[idx] = updated
        } catch (err: unknown) {
            const e = err as AxiosError<{ message?: string }>
            throw e.response?.data?.message || 'Failed to open call'
        } finally {
            actionLoading.value = null
        }
    }

    async function closeCall(callId: number): Promise<void> {
        actionLoading.value = callId
        try {
            const { data } = await api.post(`/calls/${callId}/close`)
            const updated = data.data ?? data
            const idx = calls.value.findIndex(c => c.id === callId)
            if (idx !== -1) calls.value[idx] = updated
        } catch (err: unknown) {
            const e = err as AxiosError<{ message?: string }>
            throw e.response?.data?.message || 'Failed to close call'
        } finally {
            actionLoading.value = null
        }
    }

    async function deleteCall(callId: number): Promise<void> {
        actionLoading.value = callId
        try {
            await api.delete(`/calls/${callId}`)
            calls.value = calls.value.filter(c => c.id !== callId)
        } catch (err: unknown) {
            const e = err as AxiosError<{ message?: string }>
            throw e.response?.data?.message || 'Failed to delete call'
        } finally {
            actionLoading.value = null
        }
    }

    async function createCall(payload: object): Promise<Call> {
        const { data } = await api.post('/calls', payload)
        const created: Call = data.data ?? data
        calls.value.unshift(created)
        return created
    }

    async function updateCall(callId: number, payload: object): Promise<void> {
        const { data } = await api.put(`/calls/${callId}`, payload)
        const updated: Call = data.data ?? data
        const idx = calls.value.findIndex(c => c.id === callId)
        if (idx !== -1) calls.value[idx] = updated
    }

    return {
        calls,
        loading,
        actionLoading,
        error,
        openCalls,
        draftCalls,
        closedCalls,
        fetchCalls,
        fetchOpenCalls,
        openCall,
        closeCall,
        deleteCall,
        createCall,
        updateCall,
    }
})