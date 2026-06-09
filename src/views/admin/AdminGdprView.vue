<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import api from '@/core/api/axios'
import { useNotificationStore } from '@/stores/notifications'

const { t } = useI18n()
const notif = useNotificationStore()

const userId       = ref<string>('')
const exporting    = ref(false)
const erasing      = ref(false)
const showConfirm  = ref(false)
const confirmInput = ref('')

function isValidId() {
  return /^\d+$/.test(userId.value.trim()) && parseInt(userId.value) > 0
}

async function handleExport() {
  if (!isValidId()) return
  exporting.value = true
  try {
    await api.post(`/admin/gdpr/users/${userId.value.trim()}/export`)
    notif.add(t('adminGdpr.export_success'), 'success')
  } catch {
    // interceptor
  } finally {
    exporting.value = false
  }
}

function openErase() {
  confirmInput.value = ''
  showConfirm.value = true
}

async function handleErase() {
  if (confirmInput.value !== t('adminGdpr.confirm_word')) return
  erasing.value = true
  try {
    await api.delete(`/admin/gdpr/users/${userId.value.trim()}`)
    notif.add(t('adminGdpr.erase_success'), 'success')
    userId.value = ''
    showConfirm.value = false
  } catch {
    // interceptor
  } finally {
    erasing.value = false
  }
}
</script>

<template>
  <div class="gdpr-admin-page">

    <div class="page-header">
      <h1>{{ $t('adminGdpr.title') }}</h1>
      <p class="subtitle">{{ $t('adminGdpr.subtitle') }}</p>
    </div>

    <div class="lookup-card">
      <h2 class="card-title">{{ $t('adminGdpr.lookup_title') }}</h2>
      <p class="card-desc">{{ $t('adminGdpr.lookup_desc') }}</p>

      <div class="id-row">
        <div class="id-input-wrap">
          <span class="id-prefix">#</span>
          <input
            v-model="userId"
            type="number"
            min="1"
            class="id-input"
            :placeholder="$t('adminGdpr.id_placeholder')"
          />
        </div>
      </div>

      <div class="action-row">
        <button
          class="btn-export"
          :disabled="!isValidId() || exporting || erasing"
          @click="handleExport"
        >
          <svg v-if="exporting" class="spin" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
            <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          {{ exporting ? $t('adminGdpr.exporting') : $t('adminGdpr.export_btn') }}
        </button>

        <button
          class="btn-erase"
          :disabled="!isValidId() || exporting || erasing"
          @click="openErase"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
            <path d="M10 11v6"/><path d="M14 11v6"/>
          </svg>
          {{ $t('adminGdpr.erase_btn') }}
        </button>
      </div>
    </div>

    <div class="info-card">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="info-icon">
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      <p>{{ $t('adminGdpr.info') }}</p>
    </div>

  </div>

  <!-- Erase confirm modal -->
  <teleport to="body">
    <transition name="modal-fade">
      <div v-if="showConfirm" class="modal-overlay" @click.self="showConfirm = false">
        <div class="modal-box">
          <div class="modal-header">
            <h3>{{ $t('adminGdpr.confirm_title') }}</h3>
            <button class="modal-close" @click="showConfirm = false">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          <div class="modal-body">
            <div class="warn-box">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
              <p>{{ $t('adminGdpr.confirm_warning', { id: userId }) }}</p>
            </div>
            <label class="confirm-label">
              {{ $t('adminGdpr.confirm_label', { word: $t('adminGdpr.confirm_word') }) }}
            </label>
            <input v-model="confirmInput" type="text" class="confirm-input" :placeholder="$t('adminGdpr.confirm_word')" />
          </div>
          <div class="modal-footer">
            <button class="btn-cancel" @click="showConfirm = false">{{ $t('challenges.form_cancel') }}</button>
            <button
              class="btn-erase-confirm"
              :disabled="erasing || confirmInput !== $t('adminGdpr.confirm_word')"
              @click="handleErase"
            >
              <svg v-if="erasing" class="spin" xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
              </svg>
              {{ erasing ? $t('adminGdpr.erasing') : $t('adminGdpr.confirm_btn') }}
            </button>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<style scoped>
.gdpr-admin-page {
  display: flex; flex-direction: column; gap: 20px;
  font-family: var(--font-main), sans-serif; color: var(--text-color);
  max-width: 600px;
}
.page-header h1 { font-size: clamp(20px, 2.5vw, 26px); font-weight: 800; letter-spacing: -0.5px; margin: 0 0 6px; }
.subtitle { font-size: 14px; opacity: 0.6; margin: 0; }

.lookup-card {
  background: var(--menu-color); border: 1px solid var(--menu-border);
  border-radius: 16px; padding: 24px 28px;
  display: flex; flex-direction: column; gap: 16px;
}
.card-title { font-size: 15px; font-weight: 800; margin: 0; }
.card-desc { font-size: 13.5px; opacity: 0.6; margin: 0; line-height: 1.5; }

