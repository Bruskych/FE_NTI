import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/core/api/axios'
import type { AxiosError } from 'axios'

export interface Program {
    id: number
    name: string
    type: string
    description: string | null
    is_active: boolean
    is_grant: boolean
    is_practice: boolean
}

export interface FormField {
    id: number
    label: string
    type: string
}

export const useProgramsStore = defineStore('programs', () => {
    // State
    const programs = ref<Program[]>([])
    const currentProgram = ref<Program | null>(null)
    const formFields = ref<FormField[]>([])
    const loading = ref(false)
    const error = ref<string | null>(null)

    // Actions
    async function fetchPrograms(): Promise<void> {
        loading.value = true
        error.value = null
        try {
            const { data } = await api.get('/programs')
            programs.value = data.data ?? data
        } catch (err: unknown) {
            const e = err as AxiosError<{ message?: string }>
            error.value = e.response?.data?.message ?? 'Failed to fetch programs'
            throw e
        } finally {
            loading.value = false
        }
    }

    async function fetchProgram(id: number): Promise<void> {
        loading.value = true
        error.value = null
        try {
            const { data } = await api.get(`/programs/${id}`)
            currentProgram.value = data.data ?? data
        } catch (err: unknown) {
            const e = err as AxiosError<{ message?: string }>
            error.value = e.response?.data?.message ?? 'Failed to fetch program'
            throw e
        } finally {
            loading.value = false
        }
    }

    async function fetchFormFields(programId: number, callId?: number): Promise<void> {
        loading.value = true
        error.value = null
        try {
            const params = callId ? { call_id: callId } : {}
            const { data } = await api.get(`/programs/${programId}/form-fields`, { params })
            formFields.value = data.data ?? data
        } catch (err: unknown) {
            const e = err as AxiosError<{ message?: string }>
            error.value = e.response?.data?.message ?? 'Failed to fetch form fields'
            throw e
        } finally {
            loading.value = false
        }
    }

    return {
        programs,
        currentProgram,
        formFields,
        loading,
        error,
        fetchPrograms,
        fetchProgram,
        fetchFormFields,
    }
})