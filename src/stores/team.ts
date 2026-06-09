import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/core/api/axios'

export interface TeamMember {
  id: number
  name: string
  email: string
  team_role: 'leader' | 'member'
  joined_at: string | null
}

export interface Team {
  id: number
  name: string
  description: string | null
  skills: string[] | null
  capacity: number | null
  status: 'active' | 'inactive'
  is_full: boolean
  leader: { id: number; name: string; email: string } | null
  members: TeamMember[]
  created_at: string
}

export const useTeamStore = defineStore('team', () => {
  const team = ref<Team | null>(null)
  const loading = ref(false)
  const actionLoading = ref(false)
  const error = ref<string | null>(null)

  async function fetchMyTeam() {
    loading.value = true
    error.value = null
    try {
      const res = await api.get('/teams/my-team')
      team.value = res.data.data ?? res.data
    } catch (err: unknown) {
      const e = err as { response?: { status?: number; data?: { message?: string } } }
      if (e.response?.status === 404) {
        team.value = null
      } else {
        error.value = e.response?.data?.message ?? 'Error loading team'
        throw err
      }
    } finally {
      loading.value = false
    }
  }

  async function createTeam(payload: { name: string; description?: string; capacity?: number }) {
    actionLoading.value = true
    try {
      const res = await api.post('/teams', payload)
      team.value = res.data.data ?? res.data
    } finally {
      actionLoading.value = false
    }
  }

  async function updateTeam(payload: { name?: string; description?: string; capacity?: number }) {
    if (!team.value) return
    actionLoading.value = true
    try {
      const res = await api.put(`/teams/${team.value.id}`, payload)
      team.value = res.data.data ?? res.data
    } finally {
      actionLoading.value = false
    }
  }

  async function inviteMember(email: string) {
    if (!team.value) throw new Error('No team')
    actionLoading.value = true
    try {
      await api.post(`/teams/${team.value.id}/invite`, { email })
    } finally {
      actionLoading.value = false
    }
  }

  async function removeMember(userId: number) {
    if (!team.value) return
    actionLoading.value = true
    try {
      await api.post(`/teams/${team.value.id}/remove-member`, { user_id: userId })
      team.value.members = team.value.members.filter(m => m.id !== userId)
    } finally {
      actionLoading.value = false
    }
  }

  async function leaveTeam() {
    actionLoading.value = true
    try {
      await api.post('/teams/leave')
      team.value = null
    } finally {
      actionLoading.value = false
    }
  }

  async function deleteTeam() {
    if (!team.value) return
    actionLoading.value = true
    try {
      await api.delete(`/teams/${team.value.id}`)
      team.value = null
    } finally {
      actionLoading.value = false
    }
  }

  return {
    team,
    loading,
    actionLoading,
    error,
    fetchMyTeam,
    createTeam,
    updateTeam,
    inviteMember,
    removeMember,
    leaveTeam,
    deleteTeam,
  }
})
