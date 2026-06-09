import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { AxiosError } from 'axios'
import api from '@/core/api/axios'

export type DocumentClassification = 'public' | 'internal' | 'confidential'

export interface Document {
  id: number
  type: string | null
  file_name: string
  mime_type: string
  size: number
  size_kb: number
  version: number
  classification: DocumentClassification
  application_id: number | null
  project_id: number | null
  milestone_id: number | null
  uploaded_by: number
  created_at: string
  updated_at: string
}

export interface DocumentFilters {
  type?: string
  classification?: DocumentClassification
  application_id?: number
  project_id?: number
  milestone_id?: number
}

export const useDocumentsStore = defineStore('documents', () => {
  const documents = ref<Document[]>([])
  const loading = ref(false)
  const actionLoading = ref(false)
  const error = ref<string | null>(null)

  async function fetchDocuments(filters: DocumentFilters = {}): Promise<void> {
    loading.value = true
    error.value = null
    try {
      const res = await api.get('/documents', { params: filters })
      const data = res.data.data ?? res.data
      documents.value = Array.isArray(data) ? data : (data.data ?? [])
    } catch (err: unknown) {
      const e = err as AxiosError<{ message?: string }>
      error.value = e.response?.data?.message ?? 'Failed to load documents'
    } finally {
      loading.value = false
    }
  }

  async function uploadDocument(formData: FormData): Promise<Document> {
    actionLoading.value = true
    try {
      const res = await api.post('/documents', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      const doc: Document = res.data.document ?? res.data.data ?? res.data
      documents.value.unshift(doc)
      return doc
    } catch (err: unknown) {
      const e = err as AxiosError<{ message?: string }>
      throw new Error(e.response?.data?.message ?? 'Failed to upload document', { cause: err })
    } finally {
      actionLoading.value = false
    }
  }

  async function deleteDocument(id: number): Promise<void> {
    actionLoading.value = true
    try {
      await api.delete(`/documents/${id}`)
      documents.value = documents.value.filter(d => d.id !== id)
    } catch (err: unknown) {
      const e = err as AxiosError<{ message?: string }>
      throw new Error(e.response?.data?.message ?? 'Failed to delete document', { cause: err })
    } finally {
      actionLoading.value = false
    }
  }

  async function requestAccessCode(documentId: number): Promise<void> {
    try {
      await api.post(`/documents/${documentId}/access-code`)
    } catch (err: unknown) {
      const e = err as AxiosError<{ message?: string }>
      throw new Error(e.response?.data?.message ?? 'Failed to request access code', { cause: err })
    }
  }

  async function downloadDocument(documentId: number, code?: string): Promise<void> {
    const params = code ? { code } : {}
    let res
    try {
      res = await api.get(`/documents/${documentId}/download`, {
        params,
        responseType: 'blob',
      })
    } catch (err: unknown) {
      const e = err as { response?: { data?: Blob; status?: number } }
      if (e.response?.data instanceof Blob) {
        const text = await e.response.data.text()
        let message = 'Download failed'
        try {
          const json = JSON.parse(text) as { message?: string }
          message = json.message ?? message
        } catch {
          // not JSON (HTML error page)
        }
        throw new Error(message, { cause: err })
      }
      throw err
    }
    const doc = documents.value.find(d => d.id === documentId)
    const filename = doc?.file_name ?? `document-${documentId}`
    const blob = res.data instanceof Blob ? res.data : new Blob([res.data as BlobPart])
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    setTimeout(() => URL.revokeObjectURL(url), 150)
  }

  return {
    documents,
    loading,
    actionLoading,
    error,
    fetchDocuments,
    uploadDocument,
    deleteDocument,
    requestAccessCode,
    downloadDocument,
  }
})
