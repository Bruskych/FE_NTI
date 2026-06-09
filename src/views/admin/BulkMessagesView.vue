<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useBulkMessagesStore } from '@/stores/bulkMessages'
import { useNotificationStore } from '@/stores/notifications'

const { t } = useI18n()
const store = useBulkMessagesStore()
const notif = useNotificationStore()

const targetGroup = ref('students')
const subject = ref('')
const body = ref('')
const formError = ref<string | null>(null)

const TARGET_GROUPS = [
  { value: 'all',          labelKey: 'adminPanel.bulk_target_all' },
  { value: 'students',     labelKey: 'adminPanel.bulk_target_students' },
  { value: 'mentors',      labelKey: 'adminPanel.bulk_target_mentors' },
  { value: 'companies',    labelKey: 'adminPanel.bulk_target_companies' },
  { value: 'team_leaders', labelKey: 'adminPanel.bulk_target_team_leaders' },
  { value: 'evaluators',   labelKey: 'adminPanel.bulk_target_evaluators' },
  { value: 'admins',       labelKey: 'adminPanel.bulk_target_admins' },
]

async function handleSend() {
  if (!subject.value.trim() || !body.value.trim()) {
    formError.value = t('adminPanel.bulk_validation')
    return
  }
  formError.value = null
  try {
    await store.sendMessage({
      target_group: targetGroup.value,
      subject: subject.value.trim(),
      body: body.value.trim(),
    })
    notif.add(t('adminPanel.bulk_sent_success'), 'success')
    subject.value = ''
    body.value = ''
  } catch {
    // axios interceptor shows toast
  }
}

