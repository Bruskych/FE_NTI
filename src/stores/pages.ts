import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { AxiosError } from 'axios'
import api from '@/core/api/axios'

// ---------------------------------------------------------
// Интерфейсы данных
// ---------------------------------------------------------

export interface Page {
    id: number
    title: string
    slug: string
    content: string
    status: {
        is_published: boolean
    }
    seo: {
        meta_title: string | null
        meta_description: string | null
    }
}

// ---------------------------------------------------------
// Стор страниц
// ---------------------------------------------------------

export const usePagesStore = defineStore('pages', () => {
    // State
    const pages = ref<Page[]>([])
    const currentPage = ref<Page | null>(null)
    const loading = ref(false)
    const actionLoading = ref<number | null>(null)
    const error = ref<string | null>(null)

    // Actions
    async function fetchPages(): Promise<void> {
        loading.value = true
        error.value = null
        try {
            const { data } = await api.get('/pages')
            pages.value = data.data ?? data
        } catch (err: unknown) {
            const e = err as AxiosError<{ message?: string }>
            error.value = e.response?.data?.message ?? 'Failed to load pages'
        } finally {
            loading.value = false
        }
    }

    async function fetchPage(id: number): Promise<void> {
        loading.value = true
        try {
            const { data } = await api.get(`/pages/${id}`)
            currentPage.value = data.data ?? data
        } finally {
            loading.value = false
        }
    }

    async function createPage(payload: object): Promise<Page> {
        const { data } = await api.post('/pages', payload)
        const created: Page = data.data ?? data
        pages.value.unshift(created)
        return created
    }

    async function updatePage(id: number, payload: object): Promise<void> {
        actionLoading.value = id
        try {
            const { data } = await api.put(`/pages/${id}`, payload)
            const updated: Page = data.data ?? data
            const index = pages.value.findIndex(p => p.id === id)
            if (index !== -1) pages.value[index] = updated
        } finally {
            actionLoading.value = null
        }
    }

    async function deletePage(id: number): Promise<void> {
        actionLoading.value = id
        try {
            await api.delete(`/pages/${id}`)
            pages.value = pages.value.filter(p => p.id !== id)
        } finally {
            actionLoading.value = null
        }
    }

    return {
        pages,
        currentPage,
        loading,
        actionLoading,
        error,
        fetchPages,
        fetchPage,
        createPage,
        updatePage,
        deletePage,
    }
})