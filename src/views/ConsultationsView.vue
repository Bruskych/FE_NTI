<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useConsultationsStore } from '@/stores/consultations'
import { useMentorshipsStore } from '@/stores/mentorships'
import { useAuthStore } from '@/stores/auth'
import api from '@/core/api/axios'

const store = useConsultationsStore()
const mentorshipsStore = useMentorshipsStore()
const authStore = useAuthStore()

const isMentor = computed(() =>
  authStore.hasAnyRole(['mentor', 'admin', 'super_admin'])
)

// ─── Tabs ───────────────────────────────────────────────────────────────────

type Tab = 'all' | 'upcoming' | 'completed'
const activeTab = ref<Tab>('all')

const filtered = computed(() => {
  if (activeTab.value === 'upcoming') return store.consultations.filter(c => c.is_upcoming && !c.is_completed)
  if (activeTab.value === 'completed') return store.consultations.filter(c => c.is_completed)
  return store.consultations
})

// ─── Milestones loader (per mentorship) ─────────────────────────────────────

interface MilestoneOption { id: number; title: string; status: string }
const milestonesLoading = ref(false)
const milestoneOptions = ref<MilestoneOption[]>([])

async function loadMilestones(mentorshipId: number) {
  const ms = mentorshipsStore.mentorships.find(m => m.id === mentorshipId)
  if (!ms?.project?.id) { milestoneOptions.value = []; return }
  milestonesLoading.value = true
  try {
    const { data } = await api.get(`/projects/${ms.project.id}/milestones`)
    milestoneOptions.value = Array.isArray(data.data) ? data.data : data
  } catch {
    milestoneOptions.value = []
  } finally {
    milestonesLoading.value = false
  }
}

// ─── Create modal ────────────────────────────────────────────────────────────

const showCreate = ref(false)
const createError = ref<string | null>(null)

const createForm = ref({
  mentorship_id: null as number | null,
  milestone_id: null as number | null,
  scheduled_at: '',
})

function openCreate() {
  createForm.value = { mentorship_id: null, milestone_id: null, scheduled_at: '' }
  milestoneOptions.value = []
  createError.value = null
  showCreate.value = true
}

async function onMentorshipChange() {
  createForm.value.milestone_id = null
  if (createForm.value.mentorship_id) {
    await loadMilestones(createForm.value.mentorship_id)
  } else {
    milestoneOptions.value = []
  }
}

async function submitCreate() {
  if (!createForm.value.mentorship_id || !createForm.value.scheduled_at) return
  createError.value = null
  try {
    await store.createConsultation({
      mentorship_id: createForm.value.mentorship_id,
      milestone_id: createForm.value.milestone_id ?? undefined,
      scheduled_at: createForm.value.scheduled_at,
    })
    showCreate.value = false
  } catch {
    createError.value = 'Failed to create consultation.'
  }
}

// ─── Edit modal ──────────────────────────────────────────────────────────────

const showEdit = ref(false)
const editId = ref<number | null>(null)
const editError = ref<string | null>(null)

const editForm = ref({
  scheduled_at: '',
  notes: '',
  recommendations: '',
  is_completed: false,
})

function openEdit(c: typeof store.consultations[0]) {
  editId.value = c.id
  editForm.value = {
    scheduled_at: c.scheduled_at ? toDatetimeLocal(c.scheduled_at) : '',
    notes: c.notes ?? '',
    recommendations: c.recommendations ?? '',
    is_completed: c.is_completed,
  }
  editError.value = null
  showEdit.value = true
}

async function submitEdit() {
  if (!editId.value) return
  editError.value = null
  try {
    const payload: Record<string, string | null> = {
      notes: editForm.value.notes || null,
      recommendations: editForm.value.recommendations || null,
    }
    if (editForm.value.scheduled_at && !editForm.value.is_completed) {
      payload.scheduled_at = new Date(editForm.value.scheduled_at).toISOString()
    }
    if (editForm.value.is_completed) {
      payload.completed_at = new Date().toISOString()
    }
    await store.updateConsultation(editId.value, payload)
    showEdit.value = false
  } catch {
    editError.value = 'Failed to save changes.'
  }
}