function formatDate(d: string): string {
  return new Date(d).toLocaleDateString('sk-SK', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function targetLabel(group: string): string {
  const found = TARGET_GROUPS.find(g => g.value === group)
  return found ? t(found.labelKey) : group
}

onMounted(() => store.fetchMessages())
</script>

<template>
  <div class="bulk-page">

    <div class="page-header">
      <h1>{{ $t('adminPanel.bulk_title') }}</h1>
      <p class="subtitle">{{ $t('adminPanel.bulk_subtitle') }}</p>
    </div>

    <!-- Compose -->
    <div class="compose-card">
      <h2 class="card-title">{{ $t('adminPanel.bulk_compose_title') }}</h2>

      <div class="form-grid">
        <div class="form-group">
          <label>{{ $t('adminPanel.bulk_field_target') }}</label>
          <select v-model="targetGroup" class="form-select">
            <option v-for="g in TARGET_GROUPS" :key="g.value" :value="g.value">
              {{ $t(g.labelKey) }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label>{{ $t('adminPanel.bulk_field_subject') }}</label>
          <input
            v-model="subject"
            type="text"
            class="form-input"
            :placeholder="$t('adminPanel.bulk_subject_placeholder')"
          />
        </div>
      </div>

      <div class="form-group">
        <label>{{ $t('adminPanel.bulk_field_body') }}</label>
        <textarea
          v-model="body"
          class="form-textarea"
          rows="5"
          :placeholder="$t('adminPanel.bulk_body_placeholder')"
        ></textarea>
      </div>

      <p v-if="formError" class="form-error">{{ formError }}</p>

      <div class="compose-footer">
        <button
          class="btn-send"
          :disabled="store.sending"
          @click="handleSend"
        >
          <svg v-if="!store.sending" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"/>
            <polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="spin">
            <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
          </svg>
          {{ store.sending ? $t('adminPanel.bulk_btn_sending') : $t('adminPanel.bulk_btn_send') }}
        </button>
      </div>
    </div>

    <!-- History -->
    <div class="history-section">
      <h2 class="card-title">
        {{ $t('adminPanel.bulk_history_title') }}
        <span v-if="store.total" class="history-count">{{ store.total }}</span>
      </h2>

      <div v-if="store.loading" class="state-box">
        <div class="spinner"></div>
        <p>{{ $t('adminPanel.bulk_loading') }}</p>
      </div>

      <div v-else-if="store.messages.length === 0" class="empty-box">
        <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" class="empty-icon">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
          <polyline points="22,6 12,13 2,6"/>
        </svg>
        <p>{{ $t('adminPanel.bulk_empty') }}</p>
      </div>

      <div v-else class="history-list">
        <div v-for="msg in store.messages" :key="msg.id" class="msg-row">
          <div class="msg-left">
            <span class="msg-badge" :class="msg.is_sent ? 'badge-sent' : 'badge-queued'">
              {{ msg.is_sent ? $t('adminPanel.bulk_badge_sent') : $t('adminPanel.bulk_badge_queued') }}
            </span>
            <span class="msg-target">{{ targetLabel(msg.target_group) }}</span>
          </div>

          <div class="msg-body">
            <p class="msg-subject">{{ msg.subject }}</p>
            <p class="msg-preview">{{ msg.body.slice(0, 100) }}{{ msg.body.length > 100 ? '…' : '' }}</p>
          </div>

          <div class="msg-meta">
            <span class="msg-count">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
              {{ msg.recipient_count ?? '—' }}
            </span>
            <span class="msg-sender">{{ msg.sender?.name ?? '—' }}</span>
            <span class="msg-date">{{ formatDate(msg.created_at) }}</span>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="store.lastPage > 1" class="pagination">
        <button
          v-for="p in store.lastPage"
          :key="p"
          class="page-btn"
          :class="{ active: p === store.currentPage }"
          @click="store.fetchMessages(p)"
        >{{ p }}</button>
      </div>
    </div>

  </div>
</template>

<style scoped>
.bulk-page {
  display: flex;
  flex-direction: column;
  gap: 32px;
  font-family: var(--font-main), sans-serif;
  color: var(--text-color);
}

.page-header h1 {
  font-size: clamp(20px, 2.5vw, 28px);
  font-weight: 800;
  letter-spacing: -0.5px;
  margin: 0 0 6px;
}
.subtitle { font-size: 14px; opacity: 0.6; margin: 0; }

/* CARDS */
.compose-card,
.history-section {
  background: var(--menu-color);
  border: 1px solid var(--menu-border);
  border-radius: 18px;
  padding: 28px 32px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.card-title {
  font-size: 16px;
  font-weight: 800;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;
}
.history-count {
  font-size: 12px;
  font-weight: 700;
  background: color-mix(in srgb, var(--main-color) 15%, transparent);
  color: var(--main-color);
  padding: 2px 8px;
  border-radius: 100px;
}

/* FORM */
.form-grid {
  display: grid;
  grid-template-columns: 220px 1fr;
  gap: 16px;
}
.form-group {
  display: flex;
  flex-direction: column;
  gap: 7px;
}
.form-group label {
  font-size: 11.5px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.7px;
  opacity: 0.55;
}
.form-input,
.form-select,
.form-textarea {
  width: 100%;
  box-sizing: border-box;
  padding: 10px 13px;
  background: var(--bg-color);
  border: 1.5px solid var(--menu-border);
  border-radius: 10px;
  font-family: var(--font-main), sans-serif;
  font-size: 14px;
  color: var(--text-color);
  outline: none;
  transition: border-color 0.15s;
}
.form-select {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  padding-right: 36px;
  cursor: pointer;
}
.form-textarea { resize: vertical; min-height: 120px; }
.form-input:focus, .form-select:focus, .form-textarea:focus { border-color: var(--main-color); }

.form-error { font-size: 13px; color: var(--error-color); font-weight: 600; margin: 0; }

.compose-footer { display: flex; justify-content: flex-end; }

.btn-send {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 24px;
  background: var(--main-color);
  color: #fff;
  border: none;
  border-radius: 10px;
  font-family: inherit;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.18s, transform 0.15s;
}
.btn-send:hover:not(:disabled) { transform: translateY(-1px); opacity: 0.9; }
.btn-send:disabled { opacity: 0.45; cursor: not-allowed; }

@keyframes spin-anim { to { transform: rotate(360deg); } }
.spin { animation: spin-anim 0.8s linear infinite; }

/* STATES */
.state-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 40px;
  opacity: 0.6;
}
.spinner {
  width: 28px; height: 28px;
  border: 4px solid var(--menu-border);
  border-top-color: var(--main-color);
  border-radius: 50%;
  animation: spin-anim 0.9s linear infinite;
}
.empty-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 40px;
  opacity: 0.5;
  text-align: center;
}
.empty-icon { opacity: 0.6; }

/* HISTORY */
.history-list { display: flex; flex-direction: column; gap: 1px; }

.msg-row {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 14px 16px;
  border-radius: 12px;
  transition: background 0.15s;
}
.msg-row:hover { background: var(--bg-color); }

.msg-left {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 5px;
  flex-shrink: 0;
  width: 110px;
}
.msg-badge {
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  padding: 3px 9px;
  border-radius: 100px;
}
.badge-sent   { background: color-mix(in srgb, var(--good-color) 15%, transparent); color: var(--good-color); }
.badge-queued { background: color-mix(in srgb, #f59e0b 15%, transparent); color: #f59e0b; }

.msg-target {
  font-size: 12px;
  font-weight: 700;
  opacity: 0.6;
}

.msg-body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.msg-subject {
  font-size: 14px;
  font-weight: 700;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.msg-preview {
  font-size: 12.5px;
  opacity: 0.55;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.msg-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
  flex-shrink: 0;
}
.msg-count {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 700;
  color: var(--main-color);
}
.msg-sender { font-size: 11.5px; opacity: 0.55; }
.msg-date   { font-size: 11.5px; opacity: 0.45; white-space: nowrap; }

/* PAGINATION */
.pagination {
  display: flex;
  gap: 6px;
  justify-content: center;
  padding-top: 8px;
}
.page-btn {
  width: 34px; height: 34px;
  border-radius: 8px;
  border: 1px solid var(--menu-border);
  background: transparent;
  color: var(--text-color);
  font-family: inherit;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
}
.page-btn:hover { border-color: var(--main-color); }
.page-btn.active {
  background: var(--main-color);
  border-color: var(--main-color);
  color: #fff;
  cursor: default;
}

@media (max-width: 700px) {
  .compose-card, .history-section { padding: 20px; }
  .form-grid { grid-template-columns: 1fr; }
  .msg-row { flex-wrap: wrap; }
  .msg-meta { align-items: flex-start; }
}
</style>
