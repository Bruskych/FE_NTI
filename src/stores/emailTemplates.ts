import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/core/api/axios'

export interface EmailTemplate {
  id: number
  name: string
  subject: string
  body: string
  variables: string[] | null
  created_at: string
  updated_at: string
}

export interface EmailTemplatePayload {
  name: string
  subject: string
  body: string
  variables_json?: string[]
}

export const useEmailTemplatesStore = defineStore('emailTemplates', () => {
  const templates = ref<EmailTemplate[]>([])
  const loading = ref(false)
  const saving = ref(false)

  async function fetchTemplates() {
    loading.value = true
    try {
      const { data } = await api.get('/admin/email-templates')
      templates.value = data.data ?? []
    } finally {
      loading.value = false
    }
  }

  async function createTemplate(payload: EmailTemplatePayload): Promise<EmailTemplate> {
    saving.value = true
    try {
      const { data } = await api.post('/admin/email-templates', payload)
      const t: EmailTemplate = data.data ?? data
      templates.value.unshift(t)
      return t
    } finally {
      saving.value = false
    }
  }

  async function updateTemplate(id: number, payload: Partial<EmailTemplatePayload>): Promise<EmailTemplate> {
    saving.value = true
    try {
      const { data } = await api.put(`/admin/email-templates/${id}`, payload)
      const updated: EmailTemplate = data.data ?? data
      const idx = templates.value.findIndex(t => t.id === id)
      if (idx !== -1) templates.value[idx] = updated
      return updated
    } finally {
      saving.value = false
    }
  }

  async function deleteTemplate(id: number) {
    await api.delete(`/admin/email-templates/${id}`)
    templates.value = templates.value.filter(t => t.id !== id)
  }

  return { templates, loading, saving, fetchTemplates, createTemplate, updateTemplate, deleteTemplate }
})
