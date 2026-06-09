import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { AxiosError } from 'axios'
import api from '@/core/api/axios'

export interface OrgMember {
  id: number
  name: string
  email: string
  avatar_url: string | null
  roles: string[]
}

export interface Organization {
  id: number
  name: string
  tax_id: string | null
  sector: string | null
  website_link: string | null
  description: string | null
  status: 'pending' | 'active' | 'rejected' | 'suspended'
  is_active: boolean
  logo_url: string | null
  users: OrgMember[]
  created_at: string
}

export const useOrganizationsStore = defineStore('organizations', () => {
  const organization = ref<Organization | null>(null)
  const loading = ref(false)
  const actionLoading = ref(false)
  const error = ref<string | null>(null)

  async function fetchMyOrganization(orgId: number) {
    loading.value = true
    error.value = null
    try {
      const res = await api.get(`/organizations/${orgId}`)
      organization.value = res.data.data ?? res.data
    } catch (err: unknown) {
      const e = err as AxiosError<{ message?: string }>
      error.value = e.response?.data?.message ?? 'Failed to load organization'
    } finally {
      loading.value = false
    }
  }

  async function updateOrganization(id: number, payload: object): Promise<void> {
    actionLoading.value = true
    try {
      const res = await api.put(`/organizations/${id}`, payload)
      organization.value = res.data.data ?? res.data
    } catch (err: unknown) {
      const e = err as AxiosError<{ message?: string }>
      throw new Error(e.response?.data?.message ?? 'Failed to update', { cause: err })
    } finally {
      actionLoading.value = false
    }
  }

  async function addMember(orgId: number, email: string, role: string = 'member'): Promise<void> {
    actionLoading.value = true
    try {
      const res = await api.post(`/organizations/${orgId}/members`, { email, role })
      const updated = res.data.data ?? res.data
      if (updated?.users) organization.value = updated
      else await fetchMyOrganization(orgId)
    } catch (err: unknown) {
      const e = err as AxiosError<{ message?: string }>
      throw new Error(e.response?.data?.message ?? 'Failed to add member', { cause: err })
    } finally {
      actionLoading.value = false
    }
  }

  async function removeMember(orgId: number, userId: number): Promise<void> {
    actionLoading.value = true
    try {
      await api.delete(`/organizations/${orgId}/members/${userId}`)
      if (organization.value) {
        organization.value.users = organization.value.users.filter(u => u.id !== userId)
      }
    } catch (err: unknown) {
      const e = err as AxiosError<{ message?: string }>
      throw new Error(e.response?.data?.message ?? 'Failed to remove member', { cause: err })
    } finally {
      actionLoading.value = false
    }
  }

  async function updateMember(orgId: number, userId: number, role: string): Promise<void> {
    actionLoading.value = true
    try {
      await api.put(`/organizations/${orgId}/members/${userId}`, { role })
    } catch (err: unknown) {
      const e = err as AxiosError<{ message?: string }>
      throw new Error(e.response?.data?.message ?? 'Failed to update member', { cause: err })
    } finally {
      actionLoading.value = false
    }
  }

  return {
    organization,
    loading,
    actionLoading,
    error,
    fetchMyOrganization,
    updateOrganization,
    addMember,
    removeMember,
    updateMember,
  }
})
