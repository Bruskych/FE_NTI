<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useExportsStore } from '@/stores/exports'
import { useNotificationStore } from '@/stores/notifications'

const { t } = useI18n()
const store = useExportsStore()
const notif = useNotificationStore()

const FORMAT_META: Record<string, { color: string; icon: string }> = {
  csv:  { color: '#22c55e', icon: 'CSV' },
  xlsx: { color: '#16a34a', icon: 'XLS' },
  pdf:  { color: '#ef4444', icon: 'PDF' },
  docx: { color: '#3b82f6', icon: 'DOC' },
  json: { color: '#f59e0b', icon: 'JSON' },
}

const RESOURCE_LABELS: Record<string, string> = {
  users:         t('exports.resource_users'),
  projects:      t('exports.resource_projects'),
  applications:  t('exports.resource_applications'),
  personal_data: t('exports.resource_personal_data'),
}

const resourceOrder = ['users', 'projects', 'applications', 'personal_data']

const orderedResources = computed(() =>
  resourceOrder.filter(r => store.types[r]?.length)
)

async function trigger(exportType: string) {
  if (store.scheduling) return
  try {
    await store.scheduleExport(exportType)
    notif.add(t('exports.scheduled_success'), 'success')
  } catch {
    // interceptor handles
  }
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('sk-SK', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function resourceLabel(exportType: string): string {
  const resource = exportType.split('_').slice(0, -1).join('_')
  return RESOURCE_LABELS[resource] ?? resource
}

function formatLabel(exportType: string): string {
  return exportType.split('_').at(-1)?.toUpperCase() ?? exportType
}

onMounted(async () => {
  await store.fetchTypes()
  await store.fetchLogs()
})
</script>

<template>
  <div class="exports-page">

    <div class="page-header">
      <h1>{{ $t('exports.title') }}</h1>
      <p class="subtitle">{{ $t('exports.subtitle') }}</p>
    </div>

    <!-- Export Grid -->
    <div class="section-card">
      <h2 class="card-title">{{ $t('exports.trigger_title') }}</h2>

      <div v-if="!store.typesLoaded" class="state-box">
        <div class="spinner"></div>
      </div>

      <div v-else class="resources-grid">
        <div
          v-for="resource in orderedResources"
          :key="resource"
          class="resource-block"
        >
          <p class="resource-label">{{ RESOURCE_LABELS[resource] ?? resource }}</p>
          <div class="format-row">
            <button
              v-for="opt in store.types[resource]"
              :key="opt.type"
              class="fmt-btn"
              :class="{ loading: store.scheduling === opt.type }"
              :disabled="!!store.scheduling"
              :style="{ '--fmt-color': FORMAT_META[opt.format]?.color ?? '#888' }"
              @click="trigger(opt.type)"
            >
              <span class="fmt-badge">
                <svg v-if="store.scheduling === opt.type" class="spin" xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                </svg>
                <span v-else>{{ FORMAT_META[opt.format]?.icon ?? opt.format.toUpperCase() }}</span>
              </span>
              {{ opt.format.toUpperCase() }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- History -->
    <div class="section-card">
      <h2 class="card-title">
        {{ $t('exports.history_title') }}
        <span v-if="store.total" class="history-count">{{ store.total }}</span>
      </h2>

      <div v-if="store.loading" class="state-box">
        <div class="spinner"></div>
        <p>{{ $t('exports.loading') }}</p>
      </div>

      <div v-else-if="store.logs.length === 0" class="empty-box">
        <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" class="empty-icon">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
          <polyline points="10 9 9 9 8 9"/>
        </svg>
        <p>{{ $t('exports.empty') }}</p>
      </div>

      <div v-else class="log-list">
        <div v-for="log in store.logs" :key="log.id" class="log-row">
          <div class="log-left">
            <span
              class="log-fmt"
              :style="{ background: `color-mix(in srgb, ${FORMAT_META[log.export_type.split('_').at(-1) ?? '']?.color ?? '#888'} 15%, transparent)`, color: FORMAT_META[log.export_type.split('_').at(-1) ?? '']?.color ?? '#888' }"
            >
              {{ FORMAT_META[log.export_type.split('_').at(-1) ?? '']?.icon ?? log.export_type.split('_').at(-1)?.toUpperCase() }}
            </span>
          </div>
          <div class="log-body">
            <p class="log-resource">{{ resourceLabel(log.export_type) }}</p>
            <p class="log-type">{{ log.export_type }}</p>
          </div>
          <div class="log-meta">
            <span class="log-status" :class="log.file_path ? 'status-done' : 'status-pending'">
              {{ log.file_path ? $t('exports.status_done') : $t('exports.status_pending') }}
            </span>
            <span class="log-user">{{ log.user?.name ?? '—' }}</span>
            <span class="log-date">{{ formatDate(log.created_at) }}</span>
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
          @click="store.fetchLogs(p)"
        >{{ p }}</button>
      </div>
    </div>

  </div>
</template>

<style scoped>
.exports-page {
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

.section-card {
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

/* RESOURCE GRID */
.resources-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 16px;
}

.resource-block {
  background: var(--bg-color);
  border: 1px solid var(--menu-border);
  border-radius: 14px;
  padding: 18px 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.resource-label {
  font-size: 13px;
  font-weight: 800;
  margin: 0;
  opacity: 0.75;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.format-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.fmt-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 12px;
  border-radius: 8px;
  border: 1.5px solid var(--fmt-color);
  background: color-mix(in srgb, var(--fmt-color) 10%, transparent);
  color: var(--fmt-color);
  font-family: inherit;
  font-size: 12px;
  font-weight: 800;
  cursor: pointer;
  transition: background 0.15s, transform 0.12s;
}
.fmt-btn:hover:not(:disabled) {
  background: color-mix(in srgb, var(--fmt-color) 20%, transparent);
  transform: translateY(-1px);
}
.fmt-btn:disabled { opacity: 0.45; cursor: not-allowed; transform: none; }
.fmt-btn.loading { opacity: 0.7; }

.fmt-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 16px;
  background: var(--fmt-color);
  color: #fff;
  font-size: 9px;
  font-weight: 900;
  border-radius: 4px;
}

/* STATES */
.state-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 32px;
  opacity: 0.6;
}
.spinner {
  width: 26px; height: 26px;
  border: 3px solid var(--menu-border);
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

/* LOG LIST */
.log-list { display: flex; flex-direction: column; gap: 1px; }

.log-row {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 14px;
  border-radius: 10px;
  transition: background 0.15s;
}
.log-row:hover { background: var(--bg-color); }

.log-left { flex-shrink: 0; }
.log-fmt {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 26px;
  font-size: 10px;
  font-weight: 900;
  border-radius: 6px;
}

.log-body {
  flex: 1;
  min-width: 0;
}
.log-resource {
  font-size: 14px;
  font-weight: 700;
  margin: 0 0 2px;
}
.log-type {
  font-size: 11.5px;
  opacity: 0.45;
  margin: 0;
  font-family: monospace;
}

.log-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 3px;
  flex-shrink: 0;
}
.log-status {
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 2px 8px;
  border-radius: 100px;
}
.status-done    { background: color-mix(in srgb, var(--good-color) 15%, transparent); color: var(--good-color); }
.status-pending { background: color-mix(in srgb, #f59e0b 15%, transparent); color: #f59e0b; }
.log-user { font-size: 11.5px; opacity: 0.5; }
.log-date { font-size: 11.5px; opacity: 0.4; white-space: nowrap; }

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

@keyframes spin-anim { to { transform: rotate(360deg); } }
.spin { animation: spin-anim 0.8s linear infinite; }

@media (max-width: 700px) {
  .section-card { padding: 20px; }
  .resources-grid { grid-template-columns: 1fr; }
  .log-row { flex-wrap: wrap; }
  .log-meta { align-items: flex-start; }
}
</style>
