<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { useNotificationStore } from '@/stores/notifications'
import { useAuthStore } from '@/stores/auth'

const { t } = useI18n()
const router = useRouter()
const notif = useNotificationStore()
const authStore = useAuthStore()

const exporting = ref(false)
const exportDone = ref(false)

const showEraseConfirm = ref(false)
const erasing = ref(false)
const eraseConfirmText = ref('')

async function handleExport() {
  exporting.value = true
  try {
    await axios.post('/auth/gdpr/export')
    exportDone.value = true
    notif.add(t('settingsPanel.gdpr_export_success'), 'success')
  } catch {
    // interceptor handles
  } finally {
    exporting.value = false
  }
}

async function handleErase() {
  if (eraseConfirmText.value !== t('settingsPanel.gdpr_erase_confirm_word')) return
  erasing.value = true
  try {
    await axios.delete('/auth/gdpr/erase')
    notif.add(t('settingsPanel.gdpr_erase_success'), 'success')
    authStore.token = null
    authStore.user = null
    await router.push({ name: 'home' })
  } catch {
    // interceptor handles
  } finally {
    erasing.value = false
    showEraseConfirm.value = false
  }
}
</script>

<template>
  <div class="gdpr-page">

    <div class="page-header">
      <h1>{{ $t('settingsPanel.gdpr_title') }}</h1>
      <p class="subtitle">{{ $t('settingsPanel.gdpr_subtitle') }}</p>
    </div>

    <!-- Export -->
    <div class="gdpr-card">
      <div class="card-icon export-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
      </div>
      <div class="card-content">
        <h2>{{ $t('settingsPanel.gdpr_export_title') }}</h2>
        <p>{{ $t('settingsPanel.gdpr_export_desc') }}</p>
        <div v-if="exportDone" class="done-msg">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          {{ $t('settingsPanel.gdpr_export_queued') }}
        </div>
        <button
          v-else
          class="btn-export"
          :disabled="exporting"
          @click="handleExport"
        >
          <svg v-if="exporting" class="spin" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
            <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
          </svg>
          {{ exporting ? $t('settingsPanel.gdpr_exporting') : $t('settingsPanel.gdpr_export_btn') }}
        </button>
      </div>
    </div>

    <!-- Erase -->
    <div class="gdpr-card danger-card">
      <div class="card-icon erase-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
          <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
        </svg>
      </div>
      <div class="card-content">
        <h2>{{ $t('settingsPanel.gdpr_erase_title') }}</h2>
        <p>{{ $t('settingsPanel.gdpr_erase_desc') }}</p>
        <button class="btn-erase" @click="showEraseConfirm = true">
          {{ $t('settingsPanel.gdpr_erase_btn') }}
        </button>
      </div>
    </div>

  </div>

  <!-- Erase confirm modal -->
  <teleport to="body">
    <transition name="modal-fade">
      <div v-if="showEraseConfirm" class="modal-overlay" @click.self="showEraseConfirm = false">
        <div class="modal-box">
          <div class="modal-header">
            <h3>{{ $t('settingsPanel.gdpr_erase_confirm_title') }}</h3>
            <button class="modal-close" @click="showEraseConfirm = false">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          <div class="modal-body">
            <div class="erase-warning">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
              <p>{{ $t('settingsPanel.gdpr_erase_warning') }}</p>
            </div>
            <label class="confirm-label">
              {{ $t('settingsPanel.gdpr_erase_confirm_label', { word: $t('settingsPanel.gdpr_erase_confirm_word') }) }}
            </label>
            <input
              v-model="eraseConfirmText"
              type="text"
              class="confirm-input"
              :placeholder="$t('settingsPanel.gdpr_erase_confirm_word')"
            />
          </div>
          <div class="modal-footer">
            <button class="btn-cancel" @click="showEraseConfirm = false">
              {{ $t('challenges.form_cancel') }}
            </button>
            <button
              class="btn-erase-confirm"
              :disabled="erasing || eraseConfirmText !== $t('settingsPanel.gdpr_erase_confirm_word')"
              @click="handleErase"
            >
              <svg v-if="erasing" class="spin" xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
              </svg>
              {{ erasing ? $t('settingsPanel.gdpr_erasing') : $t('settingsPanel.gdpr_erase_confirm_btn') }}
            </button>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<style scoped>
