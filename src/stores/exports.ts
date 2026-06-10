import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/core/api/axios'

export interface ExportLog {
  id: number
  user_id: number
  export_type: string
  filters_json: Record<string, unknown> | null
  file_path: string | null
  created_at: string
  user?: { id: number; name: string } | null
}

export interface ExportTypeOption {
  type: string
  resource: string
  format: string
  label: string
}

export const useExportsStore = defineStore('exports', () => {
  const logs = ref<ExportLog[]>([])
  const loading = ref(false)
  const scheduling = ref<string | null>(null)
  const currentPage = ref(1)
  const lastPage = ref(1)
  const total = ref(0)
  const types = ref<Record<string, ExportTypeOption[]>>({})
  const typesLoaded = ref(false)

  async function fetchTypes() {
    if (typesLoaded.value) return
    const { data } = await api.get('/admin/exports/types')
    types.value = data.data?.types ?? data.types ?? {}
    typesLoaded.value = true
  }

  async function fetchLogs(page = 1) {
    loading.value = true
    try {
      const { data } = await api.get('/admin/exports', { params: { page } })
      logs.value = data.data ?? []
      currentPage.value = data.current_page ?? page
      lastPage.value = data.last_page ?? 1
      total.value = data.total ?? logs.value.length
    } finally {
      loading.value = false
    }
  }

  async function scheduleExport(exportType: string): Promise<ExportLog> {
    scheduling.value = exportType
    try {
      const { data } = await api.post('/admin/exports', { export_type: exportType })
      const newLog: ExportLog = data.data?.export ?? data.export ?? data.data ?? data
      if (newLog && newLog.id) {
        logs.value.unshift(newLog)
        total.value++
      }
      return newLog
    } finally {
      scheduling.value = null
    }
  }

  async function deleteExport(id: number) {
    await api.delete(`/admin/exports/${id}`)
    logs.value = logs.value.filter(l => l.id !== id)
    total.value = Math.max(0, total.value - 1)
  }

  return { logs, loading, scheduling, currentPage, lastPage, total, types, typesLoaded, fetchTypes, fetchLogs, scheduleExport, deleteExport }
})
