import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/core/api/axios'
import { AxiosError } from 'axios'

// ---------------------------------------------------------
// Интерфейсы данных
// ---------------------------------------------------------

export interface EvaluationCriteria {
    id: number
    name: string
    description: string | null
    weight: number
    order: number
}

export interface EvaluationTemplate {
    id: number
    name: string
    description: string | null
    criteria: EvaluationCriteria[]
}

export interface EvaluationScorePayload {
    criteria_id: number
    score: number
    comment?: string
}

export interface CreateEvaluationPayload {
    recommendation: 'approve' | 'reject' | 'revise'
    comment: string
    scores: EvaluationScorePayload[]
}

// ---------------------------------------------------------
// Стор оценок
// ---------------------------------------------------------

export const useEvaluationsStore = defineStore('evaluations', () => {
    // State
    const template = ref<EvaluationTemplate | null>(null)
    const loading = ref(false)
    const actionLoading = ref(false)
    const error = ref<string | null>(null)

    // Actions
    async function fetchTemplate(templateId: number): Promise<void> {
        loading.value = true
        error.value = null
        try {
            const { data } = await api.get(`/evaluation-templates/${templateId}`)
            template.value = data.data ?? data
        } catch (err: unknown) {
            const e = err as AxiosError<{ message?: string }>
            error.value = e.response?.data?.message ?? 'Failed to fetch template'
        } finally {
            loading.value = false
        }
    }

    async function submitEvaluation(applicationId: number, payload: CreateEvaluationPayload): Promise<void> {
        actionLoading.value = true
        error.value = null
        try {
            await api.post(`/applications/${applicationId}/evaluations`, payload)
        } catch (err: unknown) {
            const e = err as AxiosError<{ message?: string }>
            error.value = e.response?.data?.message ?? 'Failed to submit evaluation'
            throw e
        } finally {
            actionLoading.value = false
        }
    }

    return {
        template,
        loading,
        actionLoading,
        error,
        fetchTemplate,
        submitEvaluation,
    }
})