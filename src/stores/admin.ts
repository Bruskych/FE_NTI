import { defineStore } from 'pinia'
import type { AxiosError } from 'axios'
import api from '@/core/api/axios'

// Интерфейсы приведены в строгое соответствие с Laravel API Resources
export interface StudentApplication {
  application_id: number
  status: string
  submitted_at: string | null
  student_name: string
  student_email: string
  user_id: number | null
}

export interface CompanyApplication {
  application_id: number
  status: string
  submitted_at: string | null
  company_name: string
  company_tax_id: string
  sector: string
  website_link: string | null
  description: string
  owner_name: string
  owner_email: string
  user_id: number | null
}

interface AdminState {
  studentApplications: StudentApplication[]
  companyApplications: CompanyApplication[]
  loading: boolean
  actionLoading: number | null // Сюда пишем application_id
  error: string | null
}

export const useAdminStore = defineStore('admin', {
  state: (): AdminState => ({
    studentApplications: [],
    companyApplications: [],
    loading: false,
    actionLoading: null,
    error: null,
  }),

  actions: {
    async fetchPendingStudents(): Promise<void> {
      this.loading = true
      this.error = null
      try {
        const { data } = await api.get('/admin/students/pending')
        // Laravel Resources возвращают данные в ключе 'data'
        this.studentApplications = data.data || data
      } catch (error: unknown) {
        const err = error as AxiosError<{ message?: string }>
        this.error = err.response?.data?.message || 'Failed to load students'
      } finally {
        this.loading = false
      }
    },

    async approveStudent(appId: number, comment?: string): Promise<void> {
      this.actionLoading = appId
      try {
        // Передаем appId (это $this->id на бэкенде)
        await api.post(`/admin/students/${appId}/approve`, {
          comment: comment || 'Schválené administrátorom.'
        })
        this.studentApplications = this.studentApplications.filter(app => app.application_id !== appId)
      } catch (error: unknown) {
        const err = error as AxiosError<{ message?: string }>
        throw err.response?.data?.message || 'Approve failed'
      } finally {
        this.actionLoading = null
      }
    },

    async rejectStudent(appId: number, comment: string): Promise<void> {
      this.actionLoading = appId
      try {
        await api.post(`/admin/students/${appId}/reject`, { comment })
        this.studentApplications = this.studentApplications.filter(app => app.application_id !== appId)
      } catch (error: unknown) {
        const err = error as AxiosError<{ message?: string }>
        throw err.response?.data?.message || 'Reject failed'
      } finally {
        this.actionLoading = null
      }
    },

    async fetchPendingCompanies(): Promise<void> {
      this.loading = true
      this.error = null
      try {
        const { data } = await api.get('/admin/companies/pending')
        this.companyApplications = data.data || data
      } catch (error: unknown) {
        const err = error as AxiosError<{ message?: string }>
        this.error = err.response?.data?.message || 'Failed to load companies'
      } finally {
        this.loading = false
      }
    },

    async approveCompany(appId: number, comment?: string): Promise<void> {
      this.actionLoading = appId
      try {
        await api.post(`/admin/companies/${appId}/approve`, {
          comment: comment || 'Firma schválená administrátorom.'
        })
        this.companyApplications = this.companyApplications.filter(app => app.application_id !== appId)
      } catch (error: unknown) {
        const err = error as AxiosError<{ message?: string }>
        throw err.response?.data?.message || 'Approve failed'
      } finally {
        this.actionLoading = null
      }
    },

    async rejectCompany(appId: number, comment: string): Promise<void> {
      this.actionLoading = appId
      try {
        await api.post(`/admin/companies/${appId}/reject`, { comment })
        this.companyApplications = this.companyApplications.filter(app => app.application_id !== appId)
      } catch (error: unknown) {
        const err = error as AxiosError<{ message?: string }>
        throw err.response?.data?.message || 'Reject failed'
      } finally {
        this.actionLoading = null
      }
    }
  }
})