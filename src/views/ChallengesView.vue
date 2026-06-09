<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useChallengesStore } from '@/stores/challenges'
import { useAuthStore } from '@/stores/auth'
import type { Challenge } from '@/stores/challenges'

const { t } = useI18n()
const challengesStore = useChallengesStore()
const authStore = useAuthStore()

const isCompany = computed(() => authStore.hasAnyRole(['company']))
const isAdmin   = computed(() => authStore.hasAnyRole(['admin', 'super_admin']))
const canManage = computed(() => isCompany.value || isAdmin.value)

const activeFilter = ref<'all' | 'published' | 'active' | 'closed'>('all')

const filteredChallenges = computed(() => {
  if (activeFilter.value === 'all') return challengesStore.challenges
  return challengesStore.challenges.filter(c => c.status === activeFilter.value)
})

const countByFilter = (f: string) => {
  if (f === 'all') return challengesStore.challenges.length
  return challengesStore.challenges.filter(c => c.status === f).length
}

const formatDate = (d: string | null) => {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('sk-SK', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

const formatBudget = (b: number | null) => {
  if (!b) return null
  return new Intl.NumberFormat('sk-SK', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(b)
}

// ---- Form state ----
const showForm = ref(false)
const editingChallenge = ref<Challenge | null>(null)
const formError = ref<string | null>(null)
const formSaving = ref(false)

const emptyForm = () => ({
  title: '',
  description: '',
  technical_specification: '',
  program_id: null as number | null,
  budget: '',
  deadline: '',
  max_applications: '',
  status: 'draft' as string,
  specialization_ids: [] as number[],
})

const form = ref(emptyForm())

function openCreate() {
  editingChallenge.value = null
  form.value = emptyForm()
  formError.value = null
  showForm.value = true
}

function openEdit(challenge: Challenge) {
  editingChallenge.value = challenge
  form.value = {
    title: challenge.title,
    description: challenge.description ?? '',
    technical_specification: challenge.technical_specification ?? '',
    program_id: challenge.program?.id ?? null,
    budget: challenge.budget?.toString() ?? '',
    deadline: challenge.deadline ? challenge.deadline.substring(0, 10) : '',
    max_applications: challenge.max_applications?.toString() ?? '',
    status: challenge.status,
    specialization_ids: challenge.specializations.map(s => s.id),
  }
  formError.value = null
  showForm.value = true
}

async function handleSave() {
  formError.value = null
  formSaving.value = true
  const payload = {
    title: form.value.title,
    description: form.value.description,
    technical_specification: form.value.technical_specification || undefined,
    program_id: form.value.program_id,
    budget: form.value.budget ? Number(form.value.budget) : undefined,
    deadline: form.value.deadline,
    max_applications: Number(form.value.max_applications),
    status: form.value.status,
    specialization_ids: form.value.specialization_ids,
  }
  try {
    if (editingChallenge.value) {
      await challengesStore.updateChallenge(editingChallenge.value.id, payload)
    } else {
      await challengesStore.createChallenge(payload)
    }
    showForm.value = false
  } catch (err: unknown) {
    const e = err as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } }
    const errs = e.response?.data?.errors
    formError.value = errs ? Object.values(errs).flat().join(', ') : (e.response?.data?.message ?? 'Error')
  } finally {
    formSaving.value = false
  }
}

async function handleDelete(challenge: Challenge) {
  if (!confirm(t('challenges.delete_confirm'))) return
  try {
    await challengesStore.deleteChallenge(challenge.id)
  } catch (err: unknown) {
    const e = err as { response?: { data?: { message?: string } } }
    alert(e.response?.data?.message ?? 'Error')
  }
}

function toggleSpec(id: number) {
  const idx = form.value.specialization_ids.indexOf(id)
  if (idx === -1) form.value.specialization_ids.push(id)
  else form.value.specialization_ids.splice(idx, 1)
}

onMounted(async () => {
  await challengesStore.fetchChallenges()
  if (canManage.value && challengesStore.programs.length === 0) {
    await Promise.all([
      challengesStore.fetchPrograms(),
      challengesStore.fetchSpecializations(),
    ])
  }
})
</script>

<template>
  <div class="challenges-page">
    <div class="page-inner">

      <div class="page-header">
        <div>
          <h1>{{ $t('challenges.title') }}</h1>
          <p class="subtitle">{{ $t('challenges.subtitle') }}</p>
        </div>
        <button v-if="canManage" class="btn btn-primary" @click="openCreate">
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          {{ $t('challenges.new_challenge') }}
        </button>
      </div>

      <div class="filter-bar">
        <button
          v-for="f in (['all', 'published', 'active', 'closed'] as const)"
          :key="f"
          class="filter-btn"
          :class="{ active: activeFilter === f }"
          @click="activeFilter = f"
        >
          {{ $t(`challenges.filter_${f}`) }}
          <span class="filter-count">{{ countByFilter(f) }}</span>
        </button>
      </div>

      <div v-if="challengesStore.loading" class="state-box">
        <div class="spinner"></div>
        <p>{{ $t('challenges.loading') }}</p>
      </div>

      <div v-else-if="filteredChallenges.length === 0" class="state-box">
        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="empty-icon">
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
        </svg>
        <p>{{ $t('challenges.empty') }}</p>
      </div>

      <div v-else class="challenges-grid">
        <div
          v-for="ch in filteredChallenges"
          :key="ch.id"
          class="challenge-card"
        >
          <div class="card-top">
            <div class="card-meta">
              <span class="status-badge" :class="`cs-${ch.status}`">
                {{ $t(`challenges.status_${ch.status}`) }}
              </span>
              <span v-if="!ch.has_capacity" class="no-cap-badge">{{ $t('challenges.no_capacity') }}</span>
              <span v-if="ch.program" class="program-tag">{{ ch.program.name }}</span>
            </div>
            <span class="card-id">#{{ ch.id }}</span>
          </div>

          <h3 class="card-title">{{ ch.title }}</h3>

          <p v-if="ch.description" class="card-desc">{{ ch.description }}</p>

          <div v-if="ch.specializations?.length" class="spec-list">
            <span v-for="s in ch.specializations" :key="s.id" class="spec-tag">{{ s.name }}</span>
          </div>

          <div class="card-footer">
            <div class="card-info-row">
              <div v-if="ch.deadline" class="info-item">
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
                <span>{{ $t('challenges.deadline') }}: {{ formatDate(ch.deadline) }}</span>
              </div>
              <div v-if="formatBudget(ch.budget)" class="info-item">
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                </svg>
                <span>{{ formatBudget(ch.budget) }}</span>
              </div>
              <div v-if="ch.applications_count != null" class="info-item">
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                </svg>
                <span>{{ ch.applications_count }} {{ $t('challenges.applications') }}</span>
              </div>
              <div v-if="ch.organization" class="info-item">
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                </svg>
                <span>{{ ch.organization.name }}</span>
              </div>
            </div>

            <div v-if="canManage" class="card-actions">
              <button class="action-btn action-btn--edit" @click="openEdit(ch)">
                {{ $t('challenges.action_edit') }}
              </button>
              <button
                class="action-btn action-btn--delete"
                :disabled="challengesStore.actionLoading === ch.id"
                @click="handleDelete(ch)"
              >
                {{ $t('challenges.action_delete') }}
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>

    <!-- Modal -->
    <div v-if="showForm" class="modal-overlay" @click.self="showForm = false">
      <div class="modal-box">
        <h3>{{ editingChallenge ? $t('challenges.edit_title') : $t('challenges.create_title') }}</h3>

        <form class="challenge-form" @submit.prevent="handleSave">
          <div class="form-row">
            <label class="form-label">{{ $t('challenges.form_title_label') }} *</label>
            <input v-model="form.title" required type="text" class="form-input" />
          </div>

          <div class="form-row">
            <label class="form-label">{{ $t('challenges.form_description') }} *</label>
            <textarea v-model="form.description" required rows="4" class="form-input"></textarea>
          </div>

          <div class="form-row">
            <label class="form-label">{{ $t('challenges.form_technical_spec') }}</label>
            <textarea v-model="form.technical_specification" rows="3" class="form-input"></textarea>
          </div>

          <div class="form-grid">
            <div class="form-row">
              <label class="form-label">{{ $t('challenges.form_program') }} *</label>
              <select v-model="form.program_id" required class="form-input">
                <option :value="null" disabled>{{ $t('challenges.form_program_placeholder') }}</option>
                <option v-for="p in challengesStore.programs" :key="p.id" :value="p.id">{{ p.name }}</option>
              </select>
            </div>

            <div class="form-row">
              <label class="form-label">{{ $t('challenges.form_status') }} *</label>
              <select v-model="form.status" required class="form-input">
                <option value="draft">{{ $t('challenges.status_draft') }}</option>
                <option value="published">{{ $t('challenges.status_published') }}</option>
              </select>
            </div>

            <div class="form-row">
              <label class="form-label">{{ $t('challenges.form_deadline') }} *</label>
              <input v-model="form.deadline" required type="date" class="form-input" />
            </div>

            <div class="form-row">
              <label class="form-label">{{ $t('challenges.form_max_applications') }} *</label>
              <input v-model="form.max_applications" required type="number" min="1" class="form-input" />
            </div>

            <div class="form-row">
              <label class="form-label">{{ $t('challenges.form_budget') }}</label>
              <input v-model="form.budget" type="number" min="0" step="0.01" class="form-input" />
            </div>
          </div>

          <div class="form-row" v-if="challengesStore.specializations.length">
            <label class="form-label">{{ $t('challenges.form_specializations') }} *</label>
            <div class="spec-checkboxes">
              <label
                v-for="s in challengesStore.specializations"
                :key="s.id"
                class="spec-checkbox"
                :class="{ checked: form.specialization_ids.includes(s.id) }"
                @click="toggleSpec(s.id)"
              >
                <span class="check-box">
                  <svg v-if="form.specialization_ids.includes(s.id)" xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </span>
                {{ s.name }}
              </label>
            </div>
          </div>

          <p v-if="formError" class="form-error">{{ formError }}</p>

          <div class="form-actions">
            <button type="button" class="btn btn-secondary" @click="showForm = false">{{ $t('challenges.form_cancel') }}</button>
            <button type="submit" class="btn btn-primary" :disabled="formSaving">
              {{ editingChallenge ? $t('challenges.form_save') : $t('challenges.form_create') }}
            </button>
          </div>
        </form>
      </div>
    </div>

  </div>
</template>

<style scoped>
.challenges-page {
  font-family: var(--font-main), sans-serif;
  background: var(--bg-color);
  min-height: calc(100vh - 75px);
  color: var(--text-color);
}

.page-inner {
  max-width: 1100px;
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
  display: inline-flex; align-items: center; gap: 7px;
  padding: 9px 20px; border-radius: 10px; border: none;
  font-family: inherit; font-size: 13.5px; font-weight: 700;
  cursor: pointer; transition: opacity 0.18s, transform 0.15s;
}
.btn:disabled { opacity: 0.45; cursor: not-allowed; }
.btn:not(:disabled):hover { transform: translateY(-1px); }
.btn-primary   { background: var(--main-color); color: #fff; }
.btn-secondary {
  background: var(--menu-color);
  border: 1px solid var(--menu-border);
  color: var(--text-color);
}

/* FILTERS */
.filter-bar { display: flex; gap: 8px; flex-wrap: wrap; }
.filter-btn {
  display: flex; align-items: center; gap: 7px;
  padding: 8px 16px; border-radius: 100px;
  border: 1px solid var(--menu-border);
  background: var(--menu-color);
  color: var(--text-color);
  font-family: inherit; font-size: 13.5px; font-weight: 600;
  cursor: pointer; transition: border-color 0.18s, background 0.18s;
}
.filter-btn:hover { border-color: var(--main-color); }
.filter-btn.active {
  border-color: var(--main-color);
  background: var(--main-color-light);
  color: var(--main-color-dark);
}
.filter-count {
  font-size: 11px; background: var(--menu-border);
  padding: 1px 7px; border-radius: 100px; font-weight: 700;
}
.filter-btn.active .filter-count {
  background: color-mix(in srgb, var(--main-color) 20%, transparent);
}

/* STATES */
.state-box {
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  gap: 14px; min-height: 240px; opacity: 0.6;
}
.empty-icon { color: var(--main-color); }
.spinner {
  width: 32px; height: 32px;
  border: 5px solid var(--menu-border);
  border-top-color: var(--main-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* GRID */
.challenges-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}

/* CARD */
.challenge-card {
  background: var(--menu-color);
  border: 1px solid var(--menu-border);
  border-radius: 16px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  transition: border-color 0.2s, transform 0.2s;
}
.challenge-card:hover { border-color: var(--main-color); transform: translateY(-2px); }

.card-top {
  display: flex; align-items: center;
  justify-content: space-between; gap: 8px;
}
.card-meta { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
.card-id { font-size: 12px; opacity: 0.4; font-weight: 700; }

/* STATUS BADGES */
.status-badge {
  font-size: 10.5px; font-weight: 700;
  text-transform: uppercase; letter-spacing: 1px;
  padding: 3px 10px; border-radius: 100px;
}
.cs-draft     { background: color-mix(in srgb, var(--wait-color) 15%, transparent); color: var(--wait-color); }
.cs-published { background: color-mix(in srgb, #6366f1 15%, transparent); color: #6366f1; }
.cs-pairing   { background: color-mix(in srgb, var(--main-color) 15%, transparent); color: var(--main-color-dark); }
.cs-assigned  { background: color-mix(in srgb, #06b6d4 15%, transparent); color: #06b6d4; }
.cs-active    { background: color-mix(in srgb, var(--good-color) 15%, transparent); color: var(--good-color); }
.cs-closed    { background: color-mix(in srgb, var(--text-color) 10%, transparent); color: var(--text-color); opacity: 0.7; }

.no-cap-badge {
  font-size: 10.5px; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.8px;
  padding: 3px 10px; border-radius: 100px;
  background: color-mix(in srgb, var(--error-color) 15%, transparent);
  color: var(--error-color);
}

.program-tag {
  font-size: 11px; font-weight: 600;
  padding: 3px 10px; border-radius: 100px;
  background: var(--main-color-light);
  color: var(--main-color-dark);
  border: 1px solid color-mix(in srgb, var(--main-color) 20%, transparent);
}

.card-title { font-size: 17px; font-weight: 700; margin: 0; line-height: 1.35; }
.card-desc {
  font-size: 13.5px; line-height: 1.6; opacity: 0.75; margin: 0;
  display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;
}

.spec-list { display: flex; flex-wrap: wrap; gap: 6px; }
.spec-tag {
  font-size: 11.5px; padding: 3px 10px; border-radius: 6px;
  background: var(--table-header-bg-color);
  color: var(--text-color); opacity: 0.85; font-weight: 600;
}

.card-footer {
  margin-top: auto; display: flex; flex-direction: column;
  gap: 12px; padding-top: 12px;
  border-top: 1px solid var(--menu-border);
}
.card-info-row { display: flex; flex-wrap: wrap; gap: 10px; }
.info-item {
  display: flex; align-items: center; gap: 5px;
  font-size: 12.5px; opacity: 0.7;
}
.info-item svg { flex-shrink: 0; color: var(--main-color); opacity: 1; }

.card-actions { display: flex; gap: 8px; }
.action-btn {
  padding: 6px 14px; border-radius: 8px;
  font-family: inherit; font-size: 12.5px; font-weight: 700;
  cursor: pointer; transition: opacity 0.18s, transform 0.15s;
}
.action-btn:disabled { opacity: 0.45; cursor: not-allowed; }
.action-btn:not(:disabled):hover { transform: translateY(-1px); }
.action-btn--edit {
  background: var(--menu-color);
  border: 1px solid var(--menu-border);
  color: var(--text-color);
}
.action-btn--delete {
  background: transparent;
  border: 1px solid var(--error-color);
  color: var(--error-color);
}

/* MODAL */
.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.45);
  display: flex; align-items: center; justify-content: center;
  z-index: 999; padding: 20px; overflow-y: auto;
}
.modal-box {
  background: var(--menu-color);
  border: 1px solid var(--menu-border);
  border-radius: 20px; padding: 32px;
  width: 100%; max-width: 600px;
  max-height: 90vh; overflow-y: auto;
  margin: auto;
}
.modal-box h3 { margin: 0 0 24px; font-size: 18px; font-weight: 800; }

/* FORM */
.challenge-form { display: flex; flex-direction: column; gap: 18px; }
.form-grid {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 14px;
}
.form-row { display: flex; flex-direction: column; gap: 6px; }
.form-label { font-size: 13px; font-weight: 700; }
.form-input {
  padding: 9px 14px; border-radius: 10px;
  border: 1px solid var(--menu-border);
  background: var(--bg-color); color: var(--text-color);
  font-family: inherit; font-size: 14px;
  outline: none; resize: vertical;
  transition: border-color 0.18s;
}
.form-input:focus { border-color: var(--main-color); }
select.form-input { cursor: pointer; }

.spec-checkboxes { display: flex; flex-wrap: wrap; gap: 8px; }
.spec-checkbox {
  display: flex; align-items: center; gap: 7px;
  padding: 6px 12px; border-radius: 8px;
  border: 1px solid var(--menu-border);
  background: var(--bg-color);
  font-size: 13px; font-weight: 600; cursor: pointer;
  transition: border-color 0.18s, background 0.18s;
}
.spec-checkbox:hover { border-color: var(--main-color); }
.spec-checkbox.checked {
  border-color: var(--main-color);
  background: var(--main-color-light);
  color: var(--main-color-dark);
}
.check-box {
  width: 16px; height: 16px; border-radius: 4px;
  border: 1.5px solid currentColor;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.spec-checkbox.checked .check-box { background: var(--main-color); border-color: var(--main-color); color: #fff; }

.form-error { font-size: 13px; color: var(--error-color); font-weight: 600; margin: 0; }
.form-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 4px; }

@media (max-width: 640px) {
  .page-inner { padding: 32px 20px; }
  .challenges-grid { grid-template-columns: 1fr; }
  .form-grid { grid-template-columns: 1fr; }
}
</style>
