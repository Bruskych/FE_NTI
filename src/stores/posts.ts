import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { AxiosError } from 'axios'
import api from '@/core/api/axios'

// ---------------------------------------------------------
// Интерфейсы данных
// ---------------------------------------------------------

export interface Post {
    id: number
    title: string
    slug: string
    excerpt: string | null
    content: string
    featured_image: string | null
    status: {
        is_published: boolean
        published_at: string | null
    }
    seo: {
        meta_title: string | null
        meta_description: string | null
        og_image: string | null
    }
    author?: { id: number; name: string }
}

// ---------------------------------------------------------
// Стор постов
// ---------------------------------------------------------

export const usePostsStore = defineStore('posts', () => {
    // State
    const posts = ref<Post[]>([])
    const currentPost = ref<Post | null>(null)
    const loading = ref(false)
    const actionLoading = ref<number | null>(null)
    const error = ref<string | null>(null)

    // Actions
    async function fetchPosts(type?: 'article' | 'faq' | 'success_story'): Promise<void> {
        loading.value = true
        error.value = null
        try {
            const { data } = await api.get('/posts', { params: { type } })
            posts.value = data.data ?? data
        } catch (err: unknown) {
            const e = err as AxiosError<{ message?: string }>
            error.value = e.response?.data?.message ?? 'Failed to load posts'
        } finally {
            loading.value = false
        }
    }

    async function fetchPost(id: number): Promise<void> {
        loading.value = true
        try {
            const { data } = await api.get(`/posts/${id}`)
            currentPost.value = data.data ?? data
        } finally {
            loading.value = false
        }
    }

    async function createPost(payload: object): Promise<Post> {
        actionLoading.value = 0 // Используем 0 как флаг создания
        try {
            const { data } = await api.post('/posts', payload)
            const created: Post = data.data ?? data
            posts.value.unshift(created)
            return created
        } finally {
            actionLoading.value = null
        }
    }

    async function updatePost(id: number, payload: object): Promise<void> {
        actionLoading.value = id
        try {
            const { data } = await api.put(`/posts/${id}`, payload)
            const updated: Post = data.data ?? data
            const index = posts.value.findIndex(p => p.id === id)
            if (index !== -1) posts.value[index] = updated
        } finally {
            actionLoading.value = null
        }
    }

    async function deletePost(id: number): Promise<void> {
        actionLoading.value = id
        try {
            await api.delete(`/posts/${id}`)
            posts.value = posts.value.filter(p => p.id !== id)
        } finally {
            actionLoading.value = null
        }
    }

    return {
        posts,
        currentPost,
        loading,
        actionLoading,
        error,
        fetchPosts,
        fetchPost,
        createPost,
        updatePost,
        deletePost,
    }
})