<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useEmailTemplatesStore, type EmailTemplate } from '@/stores/emailTemplates'
import { useNotificationStore } from '@/stores/notifications'

const { t } = useI18n()
const store = useEmailTemplatesStore()
const notif = useNotificationStore()

// ── Search ──────────────────────────────────────────────────
const search = ref('')
const filtered = computed(() => {
  const q = search.value.toLowerCase()
  if (!q) return store.templates
  return store.templates.filter(
    t => t.name.toLowerCase().includes(q) || t.subject.toLowerCase().includes(q)
  )
})

// ── Modal state ─────────────────────────────────────────────
const showModal = ref(false)
const editing = ref<EmailTemplate | null>(null)

const formName    = ref('')
const formSubject = ref('')
const formBody    = ref('')
const formVars    = ref<string[]>([])
const varInput    = ref('')
const formError   = ref<string | null>(null)

function openCreate() {
  editing.value = null
  formName.value    = ''
  formSubject.value = ''
  formBody.value    = ''
  formVars.value    = []
  varInput.value    = ''
  formError.value   = null
  showModal.value   = true
}

function openEdit(tmpl: EmailTemplate) {
  editing.value     = tmpl
  formName.value    = tmpl.name
  formSubject.value = tmpl.subject
  formBody.value    = tmpl.body
  formVars.value    = tmpl.variables ? [...tmpl.variables] : []
  varInput.value    = ''
  formError.value   = null
  showModal.value   = true
}

function closeModal() {
  showModal.value = false
  editing.value   = null
}

function addVar() {
  const v = varInput.value.trim().replace(/[^a-zA-Z0-9_]/g, '')
  if (v && !formVars.value.includes(v)) formVars.value.push(v)
  varInput.value = ''
}

function onVarKey(e: KeyboardEvent) {
  if (e.key === 'Enter' || e.key === ',') {
    e.preventDefault()
    addVar()
  }
}

function removeVar(v: string) {
  formVars.value = formVars.value.filter(x => x !== v)
}

function insertVar(v: string) {
  formBody.value += `{{ ${v} }}`
}

async function handleSubmit() {
  if (!formName.value.trim() || !formSubject.value.trim() || !formBody.value.trim()) {
    formError.value = t('emailTemplates.validation')
    return
  }
  formError.value = null
  const payload = {
    name:          formName.value.trim(),
    subject:       formSubject.value.trim(),
    body:          formBody.value.trim(),
    variables_json: formVars.value.length ? formVars.value : undefined,
  }
  try {
    if (editing.value) {
      await store.updateTemplate(editing.value.id, payload)
      notif.add(t('emailTemplates.updated'), 'success')
    } else {
      await store.createTemplate(payload)
      notif.add(t('emailTemplates.created'), 'success')
    }
    closeModal()
  } catch (err: unknown) {
    const e = err as { response?: { data?: { errors?: Record<string, string[]>; message?: string } } }
    const errors = e.response?.data?.errors
    formError.value = errors
      ? Object.values(errors).flat().join(' ')
      : e.response?.data?.message || t('emailTemplates.validation')
  }
}

// ── Delete ───────────────────────────────────────────────────
const confirmDelete = ref<EmailTemplate | null>(null)