.gdpr-page {
  display: flex;
  flex-direction: column;
  gap: 24px;
  font-family: var(--font-main), sans-serif;
  color: var(--text-color);
  max-width: 680px;
}

.page-header h1 {
  font-size: clamp(20px, 2.5vw, 26px);
  font-weight: 800;
  letter-spacing: -0.5px;
  margin: 0 0 6px;
}
.subtitle { font-size: 14px; opacity: 0.6; margin: 0; }

.gdpr-card {
  display: flex;
  gap: 20px;
  background: var(--menu-color);
  border: 1px solid var(--menu-border);
  border-radius: 16px;
  padding: 24px 28px;
}

.danger-card { border-color: color-mix(in srgb, var(--error-color) 30%, var(--menu-border)); }

.card-icon {
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.export-icon { background: color-mix(in srgb, var(--main-color) 12%, transparent); color: var(--main-color); }
.erase-icon  { background: color-mix(in srgb, var(--error-color) 12%, transparent); color: var(--error-color); }

.card-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.card-content h2 { font-size: 16px; font-weight: 800; margin: 0; }
.card-content p  { font-size: 14px; opacity: 0.65; margin: 0; line-height: 1.5; }

.done-msg {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 700;
  color: var(--good-color);
  margin-top: 4px;
}

.btn-export {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 9px 20px;
  background: var(--main-color);
  color: #fff;
  border: none;
  border-radius: 9px;
  font-family: inherit;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  align-self: flex-start;
  margin-top: 4px;
  transition: opacity 0.15s;
}
.btn-export:disabled { opacity: 0.45; cursor: not-allowed; }
.btn-export:hover:not(:disabled) { opacity: 0.88; }

.btn-erase {
  display: inline-flex;
  align-items: center;
  padding: 9px 20px;
  background: transparent;
  color: var(--error-color);
  border: 1.5px solid var(--error-color);
  border-radius: 9px;
  font-family: inherit;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  align-self: flex-start;
  margin-top: 4px;
  transition: background 0.15s;
}
.btn-erase:hover { background: color-mix(in srgb, var(--error-color) 10%, transparent); }

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
  border-radius: 16px;
  width: 100%;
  max-width: 440px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.35);
  animation: modal-in 0.18s ease;
}
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
  gap: 14px;
}

.erase-warning {
  display: flex;
  gap: 10px;
  padding: 12px 14px;
  background: color-mix(in srgb, var(--error-color) 10%, transparent);
  border: 1px solid color-mix(in srgb, var(--error-color) 25%, transparent);
  border-radius: 10px;
  color: var(--error-color);
  font-size: 13px;
  line-height: 1.5;
}
.erase-warning svg { flex-shrink: 0; margin-top: 1px; }
.erase-warning p { margin: 0; }

.confirm-label { font-size: 13px; font-weight: 700; opacity: 0.7; }

.confirm-input {
  width: 100%;
  box-sizing: border-box;
  padding: 10px 13px;
  background: var(--bg-color);
  border: 1.5px solid var(--menu-border);
  border-radius: 9px;
  font-family: inherit;
  font-size: 14px;
  color: var(--text-color);
  outline: none;
  transition: border-color 0.15s;
}
.confirm-input:focus { border-color: var(--error-color); }

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 16px 24px 20px;
  border-top: 1px solid var(--menu-border);
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

.btn-erase-confirm {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 9px 18px;
  background: var(--error-color);
  color: #fff;
  border: none;
  border-radius: 9px;
  font-family: inherit;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.15s;
}
.btn-erase-confirm:disabled { opacity: 0.4; cursor: not-allowed; }
.btn-erase-confirm:hover:not(:disabled) { opacity: 0.88; }

@keyframes spin-anim { to { transform: rotate(360deg); } }
.spin { animation: spin-anim 0.8s linear infinite; }

.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.2s; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }
</style>
