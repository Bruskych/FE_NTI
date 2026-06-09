import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'

export interface PostStatus { is_published: boolean; published_at: string | null }
export interface PostSeo { meta_title: string | null; meta_description: string | null; og_image: string | null }

export interface Post {
  id: number
  title: string
  slug: string
  excerpt: string | null
  content: string
  type: 'article' | 'faq' | 'success_story' | null
  featured_image: string | null
  status: PostStatus
  seo: PostSeo
  author?: { id: number; name: string } | null
}

export interface PageStatus { is_published: boolean }
export interface PageSeo { meta_title: string | null; meta_description: string | null }

export interface Page {
  id: number
  title: string
  slug: string
  content: string
  status: PageStatus
  seo: PageSeo
}

export const useCmsStore = defineStore('cms', () => {
  const posts = ref<Post[]>([])
  const pages = ref<Page[]>([])
  const postsLoading = ref(false)
  const pagesLoading = ref(false)
  const saving = ref(false)

  async function fetchPosts() {
    postsLoading.value = true
    try {
      const { data } = await axios.get('/posts')
      posts.value = data.data ?? []
    } finally {
      postsLoading.value = false
    }
  }

  async function fetchPages() {
    pagesLoading.value = true
    try {
      const { data } = await axios.get('/pages')
      pages.value = data.data ?? []
    } finally {
      pagesLoading.value = false
    }
  }

  async function createPost(payload: object): Promise<Post> {
    saving.value = true
    try {
      const { data } = await axios.post('/posts', payload)
      const p: Post = data.data ?? data
      posts.value.unshift(p)
      return p
    } finally {
      saving.value = false
    }
  }

  async function updatePost(id: number, payload: object): Promise<Post> {
    saving.value = true
    try {
      const { data } = await axios.put(`/posts/${id}`, payload)
      const p: Post = data.data ?? data
      const idx = posts.value.findIndex(x => x.id === id)
      if (idx !== -1) posts.value[idx] = p
      return p
    } finally {
      saving.value = false
    }
  }

  async function deletePost(id: number) {
    await axios.delete(`/posts/${id}`)
    posts.value = posts.value.filter(p => p.id !== id)
  }

  async function createPage(payload: object): Promise<Page> {
    saving.value = true
    try {
      const { data } = await axios.post('/pages', payload)
      const p: Page = data.data ?? data
      pages.value.unshift(p)
      return p
    } finally {
      saving.value = false
    }
  }

  async function updatePage(id: number, payload: object): Promise<Page> {
    saving.value = true
    try {
      const { data } = await axios.put(`/pages/${id}`, payload)
      const p: Page = data.data ?? data
      const idx = pages.value.findIndex(x => x.id === id)
      if (idx !== -1) pages.value[idx] = p
      return p
    } finally {
      saving.value = false
    }
  }

  async function deletePage(id: number) {
    await axios.delete(`/pages/${id}`)
    pages.value = pages.value.filter(p => p.id !== id)
  }

  return {
    posts, pages, postsLoading, pagesLoading, saving,
    fetchPosts, fetchPages,
    createPost, updatePost, deletePost,
    createPage, updatePage, deletePage,
  }
})