async function handleDelete() {
  if (!confirmDelete.value) return
  try {
    await store.deleteTemplate(confirmDelete.value.id)
    notif.add(t('emailTemplates.deleted'), 'success')
    confirmDelete.value = null
  } catch {
    // interceptor handles
  }
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('sk-SK', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function varDisplay(v: string) {
  return '{{ ' + v + ' }}'
}

onMounted(() => store.fetchTemplates())
</script>

<template>
  <div>
  <div class="et-page">

    <!-- Header -->
    <div class="page-header">
      <div>
        <h1>{{ $t('emailTemplates.title') }}</h1>
        <p class="subtitle">{{ $t('emailTemplates.subtitle') }}</p>
      </div>
      <button class="btn-new" @click="openCreate">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        {{ $t('emailTemplates.new') }}
      </button>
    </div>

    <!-- Search -->
    <div class="search-bar">
      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="search-icon">
        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
      <input v-model="search" type="text" class="search-input" :placeholder="$t('emailTemplates.search_placeholder')" />
    </div>

    <!-- Loading -->
    <div v-if="store.loading" class="state-box">
      <div class="spinner"></div>
      <p>{{ $t('emailTemplates.loading') }}</p>
    </div>

    <!-- Empty -->
    <div v-else-if="filtered.length === 0" class="empty-box">
      <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" class="empty-icon">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
        <polyline points="22,6 12,13 2,6"/>
      </svg>
      <p>{{ search ? $t('emailTemplates.no_results') : $t('emailTemplates.empty') }}</p>
    </div>

    <!-- Template list -->
    <div v-else class="tmpl-list">
      <div v-for="tmpl in filtered" :key="tmpl.id" class="tmpl-row">
        <div class="tmpl-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
            <polyline points="22,6 12,13 2,6"/>
          </svg>
        </div>
        <div class="tmpl-info">
          <div class="tmpl-name-row">
            <span class="tmpl-name">{{ tmpl.name }}</span>
            <div v-if="tmpl.variables?.length" class="var-chips">
              <span v-for="v in tmpl.variables" :key="v" class="var-chip">{{ varDisplay(v) }}</span>
            </div>
          </div>
          <p class="tmpl-subject">{{ tmpl.subject }}</p>
          <p class="tmpl-preview">{{ tmpl.body.slice(0, 120) }}{{ tmpl.body.length > 120 ? '…' : '' }}</p>
        </div>
        <div class="tmpl-meta">
          <span class="tmpl-date">{{ formatDate(tmpl.updated_at) }}</span>
          <div class="tmpl-actions">
            <button class="action-btn action-edit" @click="openEdit(tmpl)" :title="$t('emailTemplates.edit')">
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </button>
            <button class="action-btn action-delete" @click="confirmDelete = tmpl" :title="$t('emailTemplates.delete')">
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

  </div>

  <!-- Create / Edit Modal -->
  <teleport to="body">
    <transition name="modal-fade">
      <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
        <div class="modal-box">
          <div class="modal-header">
            <h3>{{ editing ? $t('emailTemplates.edit_title') : $t('emailTemplates.create_title') }}</h3>
            <button class="modal-close" @click="closeModal">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          <div class="modal-body">
            <div class="form-group">
              <label>{{ $t('emailTemplates.field_name') }}</label>
              <input v-model="formName" type="text" class="form-input" :placeholder="$t('emailTemplates.field_name_placeholder')" />
            </div>

            <div class="form-group">
              <label>{{ $t('emailTemplates.field_subject') }}</label>
              <input v-model="formSubject" type="text" class="form-input" :placeholder="$t('emailTemplates.field_subject_placeholder')" />
            </div>

            <div class="form-group">
              <label>{{ $t('emailTemplates.field_vars') }}</label>
              <p class="field-hint">{{ $t('emailTemplates.field_vars_hint') }}</p>
              <div class="var-input-row">
                <input
                  v-model="varInput"
                  type="text"
                  class="form-input var-text-input"
                  :placeholder="$t('emailTemplates.field_vars_placeholder')"
                  @keydown="onVarKey"
                />
                <button class="btn-add-var" type="button" @click="addVar">+</button>
              </div>
              <div v-if="formVars.length" class="var-tags">
                <span
                  v-for="v in formVars"
                  :key="v"
                  class="var-tag"
                  @click="insertVar(v)"
                  :title="$t('emailTemplates.var_insert_hint')"
                >
                  {{ varDisplay(v) }}
                  <button type="button" class="var-tag-remove" @click.stop="removeVar(v)">×</button>
                </span>
              </div>
            </div>

            <div class="form-group">
              <label>{{ $t('emailTemplates.field_body') }}</label>
              <textarea
                v-model="formBody"
                class="form-textarea"
                rows="10"
                :placeholder="$t('emailTemplates.field_body_placeholder')"
              ></textarea>
            </div>

            <p v-if="formError" class="form-error">{{ formError }}</p>
          </div>

          <div class="modal-footer">
            <button class="btn-cancel" @click="closeModal">{{ $t('challenges.form_cancel') }}</button>
            <button class="btn-save" :disabled="store.saving" @click="handleSubmit">
              <svg v-if="store.saving" class="spin" xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
              </svg>
              {{ store.saving ? $t('emailTemplates.saving') : $t('emailTemplates.save') }}
            </button>
          </div>
        </div>
      </div>
    </transition>
  </teleport>

  <!-- Delete confirm -->
  <teleport to="body">
    <transition name="modal-fade">
      <div v-if="confirmDelete" class="modal-overlay" @click.self="confirmDelete = null">
        <div class="modal-box modal-sm">
          <div class="modal-header">
            <h3>{{ $t('emailTemplates.delete_title') }}</h3>
            <button class="modal-close" @click="confirmDelete = null">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          <div class="modal-body">
            <p>{{ $t('emailTemplates.delete_confirm', { name: confirmDelete?.name }) }}</p>
          </div>
          <div class="modal-footer">
            <button class="btn-cancel" @click="confirmDelete = null">{{ $t('challenges.form_cancel') }}</button>
            <button class="btn-delete" @click="handleDelete">{{ $t('emailTemplates.delete') }}</button>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
  </div>
</template>

<style scoped>
.et-page {
  display: flex;
  flex-direction: column;
  gap: 24px;
  font-family: var(--font-main), sans-serif;
  color: var(--text-color);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
}
.page-header h1 {
  font-size: clamp(20px, 2.5vw, 26px);
  font-weight: 800;
  letter-spacing: -0.5px;
  margin: 0 0 6px;
}
.subtitle { font-size: 14px; opacity: 0.6; margin: 0; }

.btn-new {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 10px 20px;
  background: var(--main-color);
  color: #fff;
  border: none;
  border-radius: 10px;
  font-family: inherit;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
  transition: opacity 0.15s;
}
.btn-new:hover { opacity: 0.88; }

/* Search */
.search-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  background: var(--menu-color);
  border: 1px solid var(--menu-border);
  border-radius: 10px;
  padding: 0 14px;
}
.search-icon { opacity: 0.4; flex-shrink: 0; }
.search-input {
  flex: 1;
  background: none;
  border: none;
  outline: none;
  padding: 11px 0;
  font-family: inherit;
  font-size: 14px;
  color: var(--text-color);
}

/* States */
.state-box {
  display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 40px; opacity: 0.6;
}
.spinner {
  width: 26px; height: 26px;
  border: 3px solid var(--menu-border);
  border-top-color: var(--main-color);
  border-radius: 50%;
  animation: spin-anim 0.9s linear infinite;
}
.empty-box {
  display: flex; flex-direction: column; align-items: center; gap: 10px; padding: 48px; opacity: 0.5;
}
.empty-icon { opacity: 0.5; }

/* Template list */
.tmpl-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.tmpl-row {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  background: var(--menu-color);
  border: 1px solid var(--menu-border);
  border-radius: 14px;
  padding: 18px 20px;
  transition: border-color 0.15s;
}
.tmpl-row:hover { border-color: color-mix(in srgb, var(--main-color) 40%, var(--menu-border)); }

.tmpl-icon {
  flex-shrink: 0;
  width: 38px; height: 38px;
  background: color-mix(in srgb, var(--main-color) 12%, transparent);
  color: var(--main-color);
  border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
}

.tmpl-info { flex: 1; min-width: 0; }

.tmpl-name-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 4px;
}
.tmpl-name { font-size: 15px; font-weight: 800; }

