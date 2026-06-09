import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/core/api/axios'

export interface Milestone {
  id: number
  title: string
  description: string | null
  deadline: string | null
  status: 'pending' | 'in_progress' | 'completed' | 'approved' | 'overdue'
  completion_percentage: number
  is_completed: boolean
  is_approved: boolean
  is_overdue: boolean
  completed_at: string | null
  created_at: string
}

export interface Project {
  id: number
  title: string
  description: string | null
  status: string
  completion_percentage: number
  started_at: string | null
  finished_at: string | null
  final_score: string | null
  milestones: Milestone[]
  created_at: string
}

export interface CreateMilestonePayload {
  title: string
  description?: string | null
  deadline: string
}

export interface UpdateMilestonePayload {
  title?: string
  description?: string | null
  completion_percentage?: number
  status?: 'pending' | 'in_progress' | 'completed'
}

export const useProjectsStore = defineStore('projects', () => {
  const projects = ref<Project[]>([])
  const loading = ref(false)
  const actionLoading = ref<number | null>(null)

  async function fetchProjects() {
    loading.value = true
    try {
      const listRes = await api.get('/projects')
      const list: Project[] = Array.isArray(listRes.data.data)
        ? listRes.data.data
        : Array.isArray(listRes.data) ? listRes.data : []

      // index does not load milestones — fetch full detail for each project
      const detailed = await Promise.all(
        list.map((p: Project) =>
          api.get(`/projects/${p.id}`).then(r => r.data.data ?? r.data)
        )
      )
      projects.value = detailed
    } finally {
      loading.value = false
    }
  }

  async function approveMilestone(milestoneId: number, projectId: number) {
    actionLoading.value = milestoneId
    try {
      const res = await api.post(`/milestones/${milestoneId}/approve`)
      const updated: Milestone = res.data.data ?? res.data
      const project = projects.value.find(p => p.id === projectId)
      if (project) {
        const idx = project.milestones.findIndex(m => m.id === milestoneId)
        if (idx !== -1) project.milestones[idx] = updated
      }
    } finally {
      actionLoading.value = null
    }
  }

  async function createMilestone(projectId: number, payload: CreateMilestonePayload): Promise<void> {
    actionLoading.value = -1
    try {
      const { data } = await api.post(`/projects/${projectId}/milestones`, payload)
      const milestone: Milestone = data.data ?? data
      const project = projects.value.find(p => p.id === projectId)
      if (project) project.milestones.push(milestone)
    } finally {
      actionLoading.value = null
    }
  }

  async function updateMilestone(milestoneId: number, projectId: number, payload: UpdateMilestonePayload): Promise<void> {
    actionLoading.value = milestoneId
    try {
      const { data } = await api.put(`/milestones/${milestoneId}`, payload)
      const updated: Milestone = data.data ?? data
      const project = projects.value.find(p => p.id === projectId)
      if (project) {
        const idx = project.milestones.findIndex(m => m.id === milestoneId)
        if (idx !== -1) project.milestones[idx] = updated
      }
    } finally {
      actionLoading.value = null
    }
  }

  async function deleteMilestone(milestoneId: number, projectId: number): Promise<void> {
    await api.delete(`/milestones/${milestoneId}`)
    const project = projects.value.find(p => p.id === projectId)
    if (project) project.milestones = project.milestones.filter(m => m.id !== milestoneId)
  }

  return {
    projects,
    loading,
    actionLoading,
    fetchProjects,
    approveMilestone,
    createMilestone,
    updateMilestone,
    deleteMilestone,
  }
})
