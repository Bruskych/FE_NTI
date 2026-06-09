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

export const useProjectsStore = defineStore('projects', () => {
  const projects = ref<Project[]>([])
  const loading = ref(false)
  const actionLoading = ref<number | null>(null)

  async function fetchProjects() {
    loading.value = true
    try {
      const res = await api.get('/projects')
      const data = res.data.data ?? res.data
      projects.value = Array.isArray(data) ? data : []
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

  return {
    projects,
    loading,
    actionLoading,
    fetchProjects,
    approveMilestone,
  }
})