.var-chips { display: flex; flex-wrap: wrap; gap: 4px; }
.var-chip {
  font-size: 10px;
  font-weight: 700;
  font-family: monospace;
  padding: 2px 7px;
  background: color-mix(in srgb, var(--main-color) 12%, transparent);
  color: var(--main-color);
  border-radius: 5px;
}

.tmpl-subject { font-size: 13px; font-weight: 600; opacity: 0.7; margin: 0 0 4px; }
.tmpl-preview { font-size: 12.5px; opacity: 0.45; margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.tmpl-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
  flex-shrink: 0;
}
.tmpl-date { font-size: 11.5px; opacity: 0.4; }

.tmpl-actions { display: flex; gap: 6px; }

.action-btn {
  width: 32px; height: 32px;
  display: flex; align-items: center; justify-content: center;
  border-radius: 8px;
  border: 1.5px solid var(--menu-border);
  background: transparent;
  color: var(--text-color);
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s, color 0.15s;
}
.action-edit:hover  { background: color-mix(in srgb, var(--main-color) 12%, transparent); border-color: var(--main-color); color: var(--main-color); }
.action-delete:hover { background: var(--error-color); border-color: var(--error-color); color: #fff; }

/* Modal */
.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1001;
  padding: 20px;
  color: var(--text-color);
}
.modal-box {
  background: var(--menu-color);
  border-radius: 18px;
  width: 100%;
  max-width: 640px;
  max-height: calc(100vh - 40px);
  display: flex;
  flex-direction: column;
  box-shadow: 0 24px 64px rgba(0,0,0,0.35);
  animation: modal-in 0.18s ease;
}
.modal-sm { max-width: 420px; }

