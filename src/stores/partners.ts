import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { AxiosError } from 'axios'
import api from '@/core/api/axios'

// ---------------------------------------------------------
// Интерфейсы данных
// ---------------------------------------------------------

export interface Organization {
    id: number
    name: string
}

export interface Partner {
    id: number
    logo_url: string | null
    website_link: string
    is_featured: boolean
    organization?: Organization
}

// ---------------------------------------------------------
// Стор партнёров
// ---------------------------------------------------------

export const usePartnersStore = defineStore('partners', () => {
    // State
    const partners = ref<Partner[]>([])
    const currentPartner = ref<Partner | null>(null)
    const loading = ref(false)
    const error = ref<string | null>(null)

    // Getters
    const featuredPartners = computed(() => partners.value.filter(p => p.is_featured))
    const otherPartners = computed(() => partners.value.filter(p => !p.is_featured))

    // Actions
    async function fetchPartners(): Promise<void> {
        loading.value = true
        error.value = null
        try {
            const { data } = await api.get('/partners')
            partners.value = data.data ?? data
        } catch (err: unknown) {
            const e = err as AxiosError<{ message?: string }>
            error.value = e.response?.data?.message ?? 'Failed to fetch partners'
        } finally {
            loading.value = false
        }
    }

    async function fetchPartner(id: number): Promise<void> {
        loading.value = true
        error.value = null
        try {
            const { data } = await api.get(`/partners/${id}`)
            currentPartner.value = data.data ?? data
        } catch (err: unknown) {
            const e = err as AxiosError<{ message?: string }>
            error.value = e.response?.data?.message ?? 'Failed to fetch partner'
        } finally {
            loading.value = false
        }
    }

    return {
        partners,
        currentPartner,
        loading,
        error,
        featuredPartners,
        otherPartners,
        fetchPartners,
        fetchPartner,
    }
})