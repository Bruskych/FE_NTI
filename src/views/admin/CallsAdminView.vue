<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useCallsStore } from '@/stores/calls'
import api from '@/core/api/axios'
import type { Call, Program, Specialization } from '@/stores/calls'

const callsStore = useCallsStore()

const programs = ref<Program[]>([])
const specializations = ref<Specialization[]>([])

// Modal state
const showModal = ref(false)
const editingCall = ref<Call | null>(null)

interface CallForm {
  program_id: string
  title: string
  description: string
  deadline: string
  status: 'draft' | 'open' | 'closed'
  budget: string
  specialization_ids: number[]
}

const emptyForm = (): CallForm => ({
  program_id: '',
  title: '',
  description: '',
  deadline: '',
  status: 'draft',
  budget: '',
  specialization_ids: [],
})

const form = ref<CallForm>(emptyForm())
const saving = ref(false)
const formError = ref<string | null>(null)

const modalTitle = computed(() => editingCall.value ? 'Edit Call' : 'New Call')

const formatDate = (d: string | null) => {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('sk-SK', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function openCreate() {
  editingCall.value = null
  form.value = emptyForm()
  formError.value = null
  showModal.value = true
}

function openEdit(call: Call) {
  editingCall.value = call
  form.value = {
    program_id: call.program?.id?.toString() ?? '',
    title: call.title,
    description: call.description ?? '',
    deadline: call.deadline ? call.deadline.slice(0, 10) : '',
    status: call.status,
    budget: call.budget?.toString() ?? '',
    specialization_ids: call.specializations?.map(s => s.id) ?? [],
  }
  formError.value = null
  showModal.value = true
}

function toggleSpec(id: number) {
  const idx = form.value.specialization_ids.indexOf(id)
  if (idx === -1) form.value.specialization_ids.push(id)
  else form.value.specialization_ids.splice(idx, 1)
}

async function handleSave() {
  formError.value = null
  saving.value = true
  try {
    const payload: Record<string, unknown> = {
      program_id: Number(form.value.program_id),
      title: form.value.title,
      description: form.value.description || null,
      deadline: form.value.deadline || null,
      status: form.value.status,
      budget: form.value.budget ? Number(form.value.budget) : null,
      specialization_ids: form.value.specialization_ids,
    }

    if (editingCall.value) {
      await callsStore.updateCall(editingCall.value.id, payload)
    } else {
      await callsStore.createCall(payload)
    }
    showModal.value = false
  } catch (err: unknown) {
    const e = err as { response?: { data?: { message?: string } } }
    formError.value = e.response?.data?.message ?? 'Error saving call'
  } finally {
    saving.value = false
  }
}

async function handleDelete(call: Call) {
  if (!confirm(`Delete call "${call.title}"?`)) return
  try {
    await callsStore.deleteCall(call.id)
  } catch (err: unknown) {
    const e = err as string
    alert(e)
  }
}

async function handleOpen(call: Call) {
  try { await callsStore.openCall(call.id) } catch { /* handled in store */ }
}

async function handleClose(call: Call) {
  try { await callsStore.closeCall(call.id) } catch { /* handled in store */ }
}

onMounted(async () => {
  await callsStore.fetchCalls()
  const [progRes, specRes] = await Promise.all([
    api.get('/programs'),
    api.get('/specializations'),
  ])
  programs.value = progRes.data.data ?? progRes.data
  specializations.value = specRes.data.data ?? specRes.data
})
</script>

<template>
  <div class="calls-admin">

    <div class="view-header">
      <div>
        <h2>{{ $t('adminPanel.calls_management') }}</h2>
        <p class="view-subtitle">{{ $t('adminPanel.calls_management_desc') }}</p>
      </div>
      <button class="btn btn-primary" @click="openCreate">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        {{ $t('adminPanel.new_call') }}
      </button>
    </div>

    <div v-if="callsStore.loading" class="state-box">
      <div class="spinner"></div>
    </div>

    <div v-else-if="!callsStore.calls.length" class="empty-state">
      {{ $t('calls.empty') }}
    </div>

    <div v-else class="calls-table-wrap">
      <table class="calls-table">
        <thead>
          <tr>
            <th>#</th>
            <th>{{ $t('adminPanel.col_title') }}</th>
            <th>{{ $t('adminPanel.col_program') }}</th>
            <th>{{ $t('adminPanel.col_status') }}</th>
            <th>{{ $t('adminPanel.col_deadline') }}</th>
            <th>{{ $t('adminPanel.col_budget') }}</th>
            <th>{{ $t('adminPanel.col_actions') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="call in callsStore.calls" :key="call.id">
            <td class="col-id">{{ call.id }}</td>
            <td class="col-title">{{ call.title }}</td>
            <td class="col-program">
              <span v-if="call.program" class="program-chip">{{ call.program.name }}</span>
              <span v-else class="none">—</span>
            </td>
            <td>
              <span class="status-badge" :class="`s-${call.status}`">
                {{ $t(`calls.status_${call.status}`) }}
              </span>
            </td>
            <td>{{ formatDate(call.deadline) }}</td>
            <td>{{ call.budget ? `€${Number(call.budget).toLocaleString('sk-SK')}` : '—' }}</td>
            <td class="col-actions">
              <button class="icon-btn" title="Edit" @click="openEdit(call)">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              </button>
              <button
                v-if="call.status === 'draft'"
                class="icon-btn icon-btn--green"
                title="Open"
                :disabled="callsStore.actionLoading === call.id"
                @click="handleOpen(call)"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                </svg>
              </button>
              <button
                v-if="call.status === 'open'"
                class="icon-btn icon-btn--orange"
                title="Close"
                :disabled="callsStore.actionLoading === call.id"
                @click="handleClose(call)"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
                </svg>
              </button>
              <button
                class="icon-btn icon-btn--red"
                title="Delete"
                :disabled="callsStore.actionLoading === call.id"
                @click="handleDelete(call)"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
                </svg>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
      <div class="modal-box">
        <h3>{{ modalTitle }}</h3>

        <form @submit.prevent="handleSave" class="call-form">

          <div class="form-row">
            <label>
              {{ $t('adminPanel.form_title') }} *
              <input v-model="form.title" required type="text" />
            </label>
            <label>
              {{ $t('adminPanel.form_status') }}
              <select v-model="form.status">
                <option value="draft">{{ $t('calls.status_draft') }}</option>
                <option value="open">{{ $t('calls.status_open') }}</option>
                <option value="closed">{{ $t('calls.status_closed') }}</option>
              </select>
            </label>
          </div>

          <div class="form-row">
            <label>
              {{ $t('adminPanel.form_program') }} *
              <select v-model="form.program_id" required>
                <option value="" disabled>— {{ $t('adminPanel.form_select') }} —</option>
                <option v-for="p in programs" :key="p.id" :value="p.id.toString()">{{ p.name }}</option>
              </select>
            </label>
            <label>
              {{ $t('adminPanel.form_deadline') }}
              <input v-model="form.deadline" type="date" />
            </label>
          </div>

          <label>
            {{ $t('adminPanel.form_budget') }}
            <input v-model="form.budget" type="number" min="0" step="100" placeholder="€" />
          </label>

          <label>
            {{ $t('adminPanel.form_description') }}
            <textarea v-model="form.description" rows="3"></textarea>
          </label>

          <div v-if="specializations.length" class="spec-picker">
            <span class="spec-picker-label">{{ $t('adminPanel.form_specializations') }}</span>
            <div class="spec-chips">
              <button
                v-for="spec in specializations"
                :key="spec.id"
                type="button"
                class="spec-chip"
                :class="{ selected: form.specialization_ids.includes(spec.id) }"
                @click="toggleSpec(spec.id)"
              >
                {{ spec.name }}
              </button>
            </div>
          </div>

          <p v-if="formError" class="form-error">{{ formError }}</p>

          <div class="form-actions">
            <button type="button" class="btn btn-secondary" @click="showModal = false">{{ $t('adminPanel.cancel') }}</button>
            <button type="submit" class="btn btn-primary" :disabled="saving">{{ $t('adminPanel.save') }}</button>
          </div>
        </form>
      </div>
    </div>

  </div>
</template>

<style scoped>
.calls-admin {
  display: flex;
  flex-direction: column;
  gap: 24px;
  height: 100%;
}

.view-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.view-header h2 {
  margin: 0 0 4px;
  font-size: 20px;
  font-weight: 800;
}

.view-subtitle { font-size: 14px; opacity: 0.6; margin: 0; }

/* BUTTONS */
.btn {
  display: inline-flex; align-items: center; gap: 7px;
  padding: 8px 18px; border-radius: 10px; border: none;
  font-family: inherit; font-size: 13px; font-weight: 700;
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

/* STATE */
.state-box { display: flex; align-items: center; justify-content: center; min-height: 200px; }
.spinner {
  width: 28px; height: 28px;
  border: 4px solid var(--menu-border);
  border-top-color: var(--main-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
.empty-state { text-align: center; padding: 48px; opacity: 0.5; font-size: 14px; }

/* TABLE */
.calls-table-wrap { overflow-x: auto; border-radius: 14px; border: 1px solid var(--menu-border); }

.calls-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13.5px;
}

.calls-table th {
  text-align: left;
  padding: 12px 16px;
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.7px;
  opacity: 0.55;
  background: var(--table-header-bg-color);
  white-space: nowrap;
}

.calls-table td {
  padding: 13px 16px;
  border-top: 1px solid var(--menu-border);
  vertical-align: middle;
}

.calls-table tbody tr:hover td { background: color-mix(in srgb, var(--main-color) 4%, transparent); }

.col-id    { opacity: 0.4; font-weight: 700; width: 40px; }
.col-title { font-weight: 700; max-width: 220px; }
.none      { opacity: 0.35; }

.program-chip {
  font-size: 11px; font-weight: 600; padding: 2px 9px;
  border-radius: 100px;
  background: var(--main-color-light); color: var(--main-color-dark);
}

/* STATUS BADGES */
.status-badge {
  font-size: 10px; font-weight: 700; text-transform: uppercase;
  letter-spacing: 0.8px; padding: 3px 9px; border-radius: 100px;
}
.s-open   { background: color-mix(in srgb, var(--good-color) 15%, transparent); color: var(--good-color); }
.s-draft  { background: color-mix(in srgb, var(--wait-color) 15%, transparent); color: var(--wait-color); }
.s-closed { background: color-mix(in srgb, var(--text-color) 10%, transparent); color: var(--text-color); opacity: 0.7; }

/* ICON BUTTONS */
.col-actions { display: flex; gap: 6px; align-items: center; }

.icon-btn {
  width: 30px; height: 30px;
  display: flex; align-items: center; justify-content: center;
  border-radius: 8px; border: 1px solid var(--menu-border);
  background: var(--menu-color); color: var(--text-color);
  cursor: pointer; transition: background 0.15s, border-color 0.15s, color 0.15s;
}
.icon-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.icon-btn:not(:disabled):hover { border-color: var(--main-color); color: var(--main-color); }
.icon-btn--green:not(:disabled):hover { border-color: var(--good-color); color: var(--good-color); }
.icon-btn--orange:not(:disabled):hover { border-color: var(--wait-color); color: var(--wait-color); }
.icon-btn--red:not(:disabled):hover   { border-color: var(--error-color); color: var(--error-color); }

/* MODAL */
.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.45);
  display: flex; align-items: center; justify-content: center;
  z-index: 999; padding: 20px;
}
.modal-box {
  background: var(--menu-color);
  border: 1px solid var(--menu-border);
  border-radius: 20px; padding: 32px;
  width: 100%; max-width: 580px;
  max-height: 90vh; overflow-y: auto;
}
.modal-box h3 { margin: 0 0 24px; font-size: 18px; font-weight: 800; }

/* FORM */
.call-form { display: flex; flex-direction: column; gap: 16px; }

.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }

.call-form label {
  display: flex; flex-direction: column; gap: 6px;
  font-size: 13px; font-weight: 700;
}

.call-form input,
.call-form select,
.call-form textarea {
  padding: 9px 13px;
  border-radius: 10px;
  border: 1px solid var(--menu-border);
  background: var(--bg-color);
  color: var(--text-color);
  font-family: inherit; font-size: 14px;
  outline: none; resize: vertical;
  transition: border-color 0.18s;
}
.call-form input:focus,
.call-form select:focus,
.call-form textarea:focus { border-color: var(--main-color); }

/* SPEC PICKER */
.spec-picker { display: flex; flex-direction: column; gap: 8px; }
.spec-picker-label { font-size: 13px; font-weight: 700; }
.spec-chips { display: flex; flex-wrap: wrap; gap: 7px; }
.spec-chip {
  padding: 5px 13px; border-radius: 100px;
  border: 1px solid var(--menu-border);
  background: var(--bg-color); color: var(--text-color);
  font-family: inherit; font-size: 12px; font-weight: 600;
  cursor: pointer; transition: border-color 0.15s, background 0.15s;
}
.spec-chip:hover    { border-color: var(--main-color); }
.spec-chip.selected {
  border-color: var(--main-color);
  background: var(--main-color-light);
  color: var(--main-color-dark);
}

.form-error { font-size: 13px; color: var(--error-color); font-weight: 600; margin: 0; }
.form-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 4px; }

@media (max-width: 540px) {
  .form-row { grid-template-columns: 1fr; }
}
</style>
