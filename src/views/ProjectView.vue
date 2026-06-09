<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useProjectsStore } from '@/stores/projects'
import { useAuthStore } from '@/stores/auth'
import type { Milestone } from '@/stores/projects'

const projectsStore = useProjectsStore()
const authStore = useAuthStore()

const isMentorOrAdmin = computed(() =>
  authStore.hasAnyRole(['mentor', 'admin', 'super_admin'])
)

const project = computed(() => projectsStore.projects[0] ?? null)

const formatDate = (d: string | null) => {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('sk-SK', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

const milestoneStatusClass: Record<string, string> = {
  pending:     'ms-pending',
  in_progress: 'ms-progress',
  completed:   'ms-completed',
  approved:    'ms-approved',
  overdue:     'ms-overdue',
}

function msClass(m: Milestone) {
  return milestoneStatusClass[m.status] ?? 'ms-pending'
}

async function handleApprove(milestoneId: number) {
  if (!project.value) return
  try {
    await projectsStore.approveMilestone(milestoneId, project.value.id)
  } catch (err: unknown) {
    const e = err as { response?: { data?: { message?: string } } }
    alert(e.response?.data?.message ?? 'Error approving milestone')
  }
}

onMounted(() => projectsStore.fetchProjects())
</script>

<template>
  <div class="project-page">
    <div class="page-inner">

      <div class="page-header">
        <div>
          <h1>{{ $t('projects.title') }}</h1>
          <p class="subtitle">{{ $t('projects.subtitle') }}</p>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="projectsStore.loading" class="state-box">
        <div class="spinner"></div>
        <p>{{ $t('projects.loading') }}</p>
      </div>

      <!-- Empty -->
      <div v-else-if="!project" class="empty-card">
        <svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" class="empty-icon">
          <polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>
        </svg>
        <p class="empty-title">{{ $t('projects.empty') }}</p>
        <p class="empty-desc">{{ $t('projects.empty_desc') }}</p>
      </div>

      <template v-else>

        <!-- Project info card -->
        <div class="project-card">
          <div class="project-top">
            <div>
              <h2>{{ project.title }}</h2>
              <p v-if="project.description" class="project-desc">{{ project.description }}</p>
            </div>
            <span class="status-badge" :class="`ps-${project.status}`">
              {{ $t(`projects.project_status_${project.status}`) }}
            </span>
          </div>

          <!-- Progress bar -->
          <div class="progress-section">
            <div class="progress-header">
              <span class="progress-label">{{ $t('projects.progress') }}</span>
              <span class="progress-value">{{ project.completion_percentage }}%</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: `${project.completion_percentage}%` }"></div>
            </div>
          </div>

          <!-- Meta grid -->
          <div class="meta-grid">
            <div class="meta-item" v-if="project.started_at">
              <span class="meta-label">{{ $t('projects.started') }}</span>
              <span class="meta-value">{{ formatDate(project.started_at) }}</span>
            </div>
            <div class="meta-item" v-if="project.finished_at">
              <span class="meta-label">{{ $t('projects.finished') }}</span>
              <span class="meta-value">{{ formatDate(project.finished_at) }}</span>
            </div>
            <div class="meta-item" v-if="project.final_score">
              <span class="meta-label">{{ $t('projects.score') }}</span>
              <span class="meta-value score-val">{{ project.final_score }}</span>
            </div>
          </div>
        </div>

        <!-- Milestones -->
        <div class="milestones-section">
          <h3 class="section-title">{{ $t('projects.milestones') }}</h3>

          <div v-if="!project.milestones?.length" class="no-milestones">
            {{ $t('projects.no_milestones') }}
          </div>

          <div v-else class="milestones-list">
            <div
              v-for="m in project.milestones"
              :key="m.id"
              class="milestone-row"
              :class="{ 'milestone-approved': m.is_approved, 'milestone-overdue': m.is_overdue && !m.is_approved }"
            >
              <div class="ms-indicator" :class="msClass(m)"></div>

              <div class="ms-body">
                <div class="ms-top">
                  <span class="ms-title">{{ m.title }}</span>
                  <div class="ms-badges">
                    <span v-if="m.is_overdue && !m.is_approved" class="overdue-badge">{{ $t('projects.overdue_badge') }}</span>
                    <span class="ms-status-badge" :class="msClass(m)">
                      {{ $t(`projects.milestone_status_${m.status}`) }}
                    </span>
                  </div>
                </div>

                <p v-if="m.description" class="ms-desc">{{ m.description }}</p>

                <div class="ms-footer">
                  <div class="ms-meta">
                    <span v-if="m.deadline" class="ms-meta-item">
                      <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                      </svg>
                      {{ $t('projects.deadline') }}: {{ formatDate(m.deadline) }}
                    </span>
                    <span class="ms-meta-item">
                      <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
                      </svg>
                      {{ $t('projects.completion') }}: {{ m.completion_percentage }}%
                    </span>
                  </div>

                  <button
                    v-if="isMentorOrAdmin && m.is_completed && !m.is_approved"
                    class="approve-btn"
                    :disabled="projectsStore.actionLoading === m.id"
                    @click="handleApprove(m.id)"
                  >
                    {{ $t('projects.approve') }}
                  </button>
                </div>

                <!-- Mini progress bar -->
                <div class="ms-progress-bar">
                  <div class="ms-progress-fill" :style="{ width: `${m.completion_percentage}%` }"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </template>
    </div>
  </div>
</template>

<style scoped>
.project-page {
  font-family: var(--font-main), sans-serif;
  background: var(--bg-color);
  min-height: calc(100vh - 75px);
  color: var(--text-color);
}

.page-inner {
  max-width: 860px;
  margin: 0 auto;
  padding: 48px 40px;
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.page-header h1 {
  font-size: clamp(22px, 3vw, 30px);
  font-weight: 800;
  letter-spacing: -0.5px;
  margin: 0 0 6px 0;
}
.subtitle { font-size: 15px; opacity: 0.65; margin: 0; }

/* STATES */
.state-box {
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; gap: 14px; min-height: 240px; opacity: 0.6;
}
.spinner {
  width: 32px; height: 32px;
  border: 5px solid var(--menu-border);
  border-top-color: var(--main-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.empty-card {
  display: flex; flex-direction: column; align-items: center;
  gap: 12px; padding: 60px 40px;
  background: var(--menu-color);
  border: 1px solid var(--menu-border);
  border-radius: 20px; text-align: center;
}
.empty-icon  { color: var(--main-color); opacity: 0.4; }
.empty-title { font-size: 17px; font-weight: 800; margin: 0; }
.empty-desc  { font-size: 14px; opacity: 0.6; margin: 0; }

/* PROJECT CARD */
.project-card {
  background: var(--menu-color);
  border: 1px solid var(--menu-border);
  border-radius: 20px;
  padding: 28px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.project-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}
.project-top h2   { margin: 0; font-size: 22px; font-weight: 800; }
.project-desc     { margin: 6px 0 0; font-size: 14px; opacity: 0.7; line-height: 1.5; }

/* PROJECT STATUS BADGES */
.status-badge {
  font-size: 10.5px; font-weight: 700; text-transform: uppercase;
  letter-spacing: 0.8px; padding: 4px 12px; border-radius: 100px;
  white-space: nowrap; flex-shrink: 0;
}
.ps-planning  { background: color-mix(in srgb, var(--wait-color) 15%, transparent); color: var(--wait-color); }
.ps-active    { background: color-mix(in srgb, var(--good-color) 15%, transparent); color: var(--good-color); }
.ps-completed { background: color-mix(in srgb, #6366f1 15%, transparent); color: #6366f1; }
.ps-suspended { background: color-mix(in srgb, var(--error-color) 15%, transparent); color: var(--error-color); }
.ps-archived  { background: color-mix(in srgb, var(--text-color) 10%, transparent); color: var(--text-color); opacity: 0.6; }

/* PROGRESS */
.progress-section { display: flex; flex-direction: column; gap: 8px; }
.progress-header  { display: flex; justify-content: space-between; align-items: center; }
.progress-label   { font-size: 13px; font-weight: 700; opacity: 0.6; }
.progress-value   { font-size: 14px; font-weight: 800; color: var(--main-color); }
.progress-bar {
  height: 8px; border-radius: 100px;
  background: var(--menu-border);
  overflow: hidden;
}
.progress-fill {
  height: 100%;
  border-radius: 100px;
  background: var(--main-color);
  transition: width 0.4s ease;
}

/* META */
.meta-grid {
  display: flex; flex-wrap: wrap; gap: 20px;
  padding-top: 4px;
}
.meta-item  { display: flex; flex-direction: column; gap: 2px; }
.meta-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.7px; opacity: 0.5; }
.meta-value { font-size: 15px; font-weight: 700; }
.score-val  { color: var(--main-color); }

/* MILESTONES */
.section-title {
  margin: 0 0 16px; font-size: 16px; font-weight: 800; letter-spacing: -0.3px;
}

.no-milestones {
  padding: 32px; text-align: center;
  background: var(--menu-color);
  border: 1px solid var(--menu-border);
  border-radius: 16px;
  font-size: 14px; opacity: 0.6;
}

.milestones-list { display: flex; flex-direction: column; gap: 12px; }

.milestone-row {
  display: flex;
  gap: 14px;
  background: var(--menu-color);
  border: 1px solid var(--menu-border);
  border-radius: 14px;
  padding: 16px 18px;
  transition: border-color 0.2s;
}
.milestone-row:hover           { border-color: var(--main-color); }
.milestone-approved            { border-color: color-mix(in srgb, var(--good-color) 40%, transparent); }
.milestone-overdue             { border-color: color-mix(in srgb, var(--error-color) 30%, transparent); }

.ms-indicator {
  width: 4px; border-radius: 100px; flex-shrink: 0; align-self: stretch;
}
.ms-pending.ms-indicator    { background: var(--wait-color); }
.ms-progress.ms-indicator   { background: var(--main-color); }
.ms-completed.ms-indicator  { background: #6366f1; }
.ms-approved.ms-indicator   { background: var(--good-color); }
.ms-overdue.ms-indicator    { background: var(--error-color); }

.ms-body { flex: 1; display: flex; flex-direction: column; gap: 10px; min-width: 0; }

.ms-top {
  display: flex; align-items: flex-start;
  justify-content: space-between; gap: 10px; flex-wrap: wrap;
}
.ms-title  { font-size: 15px; font-weight: 700; }
.ms-badges { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }

.ms-status-badge {
  font-size: 10px; font-weight: 700; text-transform: uppercase;
  letter-spacing: 0.8px; padding: 2px 9px; border-radius: 100px;
}
.ms-pending.ms-status-badge    { background: color-mix(in srgb, var(--wait-color) 15%, transparent); color: var(--wait-color); }
.ms-progress.ms-status-badge   { background: color-mix(in srgb, var(--main-color) 15%, transparent); color: var(--main-color-dark); }
.ms-completed.ms-status-badge  { background: color-mix(in srgb, #6366f1 15%, transparent); color: #6366f1; }
.ms-approved.ms-status-badge   { background: color-mix(in srgb, var(--good-color) 15%, transparent); color: var(--good-color); }
.ms-overdue.ms-status-badge    { background: color-mix(in srgb, var(--error-color) 15%, transparent); color: var(--error-color); }

.overdue-badge {
  font-size: 10px; font-weight: 700; text-transform: uppercase;
  letter-spacing: 0.8px; padding: 2px 9px; border-radius: 100px;
  background: color-mix(in srgb, var(--error-color) 15%, transparent);
  color: var(--error-color);
}

.ms-desc { font-size: 13.5px; opacity: 0.7; margin: 0; line-height: 1.5; }

.ms-footer {
  display: flex; align-items: center;
  justify-content: space-between; gap: 12px; flex-wrap: wrap;
}
.ms-meta { display: flex; gap: 14px; flex-wrap: wrap; }
.ms-meta-item {
  display: flex; align-items: center; gap: 5px;
  font-size: 12px; opacity: 0.6;
}
.ms-meta-item svg { flex-shrink: 0; }

.approve-btn {
  padding: 5px 14px; border-radius: 8px; border: none;
  background: var(--good-color); color: #fff;
  font-family: inherit; font-size: 12.5px; font-weight: 700;
  cursor: pointer; transition: opacity 0.18s, transform 0.15s;
}
.approve-btn:disabled { opacity: 0.45; cursor: not-allowed; }
.approve-btn:not(:disabled):hover { transform: translateY(-1px); }

.ms-progress-bar {
  height: 4px; border-radius: 100px;
  background: var(--menu-border); overflow: hidden;
}
.ms-progress-fill {
  height: 100%; border-radius: 100px;
  background: var(--main-color); transition: width 0.4s ease;
}

@media (max-width: 640px) {
  .page-inner { padding: 32px 20px; }
  .ms-footer { flex-direction: column; align-items: flex-start; }
}
</style>
