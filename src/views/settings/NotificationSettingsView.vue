<script setup lang="ts">
import { onMounted } from 'vue'
import { useNotificationPreferencesStore } from '@/stores/notificationPreferences'

const store = useNotificationPreferencesStore()

async function toggle(field: 'email_enabled' | 'system_enabled' | 'marketing_enabled' | 'deadline_alerts_enabled') {
  const newVal = !store.prefs[field]
  store.prefs[field] = newVal
  await store.updatePreferences({ [field]: newVal })
}

onMounted(() => store.fetchPreferences())
</script>

<template>
  <div class="notif-settings">

    <div class="ns-header">
      <h2 class="ns-title">{{ $t('settingsPanel.notif_title') }}</h2>
      <transition name="fade">
        <span v-if="store.saved" class="saved-badge">{{ $t('settingsPanel.saved') }}</span>
      </transition>
    </div>

    <div v-if="store.loading" class="ns-loading">
      <div class="spinner"></div>
    </div>

    <template v-else>

      <!-- Email channel -->
      <div class="settings-card">
        <div class="card-section-title">{{ $t('settingsPanel.notif_channels') }}</div>

        <div class="pref-row" @click="toggle('email_enabled')">
          <div class="pref-icon pref-icon--email">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
          </div>
          <div class="pref-info">
            <span class="pref-label">{{ $t('settingsPanel.notif_email') }}</span>
            <span class="pref-desc">{{ $t('settingsPanel.notif_email_desc') }}</span>
          </div>
          <div class="toggle-switch" :class="{ 'toggle-on': store.prefs.email_enabled }">
            <div class="toggle-thumb"></div>
          </div>
        </div>

        <div class="pref-divider"></div>

        <div class="pref-row" @click="toggle('system_enabled')">
          <div class="pref-icon pref-icon--system">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
          </div>
          <div class="pref-info">
            <span class="pref-label">{{ $t('settingsPanel.notif_system') }}</span>
            <span class="pref-desc">{{ $t('settingsPanel.notif_system_desc') }}</span>
          </div>
          <div class="toggle-switch" :class="{ 'toggle-on': store.prefs.system_enabled }">
            <div class="toggle-thumb"></div>
          </div>
        </div>
      </div>

      <!-- Content preferences -->
      <div class="settings-card">
        <div class="card-section-title">{{ $t('settingsPanel.notif_content') }}</div>

        <div class="pref-row" @click="toggle('deadline_alerts_enabled')">
          <div class="pref-icon pref-icon--deadline">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
          </div>
          <div class="pref-info">
            <span class="pref-label">{{ $t('settingsPanel.notif_deadlines') }}</span>
            <span class="pref-desc">{{ $t('settingsPanel.notif_deadlines_desc') }}</span>
          </div>
          <div class="toggle-switch" :class="{ 'toggle-on': store.prefs.deadline_alerts_enabled }">
            <div class="toggle-thumb"></div>
          </div>
        </div>

        <div class="pref-divider"></div>

        <div class="pref-row" @click="toggle('marketing_enabled')">
          <div class="pref-icon pref-icon--marketing">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
          </div>
          <div class="pref-info">
            <span class="pref-label">{{ $t('settingsPanel.notif_marketing') }}</span>
            <span class="pref-desc">{{ $t('settingsPanel.notif_marketing_desc') }}</span>
          </div>
          <div class="toggle-switch" :class="{ 'toggle-on': store.prefs.marketing_enabled }">
            <div class="toggle-thumb"></div>
          </div>
        </div>
      </div>

      <transition name="fade">
        <div v-if="store.error" class="ns-error">{{ store.error }}</div>
      </transition>

    </template>
  </div>
</template>

<style scoped>
.notif-settings {
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 580px;
  width: 100%;
  font-family: var(--font-main), sans-serif;
}

.ns-header {
  display: flex;
  align-items: center;
  gap: 14px;
}

.ns-title {
  font-size: 20px;
  font-weight: 800;
  margin: 0;
  letter-spacing: -0.3px;
  color: var(--text-color);
}

.saved-badge {
  font-size: 12px; font-weight: 700;
  color: var(--good-color);
  background: color-mix(in srgb, var(--good-color) 12%, transparent);
  padding: 2px 10px; border-radius: 100px;
}

.ns-loading {
  display: flex;
  justify-content: center;
  padding: 48px 0;
}

.spinner {
  width: 28px; height: 28px;
  border: 4px solid var(--menu-border);
  border-top-color: var(--main-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

/* CARD */
.settings-card {
  background: var(--menu-color);
  border: 1px solid var(--menu-border);
  border-radius: 18px;
  padding: 6px 0;
  display: flex;
  flex-direction: column;
}

.card-section-title {
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: var(--text-color);
  opacity: 0.45;
  padding: 14px 22px 10px;
}

/* PREF ROW */
.pref-row {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 22px;
  cursor: pointer;
  transition: background 0.15s;
  border-radius: 12px;
  margin: 0 4px;
}

.pref-row:hover { background: color-mix(in srgb, var(--main-color) 5%, transparent); }
.pref-row:active { background: color-mix(in srgb, var(--main-color) 10%, transparent); }

.pref-divider {
  height: 1px;
  background: var(--menu-border);
  margin: 0 22px;
}

.pref-icon {
  width: 36px; height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.pref-icon--email    { background: color-mix(in srgb, var(--main-color) 12%, transparent); color: var(--main-color); }
.pref-icon--system   { background: color-mix(in srgb, #6366f1 12%, transparent); color: #6366f1; }
.pref-icon--deadline { background: color-mix(in srgb, var(--wait-color) 12%, transparent); color: var(--wait-color); }
.pref-icon--marketing { background: color-mix(in srgb, #f59e0b 12%, transparent); color: #f59e0b; }

.pref-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.pref-label {
  font-size: 14px;
  font-weight: 700;
  color: var(--text-color);
}

.pref-desc {
  font-size: 12px;
  color: var(--text-color);
  opacity: 0.55;
  line-height: 1.4;
}

/* TOGGLE */
.toggle-switch {
  width: 44px;
  height: 24px;
  border-radius: 100px;
  background: var(--menu-border);
  padding: 3px;
  display: flex;
  align-items: center;
  flex-shrink: 0;
  transition: background 0.2s;
  pointer-events: none;
}

.toggle-on { background: var(--main-color); }

.toggle-thumb {
  width: 18px; height: 18px;
  border-radius: 50%;
  background: #fff;
  transition: transform 0.2s;
  flex-shrink: 0;
}

.toggle-on .toggle-thumb { transform: translateX(20px); }

/* ERROR */
.ns-error {
  font-size: 13px;
  color: var(--error-color);
  font-weight: 600;
  padding: 10px 16px;
  background: color-mix(in srgb, var(--error-color) 8%, transparent);
  border: 1px solid color-mix(in srgb, var(--error-color) 20%, transparent);
  border-radius: 10px;
}

/* FADE */
.fade-enter-active, .fade-leave-active { transition: opacity 0.25s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