@keyframes modal-in {
  from { opacity: 0; transform: translateY(10px) scale(0.98); }
  to   { opacity: 1; transform: none; }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px 16px;
  border-bottom: 1px solid var(--menu-border);
  flex-shrink: 0;
}
.modal-header h3 { font-size: 16px; font-weight: 800; margin: 0; }
.modal-close {
  background: none; border: none; cursor: pointer;
  color: var(--text-color); opacity: 0.5;
  padding: 4px; border-radius: 6px; display: flex;
}
.modal-close:hover { opacity: 1; }

.modal-body {
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow-y: auto;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.form-group label {
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.7px;
  opacity: 0.55;
}
.field-hint { font-size: 12px; opacity: 0.55; margin: 0; }

.form-input, .form-textarea {
  width: 100%;
  box-sizing: border-box;
  padding: 10px 13px;
  background: var(--bg-color);
  border: 1.5px solid var(--menu-border);
  border-radius: 10px;
  font-family: inherit;
  font-size: 14px;
  color: var(--text-color);
  outline: none;
  transition: border-color 0.15s;
}
.form-input:focus, .form-textarea:focus { border-color: var(--main-color); }
.form-textarea { resize: vertical; min-height: 180px; font-size: 13px; font-family: monospace; }

.var-input-row { display: flex; gap: 8px; }
.var-text-input { flex: 1; }
.btn-add-var {
  width: 38px; height: 38px; flex-shrink: 0;
  border-radius: 9px;
  border: 1.5px solid var(--menu-border);
  background: transparent;
  color: var(--text-color);
  font-size: 18px;
  font-weight: 700;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: border-color 0.15s, background 0.15s;
}
.btn-add-var:hover { border-color: var(--main-color); color: var(--main-color); }

.var-tags { display: flex; flex-wrap: wrap; gap: 6px; }
.var-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  background: color-mix(in srgb, var(--main-color) 12%, transparent);
  color: var(--main-color);
  border-radius: 6px;
  font-size: 11.5px;
  font-weight: 700;
  font-family: monospace;
  cursor: pointer;
  transition: background 0.15s;
}
.var-tag:hover { background: color-mix(in srgb, var(--main-color) 22%, transparent); }
.var-tag-remove {
  background: none; border: none; cursor: pointer;
  color: inherit; font-size: 14px; line-height: 1;
  padding: 0; display: flex;
}

.form-error { font-size: 13px; color: var(--error-color); font-weight: 600; margin: 0; }

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 16px 24px 20px;
  border-top: 1px solid var(--menu-border);
  flex-shrink: 0;
}
.btn-cancel {
  padding: 9px 18px;
  border-radius: 9px;
  border: 1.5px solid var(--menu-border);
  background: transparent;
  color: var(--text-color);
  font-family: inherit;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}
.btn-cancel:hover { border-color: var(--text-color); }
.btn-save {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 9px 20px;
  background: var(--main-color);
  color: #fff;
  border: none;
  border-radius: 9px;
  font-family: inherit;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.15s;
}
.btn-save:disabled { opacity: 0.45; cursor: not-allowed; }
.btn-save:hover:not(:disabled) { opacity: 0.88; }

.btn-delete {
  padding: 9px 18px;
  border-radius: 9px;
  border: none;
  background: var(--error-color);
  color: #fff;
  font-family: inherit;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.15s;
}
.btn-delete:hover { opacity: 0.88; }

@keyframes spin-anim { to { transform: rotate(360deg); } }
.spin { animation: spin-anim 0.8s linear infinite; }

.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.2s; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }

@media (max-width: 700px) {
  .page-header { flex-direction: column; }
  .tmpl-row { flex-wrap: wrap; }
  .tmpl-meta { align-items: flex-start; flex-direction: row; justify-content: space-between; width: 100%; }
}
</style>