.id-row { display: flex; gap: 12px; align-items: center; }
.id-input-wrap {
  display: flex; align-items: center;
  background: var(--bg-color); border: 1.5px solid var(--menu-border);
  border-radius: 10px; overflow: hidden;
  transition: border-color 0.15s;
}
.id-input-wrap:focus-within { border-color: var(--main-color); }
.id-prefix {
  padding: 0 10px 0 14px; font-size: 16px; font-weight: 700;
  color: var(--main-color); opacity: 0.8;
}
.id-input {
  background: none; border: none; outline: none;
  padding: 10px 14px 10px 0;
  font-family: inherit; font-size: 14px; color: var(--text-color);
  width: 160px;
}
.id-input::-webkit-outer-spin-button, .id-input::-webkit-inner-spin-button { -webkit-appearance: none; }

.action-row { display: flex; gap: 10px; flex-wrap: wrap; }

.btn-export {
  display: inline-flex; align-items: center; gap: 7px;
  padding: 10px 20px; background: var(--main-color); color: #fff;
  border: none; border-radius: 9px;
  font-family: inherit; font-size: 13px; font-weight: 700; cursor: pointer;
  transition: opacity 0.15s;
}
.btn-export:disabled { opacity: 0.4; cursor: not-allowed; }
.btn-export:hover:not(:disabled) { opacity: 0.88; }

.btn-erase {
  display: inline-flex; align-items: center; gap: 7px;
  padding: 10px 20px;
  background: transparent; color: var(--error-color);
  border: 1.5px solid var(--error-color); border-radius: 9px;
  font-family: inherit; font-size: 13px; font-weight: 700; cursor: pointer;
  transition: background 0.15s;
}
.btn-erase:disabled { opacity: 0.4; cursor: not-allowed; }
.btn-erase:hover:not(:disabled) { background: color-mix(in srgb, var(--error-color) 10%, transparent); }

.info-card {
  display: flex; gap: 12px; align-items: flex-start;
  padding: 14px 16px;
  background: color-mix(in srgb, var(--main-color) 8%, transparent);
  border: 1px solid color-mix(in srgb, var(--main-color) 20%, transparent);
  border-radius: 12px;
  font-size: 13px; line-height: 1.5; opacity: 0.8;
}
.info-icon { flex-shrink: 0; color: var(--main-color); margin-top: 1px; }
.info-card p { margin: 0; }

/* Modal */
.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.55);
  display: flex; align-items: center; justify-content: center;
  z-index: 1001; padding: 20px; color: var(--text-color);
}
.modal-box {
  background: var(--menu-color); border-radius: 16px;
  width: 100%; max-width: 440px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.35); animation: modal-in 0.18s ease;
}
@keyframes modal-in { from { opacity: 0; transform: translateY(10px) scale(0.98); } to { opacity: 1; transform: none; } }
.modal-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 20px 24px 16px; border-bottom: 1px solid var(--menu-border);
}
.modal-header h3 { font-size: 16px; font-weight: 800; margin: 0; }
.modal-close { background: none; border: none; cursor: pointer; color: var(--text-color); opacity: 0.5; padding: 4px; border-radius: 6px; display: flex; }
.modal-close:hover { opacity: 1; }
.modal-body { padding: 20px 24px; display: flex; flex-direction: column; gap: 14px; }

.warn-box {
  display: flex; gap: 10px;
  padding: 12px 14px;
  background: color-mix(in srgb, var(--error-color) 10%, transparent);
  border: 1px solid color-mix(in srgb, var(--error-color) 25%, transparent);
  border-radius: 10px; color: var(--error-color); font-size: 13px; line-height: 1.5;
}
.warn-box svg { flex-shrink: 0; margin-top: 1px; }
.warn-box p { margin: 0; }

.confirm-label { font-size: 13px; font-weight: 700; opacity: 0.7; }
.confirm-input {
  width: 100%; box-sizing: border-box; padding: 10px 13px;
  background: var(--bg-color); border: 1.5px solid var(--menu-border);
  border-radius: 9px; font-family: inherit; font-size: 14px; color: var(--text-color);
  outline: none; transition: border-color 0.15s;
}
.confirm-input:focus { border-color: var(--error-color); }

.modal-footer { display: flex; justify-content: flex-end; gap: 10px; padding: 16px 24px 20px; border-top: 1px solid var(--menu-border); }
.btn-cancel { padding: 9px 18px; border-radius: 9px; border: 1.5px solid var(--menu-border); background: transparent; color: var(--text-color); font-family: inherit; font-size: 13px; font-weight: 700; cursor: pointer; }
.btn-cancel:hover { border-color: var(--text-color); }
.btn-erase-confirm {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 9px 18px; background: var(--error-color); color: #fff;
  border: none; border-radius: 9px;
  font-family: inherit; font-size: 13px; font-weight: 700; cursor: pointer;
  transition: opacity 0.15s;
}
.btn-erase-confirm:disabled { opacity: 0.4; cursor: not-allowed; }
.btn-erase-confirm:hover:not(:disabled) { opacity: 0.88; }

@keyframes spin-anim { to { transform: rotate(360deg); } }
.spin { animation: spin-anim 0.8s linear infinite; }
.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.2s; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }
</style>