// ─── Delete ──────────────────────────────────────────────────────────────────

const deleteTarget = ref<number | null>(null)

async function confirmDelete() {
  if (!deleteTarget.value) return
  await store.deleteConsultation(deleteTarget.value)
  deleteTarget.value = null
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(d: string | null) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('sk-SK', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function toDatetimeLocal(iso: string) {
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function mentorshipLabel(id: number) {
  const ms = mentorshipsStore.mentorships.find(m => m.id === id)
  return ms?.project?.title ?? `#${id}`
}

onMounted(async () => {
  await Promise.all([store.fetchConsultations(), mentorshipsStore.fetchMentorships()])
})
</script>

<template>
  <div class="consultations-page">
    <div class="page-inner">

      <!-- Header -->
      <div class="page-header">
        <div class="header-text">
          <h1>{{ $t('consultations.title') }}</h1>
          <p class="subtitle">{{ $t('consultations.subtitle') }}</p>
        </div>
        <button v-if="isMentor" class="btn-primary" @click="openCreate">
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          {{ $t('consultations.create_btn') }}
        </button>
      </div>

      <!-- Tabs -->
      <div class="tabs">
        <button
          v-for="tab in (['all', 'upcoming', 'completed'] as const)"
          :key="tab"
          class="tab-btn"
          :class="{ active: activeTab === tab }"
          @click="activeTab = tab"
        >
          {{ $t(`consultations.tab_${tab}`) }}
          <span class="tab-count">
            {{
              tab === 'all' ? store.consultations.length
              : tab === 'upcoming' ? store.consultations.filter(c => c.is_upcoming && !c.is_completed).length
              : store.consultations.filter(c => c.is_completed).length
            }}
          </span>
        </button>
      </div>

      <!-- Loading -->
      <div v-if="store.loading" class="state-box">
        <div class="spinner"></div>
        <p>{{ $t('consultations.loading') }}</p>
      </div>

      <!-- Empty -->
      <div v-else-if="filtered.length === 0" class="empty-card">
        <svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" class="empty-icon">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
        <p class="empty-title">{{ $t('consultations.empty') }}</p>
        <p class="empty-desc">{{ $t('consultations.empty_desc') }}</p>
      </div>

      <!-- List -->
      <div v-else class="consultation-list">
        <div
          v-for="c in filtered"
          :key="c.id"
          class="c-card"
          :class="{ 'c-completed': c.is_completed, 'c-upcoming': c.is_upcoming && !c.is_completed }"
        >
          <!-- Status strip -->
          <div class="c-strip"></div>

          <div class="c-body">
            <!-- Top row -->
            <div class="c-top">
              <div class="c-left">
                <span class="status-badge" :class="c.is_completed ? 'badge-done' : c.is_upcoming ? 'badge-upcoming' : 'badge-pending'">
                  {{ $t(c.is_completed ? 'consultations.status_completed' : c.is_upcoming ? 'consultations.status_upcoming' : 'consultations.status_pending') }}
                </span>
                <span class="c-date">
                  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                  </svg>
                  {{ formatDate(c.scheduled_at) }}
                </span>
              </div>
              <div v-if="isMentor" class="c-actions">
                <button class="action-btn" @click="openEdit(c)" title="Edit">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                </button>
                <button class="action-btn action-delete" @click="deleteTarget = c.id" title="Delete">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                    <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
                  </svg>
                </button>
              </div>
            </div>

            <!-- Meta row -->
            <div class="c-meta">
              <span v-if="c.mentor" class="meta-item">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>
                {{ c.mentor.name }}
              </span>
              <span v-if="c.milestone" class="meta-item meta-milestone">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
                {{ c.milestone.title }}
              </span>
              <span v-if="c.completed_at" class="meta-item meta-completed">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                {{ formatDate(c.completed_at) }}
              </span>
            </div>

            <!-- Notes / Recommendations -->
            <div v-if="c.notes || c.recommendations" class="c-details">
              <div v-if="c.notes" class="detail-block">
                <span class="detail-label">{{ $t('consultations.field_notes') }}</span>
                <p class="detail-text">{{ c.notes }}</p>
              </div>
              <div v-if="c.recommendations" class="detail-block">
                <span class="detail-label">{{ $t('consultations.field_recommendations') }}</span>
                <p class="detail-text">{{ c.recommendations }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>

  <!-- Create modal -->
  <Teleport to="body">
    <div v-if="showCreate" class="modal-overlay" @click.self="showCreate = false">
      <div class="modal">
        <div class="modal-header">
          <h2>{{ $t('consultations.create_title') }}</h2>
          <button class="modal-close" @click="showCreate = false">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div class="modal-body">
          <div class="form-group">
            <label>{{ $t('consultations.field_mentorship') }}</label>
            <select v-model="createForm.mentorship_id" @change="onMentorshipChange">
              <option :value="null" disabled>{{ $t('consultations.field_mentorship_placeholder') }}</option>
              <option v-for="ms in mentorshipsStore.mentorships" :key="ms.id" :value="ms.id">
                {{ ms.project?.title ?? `#${ms.id}` }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label>{{ $t('consultations.field_milestone') }}</label>
            <select v-model="createForm.milestone_id" :disabled="!createForm.mentorship_id || milestonesLoading">
              <option :value="null">{{ $t('consultations.field_milestone_none') }}</option>
              <option v-for="ml in milestoneOptions" :key="ml.id" :value="ml.id">
                {{ ml.title }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label>{{ $t('consultations.field_scheduled_at') }}</label>
            <input type="datetime-local" v-model="createForm.scheduled_at" />
          </div>

          <p v-if="createError" class="form-error">{{ createError }}</p>
        </div>

        <div class="modal-footer">
          <button class="btn-secondary" @click="showCreate = false">{{ $t('consultations.cancel') }}</button>
          <button
            class="btn-primary"
            :disabled="!createForm.mentorship_id || !createForm.scheduled_at || store.saving"
            @click="submitCreate"
          >
            {{ store.saving ? '...' : $t('consultations.save') }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>

  <!-- Edit modal -->
  <Teleport to="body">
    <div v-if="showEdit" class="modal-overlay" @click.self="showEdit = false">
      <div class="modal">
        <div class="modal-header">
          <h2>{{ $t('consultations.edit_title') }}</h2>
          <button class="modal-close" @click="showEdit = false">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div class="modal-body">
          <div v-if="!editForm.is_completed" class="form-group">
            <label>{{ $t('consultations.field_scheduled_at') }}</label>
            <input type="datetime-local" v-model="editForm.scheduled_at" />
          </div>

          <div class="form-group">
            <label>{{ $t('consultations.field_notes') }}</label>
            <textarea v-model="editForm.notes" rows="3" :placeholder="$t('consultations.field_notes_placeholder')"></textarea>
          </div>

          <div class="form-group">
            <label>{{ $t('consultations.field_recommendations') }}</label>
            <textarea v-model="editForm.recommendations" rows="3" :placeholder="$t('consultations.field_recommendations_placeholder')"></textarea>
          </div>

          <div v-if="!editForm.is_completed" class="form-group form-check">
            <label class="check-label">
              <input type="checkbox" v-model="editForm.is_completed" />
              <span>{{ $t('consultations.mark_completed') }}</span>
            </label>
          </div>

          <p v-if="editError" class="form-error">{{ editError }}</p>
        </div>

        <div class="modal-footer">
          <button class="btn-secondary" @click="showEdit = false">{{ $t('consultations.cancel') }}</button>
          <button class="btn-primary" :disabled="store.saving" @click="submitEdit">
            {{ store.saving ? '...' : $t('consultations.save') }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>

  <!-- Delete confirm -->
  <Teleport to="body">
    <div v-if="deleteTarget" class="modal-overlay" @click.self="deleteTarget = null">
      <div class="modal modal-sm">
        <div class="modal-header">
          <h2>{{ $t('consultations.delete_confirm') }}</h2>
          <button class="modal-close" @click="deleteTarget = null">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="deleteTarget = null">{{ $t('consultations.cancel') }}</button>
          <button class="btn-danger" @click="confirmDelete">{{ $t('consultations.delete_yes') }}</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.consultations-page {
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
  gap: 28px;
}

/* HEADER */
.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}
.header-text h1 {
  font-size: clamp(22px, 3vw, 30px);
  font-weight: 800;
  letter-spacing: -0.5px;
  margin: 0 0 6px;
}
.subtitle { font-size: 15px; opacity: 0.65; margin: 0; }

/* BUTTONS */
.btn-primary {
  display: flex; align-items: center; gap: 7px;
  padding: 9px 18px;
  background: var(--main-color);
  color: #fff;
  border: none; border-radius: 10px;
  font-family: var(--font-main), sans-serif;
  font-size: 13.5px; font-weight: 700;
  cursor: pointer;
  transition: opacity 0.15s;
  white-space: nowrap;
}
.btn-primary:hover:not(:disabled) { opacity: 0.85; }
.btn-primary:disabled { opacity: 0.5; cursor: default; }

.btn-secondary {
  padding: 9px 18px;
  background: transparent;
  border: 1.5px solid var(--menu-border);
  border-radius: 10px;
  font-family: var(--font-main), sans-serif;
  font-size: 13.5px; font-weight: 600;
  color: var(--text-color);
  cursor: pointer;
  transition: border-color 0.15s;
}
.btn-secondary:hover { border-color: var(--main-color); }

.btn-danger {
  padding: 9px 18px;
  background: var(--error-color);
  color: #fff;
  border: none; border-radius: 10px;
  font-family: var(--font-main), sans-serif;
  font-size: 13.5px; font-weight: 700;
  cursor: pointer;
  transition: opacity 0.15s;
}
.btn-danger:hover { opacity: 0.85; }

/* TABS */
.tabs {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}
.tab-btn {
  display: flex; align-items: center; gap: 7px;
  padding: 7px 16px;
  background: var(--menu-color);
  border: 1.5px solid var(--menu-border);
  border-radius: 100px;
  font-family: var(--font-main), sans-serif;
  font-size: 13px; font-weight: 600;
  color: var(--text-color);
  cursor: pointer;
  transition: border-color 0.15s, color 0.15s;
}
.tab-btn.active {
  border-color: var(--main-color);
  color: var(--main-color);
}
.tab-count {
  font-size: 11px;
  background: var(--menu-border);
  border-radius: 100px;
  padding: 1px 7px;
  font-weight: 700;
}
.tab-btn.active .tab-count {
  background: color-mix(in srgb, var(--main-color) 15%, transparent);
  color: var(--main-color);
}

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
  border-radius: 20px;
  text-align: center;
}
.empty-icon { color: var(--main-color); opacity: 0.4; }
.empty-title { font-size: 17px; font-weight: 800; margin: 0; }
.empty-desc { font-size: 14px; opacity: 0.6; margin: 0; }

/* LIST */
.consultation-list { display: flex; flex-direction: column; gap: 12px; }

/* CARD */
.c-card {
  display: flex;
  background: var(--menu-color);
  border: 1px solid var(--menu-border);
  border-radius: 16px;
  overflow: hidden;
  transition: border-color 0.2s;
}
.c-card:hover { border-color: var(--main-color); }

.c-strip {
  width: 4px;
  flex-shrink: 0;
  background: var(--menu-border);
}
.c-upcoming .c-strip  { background: var(--main-color); }
.c-completed .c-strip { background: var(--good-color); }

.c-body { flex: 1; padding: 18px 20px; display: flex; flex-direction: column; gap: 10px; }

/* TOP ROW */
.c-top {
  display: flex; align-items: center;
  justify-content: space-between; gap: 12px;
}
.c-left { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }

.status-badge {
  font-size: 10.5px; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.8px;
  padding: 3px 10px; border-radius: 100px;
}
.badge-done     { background: color-mix(in srgb, var(--good-color) 15%, transparent); color: var(--good-color); }
.badge-upcoming { background: color-mix(in srgb, var(--main-color) 15%, transparent); color: var(--main-color-dark); }
.badge-pending  { background: color-mix(in srgb, var(--text-color) 10%, transparent); color: var(--text-color); opacity: 0.7; }

.c-date {
  display: flex; align-items: center; gap: 5px;
  font-size: 13.5px; font-weight: 600;
}

/* ACTIONS */
.c-actions { display: flex; gap: 6px; }
.action-btn {
  display: flex; align-items: center; justify-content: center;
  width: 30px; height: 30px;
  background: transparent;
  border: 1.5px solid var(--menu-border);
  border-radius: 8px;
  color: var(--text-color);
  cursor: pointer;
  transition: border-color 0.15s, color 0.15s;
}
.action-btn:hover { border-color: var(--main-color); color: var(--main-color); }
.action-delete:hover { border-color: var(--error-color); color: var(--error-color); }

/* META */
.c-meta { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; }
.meta-item {
  display: flex; align-items: center; gap: 5px;
  font-size: 12.5px; opacity: 0.6;
}
.meta-completed { color: var(--good-color); opacity: 0.85; }
.meta-milestone { color: var(--wait-color); opacity: 0.85; }

/* DETAILS */
.c-details { display: flex; flex-direction: column; gap: 8px; padding-top: 4px; border-top: 1px solid var(--menu-border); }
.detail-block { display: flex; flex-direction: column; gap: 3px; }
.detail-label { font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.6px; opacity: 0.5; }
.detail-text  { font-size: 13.5px; line-height: 1.5; margin: 0; opacity: 0.8; }

/* MODAL */
.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000;
  padding: 20px;
}
.modal {
  background: var(--bg-color);
  border: 1px solid var(--menu-border);
  border-radius: 20px;
  width: 100%; max-width: 480px;
  display: flex; flex-direction: column;
  overflow: hidden;
}
.modal-sm { max-width: 360px; }

.modal-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 20px 24px 16px;
  border-bottom: 1px solid var(--menu-border);
}
.modal-header h2 { margin: 0; font-size: 17px; font-weight: 800; }
.modal-close {
  display: flex; align-items: center; justify-content: center;
  width: 32px; height: 32px;
  background: transparent; border: none;
  border-radius: 8px;
  color: var(--text-color); cursor: pointer;
  opacity: 0.5; transition: opacity 0.15s;
}
.modal-close:hover { opacity: 1; }

.modal-body { padding: 20px 24px; display: flex; flex-direction: column; gap: 16px; }
.modal-footer {
  display: flex; justify-content: flex-end; gap: 10px;
  padding: 16px 24px;
  border-top: 1px solid var(--menu-border);
}

/* FORM */
.form-group { display: flex; flex-direction: column; gap: 6px; }
.form-group label {
  font-size: 12px; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.6px;
  opacity: 0.6;
}
.form-group input,
.form-group select,
.form-group textarea {
  padding: 9px 12px;
  background: var(--menu-color);
  border: 1.5px solid var(--menu-border);
  border-radius: 10px;
  font-family: var(--font-main), sans-serif;
  font-size: 13.5px;
  color: var(--text-color);
  outline: none;
  transition: border-color 0.15s;
  resize: vertical;
}
.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus { border-color: var(--main-color); }
.form-group select:disabled { opacity: 0.5; }

.form-check { flex-direction: row; align-items: center; }
.check-label {
  display: flex; align-items: center; gap: 8px;
  cursor: pointer;
  font-size: 13.5px !important;
  font-weight: 600 !important;
  text-transform: none !important;
  letter-spacing: 0 !important;
  opacity: 1 !important;
}
.check-label input[type="checkbox"] { width: 16px; height: 16px; cursor: pointer; accent-color: var(--main-color); }

.form-error { font-size: 13px; color: var(--error-color); margin: 0; }

@media (max-width: 640px) {
  .page-inner { padding: 32px 20px; }
  .page-header { flex-direction: column; }
  .c-top { flex-direction: column; align-items: flex-start; }
}
</style>
