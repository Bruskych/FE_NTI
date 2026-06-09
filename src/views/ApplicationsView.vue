<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useApplicationsStore } from '@/stores/applications'
import { useCallsStore } from '@/stores/calls'
import { useAuthStore } from '@/stores/auth'
import type { Application } from '@/stores/applications'

const { t } = useI18n()

const appsStore = useApplicationsStore()
const callsStore = useCallsStore()
const authStore = useAuthStore()

const isLeader = computed(() => authStore.hasAnyRole(['team_leader']))
const canCreate = computed(() => authStore.hasAnyRole(['student', 'team_leader']))

// New application modal
const showCreateModal = ref(false)
const selectedCallId = ref<number | null>(null)
const createError = ref<string | null>(null)
const creating = ref(false)

const openCalls = computed(() => callsStore.openCalls)

const statusOrder = [
  'draft', 'submitted', 'verified', 'in_evaluation',
  'needs_supplement', 'approved', 'rejected',
  'onboarding', 'active', 'suspended', 'archived',
]

const sortedApplications = computed(() =>
  [...appsStore.applications].sort((a, b) =>
    statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status)
  )
)

const formatDate = (d: string | null) => {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('sk-SK', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

const statusColorMap: Record<string, string> = {
  draft:             'status-draft',
  submitted:         'status-submitted',
  verified:          'status-verified',
  in_evaluation:     'status-evaluation',
  needs_supplement:  'status-supplement',
  approved:          'status-approved',
  rejected:          'status-rejected',
  onboarding:        'status-onboarding',
  active:            'status-active',
  suspended:         'status-suspended',
  archived:          'status-archived',
}

function statusClass(status: string) {
  return statusColorMap[status] ?? 'status-draft'
}

async function handleSubmit(app: Application) {
  if (!confirm(t('applications.submit_confirm'))) return
  try {
    await appsStore.submitApplication(app.id)
  } catch (err: unknown) {
    const e = err as { response?: { data?: { message?: string } } }
    alert(e.response?.data?.message ?? 'Error submitting application')
  }
}

async function handleDelete(app: Application) {
  if (!confirm(t('applications.delete_confirm'))) return
  try {
    await appsStore.deleteApplication(app.id)
  } catch (err: unknown) {
    const e = err as { response?: { data?: { message?: string } } }
    alert(e.response?.data?.message ?? 'Error deleting application')
  }
}

async function handleCreate() {
  if (!selectedCallId.value) return
  createError.value = null
  creating.value = true

  const call = openCalls.value.find(c => c.id === selectedCallId.value)
  if (!call || !call.program) return

  try {
    await appsStore.createApplication({
      program_id: call.program.id,
      call_id: call.id,
    })
    showCreateModal.value = false
    selectedCallId.value = null
  } catch (err: unknown) {
    const e = err as { response?: { data?: { message?: string } } }
    createError.value = e.response?.data?.message ?? 'Error creating application'
  } finally {
    creating.value = false
  }
}

function openCreateModal() {
  selectedCallId.value = null
  createError.value = null
  showCreateModal.value = true
}

onMounted(async () => {
  await Promise.all([
    appsStore.fetchApplications(),
    callsStore.calls.length === 0 ? callsStore.fetchCalls() : Promise.resolve(),
  ])
})
</script>

<template>
  <div class="apps-page">
    <div class="page-inner">

      <div class="page-header">
        <div>
          <h1>{{ $t('applications.title') }}</h1>
          <p class="subtitle">{{ $t('applications.subtitle') }}</p>
        </div>
        <button v-if="canCreate" class="btn btn-primary" @click="openCreateModal">
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          {{ $t('applications.new_application') }}
        </button>
      </div>

      <!-- Loading -->
      <div v-if="appsStore.loading" class="state-box">
        <div class="spinner"></div>
        <p>{{ $t('applications.loading') }}</p>
      </div>

      <!-- Empty -->
      <div v-else-if="sortedApplications.length === 0" class="empty-card">
        <svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" class="empty-icon">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
        </svg>
        <p class="empty-title">{{ $t('applications.empty') }}</p>
        <p class="empty-desc">{{ $t('applications.empty_desc') }}</p>
      </div>

      <!-- List -->
      <div v-else class="apps-list">
        <div
          v-for="app in sortedApplications"
          :key="app.id"
          class="app-card"
        >
          <div class="app-card-header">
            <div class="app-meta">
              <span class="status-badge" :class="statusClass(app.status)">
                {{ $t(`applications.status_${app.status}`) }}
              </span>
              <span v-if="app.is_program_a" class="type-tag">{{ $t('applications.program_a') }}</span>
              <span v-if="app.is_program_b" class="type-tag">{{ $t('applications.program_b') }}</span>
            </div>
            <span class="app-id">#{{ app.id }}</span>
          </div>

          <div class="app-body">
            <div class="info-grid">
              <div v-if="app.program" class="info-item">
                <span class="info-label">{{ $t('applications.program') }}</span>
                <span class="info-value">{{ app.program.name }}</span>
              </div>
              <div v-if="app.call" class="info-item">
                <span class="info-label">{{ $t('applications.call') }}</span>
                <span class="info-value">{{ app.call.title }}</span>
              </div>
              <div v-if="app.team" class="info-item">
                <span class="info-label">{{ $t('applications.team') }}</span>
                <span class="info-value">{{ app.team.name }}</span>
              </div>
              <div v-if="app.total_score" class="info-item">
                <span class="info-label">{{ $t('applications.score') }}</span>
                <span class="info-value score-value">{{ app.total_score }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">{{ $t('applications.created_at') }}</span>
                <span class="info-value">{{ formatDate(app.created_at) }}</span>
              </div>
              <div v-if="app.submitted_at" class="info-item">
                <span class="info-label">{{ $t('applications.submitted_at') }}</span>
                <span class="info-value">{{ formatDate(app.submitted_at) }}</span>
              </div>
            </div>

            <div v-if="app.decision_comment" class="decision-comment">
              <span class="info-label">{{ $t('applications.decision_comment') }}</span>
              <p>{{ app.decision_comment }}</p>
            </div>
          </div>

          <div class="app-card-footer" v-if="app.can_be_submitted || app.can_be_edited">
            <button
              v-if="app.can_be_submitted && isLeader"
              class="btn btn-submit"
              :disabled="appsStore.actionLoading === app.id"
              @click="handleSubmit(app)"
            >
              {{ $t('applications.action_submit') }}
            </button>
            <button
              v-if="app.can_be_edited && isLeader"
              class="btn btn-delete"
              :disabled="appsStore.actionLoading === app.id"
              @click="handleDelete(app)"
            >
              {{ $t('applications.action_delete') }}
            </button>
          </div>
        </div>
      </div>

    </div>

    <!-- Create modal -->
    <div v-if="showCreateModal" class="modal-overlay" @click.self="showCreateModal = false">
      <div class="modal-box">
        <h3>{{ $t('applications.form_title') }}</h3>

        <div v-if="openCalls.length === 0" class="no-calls">
          {{ $t('applications.form_no_calls') }}
        </div>

        <template v-else>
          <p class="modal-label">{{ $t('applications.form_select_call') }}</p>
          <div class="call-options">
            <label
              v-for="call in openCalls"
              :key="call.id"
              class="call-option"
              :class="{ selected: selectedCallId === call.id }"
            >
              <input type="radio" :value="call.id" v-model="selectedCallId" hidden />
              <div class="call-option-inner">
                <span class="call-option-name">{{ call.title }}</span>
                <span v-if="call.program" class="call-option-program">{{ call.program.name }}</span>
              </div>
              <svg v-if="selectedCallId === call.id" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="check-icon">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </label>
          </div>
        </template>

        <p v-if="createError" class="error-msg">{{ createError }}</p>

        <div class="modal-actions">
          <button class="btn btn-secondary" @click="showCreateModal = false">{{ $t('applications.form_cancel') }}</button>
          <button
            class="btn btn-primary"
            :disabled="!selectedCallId || creating"
            @click="handleCreate"
          >
            {{ $t('applications.form_submit') }}
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
.apps-page {
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

.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.page-header h1 {
  font-size: clamp(22px, 3vw, 30px);
  font-weight: 800;
  letter-spacing: -0.5px;
  margin: 0 0 6px 0;
}

.subtitle { font-size: 15px; opacity: 0.65; margin: 0; }

/* BUTTONS */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 9px 20px;
  border-radius: 10px;
  border: none;
  font-family: inherit;
  font-size: 13.5px;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.18s, transform 0.15s;
}
.btn:disabled { opacity: 0.45; cursor: not-allowed; }
.btn:not(:disabled):hover { transform: translateY(-1px); }
.btn-primary   { background: var(--main-color); color: #fff; }
.btn-secondary {
  background: var(--menu-color);
  border: 1px solid var(--menu-border);
  color: var(--text-color);
}
.btn-submit { background: var(--good-color); color: #fff; }
.btn-delete {
  background: transparent;
  border: 1px solid var(--error-color);
  color: var(--error-color);
  padding: 7px 16px;
  font-size: 13px;
}

/* STATES */
.state-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  min-height: 240px;
  opacity: 0.6;
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
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 60px 40px;
  background: var(--menu-color);
  border: 1px solid var(--menu-border);
  border-radius: 20px;
  text-align: center;
}
.empty-icon { color: var(--main-color); opacity: 0.4; }
.empty-title { font-size: 17px; font-weight: 800; margin: 0; }
.empty-desc  { font-size: 14px; opacity: 0.6; margin: 0; }

/* LIST */
.apps-list { display: flex; flex-direction: column; gap: 16px; }

.app-card {
  background: var(--menu-color);
  border: 1px solid var(--menu-border);
  border-radius: 16px;
  overflow: hidden;
  transition: border-color 0.2s;
}
.app-card:hover { border-color: var(--main-color); }

.app-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px 12px;
  border-bottom: 1px solid var(--menu-border);
  gap: 8px;
  flex-wrap: wrap;
}

.app-meta { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.app-id { font-size: 12px; opacity: 0.4; font-weight: 700; }

/* STATUS BADGES */
.status-badge {
  font-size: 10.5px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  padding: 3px 10px;
  border-radius: 100px;
}
.status-draft        { background: color-mix(in srgb, var(--wait-color) 15%, transparent); color: var(--wait-color); }
.status-submitted    { background: color-mix(in srgb, #6366f1 15%, transparent); color: #6366f1; }
.status-verified     { background: color-mix(in srgb, #06b6d4 15%, transparent); color: #06b6d4; }
.status-evaluation   { background: color-mix(in srgb, var(--main-color) 15%, transparent); color: var(--main-color-dark); }
.status-supplement   { background: color-mix(in srgb, var(--wait-color) 20%, transparent); color: var(--wait-color); }
.status-approved     { background: color-mix(in srgb, var(--good-color) 15%, transparent); color: var(--good-color); }
.status-rejected     { background: color-mix(in srgb, var(--error-color) 15%, transparent); color: var(--error-color); }
.status-onboarding   { background: color-mix(in srgb, #8b5cf6 15%, transparent); color: #8b5cf6; }
.status-active       { background: color-mix(in srgb, var(--good-color) 15%, transparent); color: var(--good-color); }
.status-suspended    { background: color-mix(in srgb, var(--error-color) 10%, transparent); color: var(--error-color); opacity: 0.8; }
.status-archived     { background: color-mix(in srgb, var(--text-color) 8%, transparent); color: var(--text-color); opacity: 0.6; }

.type-tag {
  font-size: 11px;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 100px;
  background: var(--main-color-light);
  color: var(--main-color-dark);
}

/* BODY */
.app-body { padding: 16px 20px; }

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px 24px;
}

.info-item { display: flex; flex-direction: column; gap: 2px; }
.info-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.7px; opacity: 0.5; }
.info-value { font-size: 14px; font-weight: 600; }
.score-value { color: var(--main-color); }

.decision-comment {
  margin-top: 14px;
  padding: 12px 14px;
  background: var(--bg-color);
  border-radius: 10px;
  border-left: 3px solid var(--main-color);
}
.decision-comment p { margin: 6px 0 0; font-size: 13.5px; opacity: 0.8; line-height: 1.5; }

/* FOOTER */
.app-card-footer {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 20px;
  border-top: 1px solid var(--menu-border);
  background: var(--bg-color);
}

/* MODAL */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
  padding: 20px;
}
.modal-box {
  background: var(--menu-color);
  border: 1px solid var(--menu-border);
  border-radius: 20px;
  padding: 32px;
  width: 100%;
  max-width: 500px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}
.modal-box h3 { margin: 0; font-size: 18px; font-weight: 800; }
.modal-label  { margin: 0; font-size: 13.5px; font-weight: 700; opacity: 0.7; }

.call-options { display: flex; flex-direction: column; gap: 8px; }
.call-option {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 12px;
  border: 1px solid var(--menu-border);
  cursor: pointer;
  transition: border-color 0.18s, background 0.18s;
}
.call-option:hover { border-color: var(--main-color); }
.call-option.selected {
  border-color: var(--main-color);
  background: var(--main-color-light);
}
.call-option-inner { display: flex; flex-direction: column; gap: 2px; flex: 1; }
.call-option-name    { font-size: 14px; font-weight: 700; }
.call-option-program { font-size: 12px; opacity: 0.55; }
.check-icon { color: var(--main-color); flex-shrink: 0; }

.no-calls { font-size: 14px; opacity: 0.6; text-align: center; padding: 20px 0; }

.modal-actions { display: flex; justify-content: flex-end; gap: 10px; }
.error-msg { font-size: 13px; color: var(--error-color); font-weight: 600; margin: 0; }

@media (max-width: 640px) {
  .page-inner { padding: 32px 20px; }
  .info-grid { grid-template-columns: 1fr 1fr; }
}
</style>
