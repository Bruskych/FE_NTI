import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { AxiosError } from 'axios'
import api from '@/core/api/axios'

// ---------------------------------------------------------
// Интерфейсы данных
// ---------------------------------------------------------

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

export interface DashboardUser {
    id: number
    name: string
    email: string
    created_at: string
    roles: { name: string }[]
}

export interface DashboardStats {
    users_count: number
    pending_applications_count: number
    latest_users: DashboardUser[]
}

// ---------------------------------------------------------
// Стор администратора (Setup Store)
// ---------------------------------------------------------

export const useAdminStore = defineStore('admin', () => {
    // State
    const studentApplications = ref<StudentApplication[]>([])
    const companyApplications = ref<CompanyApplication[]>([])
    const dashboard = ref<DashboardStats | null>(null)

    const dashboardLoading = ref(false)
    const loading = ref(false)
    const actionLoading = ref<number | null>(null)
    const error = ref<string | null>(null)

    // Actions
    async function fetchDashboard(): Promise<void> {
        dashboardLoading.value = true
        try {
            const { data } = await api.get('/admin/dashboard')
            dashboard.value = data.data ?? data
        } catch (err: unknown) {
            const e = err as AxiosError<{ message?: string }>
            error.value = e.response?.data?.message ?? 'Failed to load dashboard'
        } finally {
            dashboardLoading.value = false
        }
    }

    async function fetchPendingStudents(): Promise<void> {
        loading.value = true
        error.value = null
        try {
            const { data } = await api.get('/admin/students/pending')
            studentApplications.value = data.data ?? data
        } catch (err: unknown) {
            const e = err as AxiosError<{ message?: string }>
            error.value = e.response?.data?.message ?? 'Failed to load students'
        } finally {
            loading.value = false
        }
    }

    async function approveStudent(appId: number, comment?: string): Promise<void> {
        actionLoading.value = appId
        try {
            await api.post(`/admin/students/${appId}/approve`, {
                comment: comment || 'Schválené administrátorom.'
            })
            studentApplications.value = studentApplications.value.filter(app => app.application_id !== appId)
        } catch (err: unknown) {
            const e = err as AxiosError<{ message?: string }>
            throw e.response?.data?.message ?? 'Approve failed'
        } finally {
            actionLoading.value = null
        }
    }

    async function rejectStudent(appId: number, comment: string): Promise<void> {
        actionLoading.value = appId
        try {
            await api.post(`/admin/students/${appId}/reject`, { comment })
            studentApplications.value = studentApplications.value.filter(app => app.application_id !== appId)
        } catch (err: unknown) {
            const e = err as AxiosError<{ message?: string }>
            throw e.response?.data?.message ?? 'Reject failed'
        } finally {
            actionLoading.value = null
        }
    }

    async function fetchPendingCompanies(): Promise<void> {
        loading.value = true
        error.value = null
        try {
            const { data } = await api.get('/admin/companies/pending')
            companyApplications.value = data.data ?? data
        } catch (err: unknown) {
            const e = err as AxiosError<{ message?: string }>
            error.value = e.response?.data?.message ?? 'Failed to load companies'
        } finally {
            loading.value = false
        }
    }

    async function approveCompany(appId: number, comment?: string): Promise<void> {
        actionLoading.value = appId
        try {
            await api.post(`/admin/companies/${appId}/approve`, {
                comment: comment || 'Firma schválená administrátorom.'
            })
            companyApplications.value = companyApplications.value.filter(app => app.application_id !== appId)
        } catch (err: unknown) {
            const e = err as AxiosError<{ message?: string }>
            throw e.response?.data?.message ?? 'Approve failed'
        } finally {
            actionLoading.value = null
        }
    }

    async function rejectCompany(appId: number, comment: string): Promise<void> {
        actionLoading.value = appId
        try {
            await api.post(`/admin/companies/${appId}/reject`, { comment })
            companyApplications.value = companyApplications.value.filter(app => app.application_id !== appId)
        } catch (err: unknown) {
            const e = err as AxiosError<{ message?: string }>
            throw e.response?.data?.message ?? 'Reject failed'
        } finally {
            actionLoading.value = null
        }
    }

    return {
        studentApplications,
        companyApplications,
        dashboard,
        dashboardLoading,
        loading,
        actionLoading,
        error,
        fetchDashboard,
        fetchPendingStudents,
        approveStudent,
        rejectStudent,
        fetchPendingCompanies,
        approveCompany,
        rejectCompany,
    }
})