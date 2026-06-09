<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useCallsStore } from '@/stores/calls'
import { useAuthStore } from '@/stores/auth'
import type { Call } from '@/stores/calls'

const callsStore = useCallsStore()
const authStore = useAuthStore()

const activeFilter = ref<'all' | 'open' | 'draft' | 'closed'>('all')

const isAdmin = computed(() => authStore.hasAnyRole(['admin', 'super_admin']))

const filteredCalls = computed(() => {
  if (activeFilter.value === 'all') return callsStore.calls
  return callsStore.calls.filter(c => c.status === activeFilter.value)
})

const formatDate = (dateStr: string | null) => {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('sk-SK', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

const formatBudget = (budget: number | null) => {
  if (!budget) return null
  return new Intl.NumberFormat('sk-SK', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(budget)
}

const handleOpen = async (call: Call) => {
  try {
    await callsStore.openCall(call.id)
  } catch (err) {
    alert(err)
  }
}

const handleClose = async (call: Call) => {
  try {
    await callsStore.closeCall(call.id)
  } catch (err) {
    alert(err)
  }
}

onMounted(() => callsStore.fetchCalls())
</script>

<template>
  <div class="calls-page">
    <div class="page-inner">

      <div class="page-header">
        <div>
          <h1>{{ $t('calls.title') }}</h1>
          <p class="subtitle">{{ $t('calls.subtitle') }}</p>
        </div>
      </div>

      <div class="filter-bar">
        <button
            v-for="f in (['all', 'open', 'draft', 'closed'] as const)"
            :key="f"
            class="filter-btn"
            :class="{ active: activeFilter === f }"
            @click="activeFilter = f"
        >
          {{ $t(`calls.filter_${f}`) }}
          <span class="filter-count">
            {{
              f === 'all' ? callsStore.calls.length
              : f === 'open' ? callsStore.openCalls.length
              : f === 'draft' ? callsStore.draftCalls.length
              : callsStore.closedCalls.length
            }}
          </span>
        </button>
      </div>

      <div v-if="callsStore.loading" class="state-box">
        <div class="spinner"></div>
        <p>{{ $t('calls.loading') }}</p>
      </div>

      <div v-else-if="filteredCalls.length === 0" class="state-box">
        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="empty-icon">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
        <p>{{ $t('calls.empty') }}</p>
      </div>

      <div v-else class="calls-grid">
        <div
            v-for="call in filteredCalls"
            :key="call.id"
            class="call-card"
            :class="`call-card--${call.status}`"
        >
          <div class="call-card-top">
            <div class="call-meta">
              <span class="status-badge" :class="`status-${call.status}`">
                {{ $t(`calls.status_${call.status}`) }}
              </span>
              <span v-if="call.is_expired && call.status === 'open'" class="status-badge status-expired">
                {{ $t('calls.expired') }}
              </span>
              <span v-if="call.program" class="program-tag">{{ call.program.name }}</span>
            </div>
            <span class="call-id">#{{ call.id }}</span>
          </div>

          <h3 class="call-title">{{ call.title }}</h3>

          <p v-if="call.description" class="call-desc">{{ call.description }}</p>

          <div v-if="call.specializations?.length" class="spec-list">
            <span v-for="spec in call.specializations" :key="spec.id" class="spec-tag">
              {{ spec.name }}
            </span>
          </div>

          <div class="call-footer">
            <div class="call-info-row">
              <div class="info-item" v-if="call.deadline">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
                <span>{{ $t('calls.deadline') }}: {{ formatDate(call.deadline) }}</span>
              </div>
              <div class="info-item" v-if="formatBudget(call.budget)">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                </svg>
                <span>{{ formatBudget(call.budget) }}</span>
              </div>
              <div class="info-item" v-if="call.applications_count != null">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
                <span>{{ call.applications_count }} {{ $t('calls.applications') }}</span>
              </div>
            </div>

            <div v-if="isAdmin" class="admin-actions">
              <button
                  v-if="call.status === 'draft'"
                  class="action-btn action-btn--open"
                  :disabled="callsStore.actionLoading === call.id"
                  @click="handleOpen(call)"
              >
                {{ $t('calls.action_open') }}
              </button>
              <button
                  v-if="call.status === 'open'"
                  class="action-btn action-btn--close"
                  :disabled="callsStore.actionLoading === call.id"
                  @click="handleClose(call)"
              >
                {{ $t('calls.action_close') }}
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
.calls-page {
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

.page-header h1 {
  font-size: clamp(22px, 3vw, 30px);
  font-weight: 800;
  letter-spacing: -0.5px;
  margin: 0 0 6px 0;
}

.subtitle {
  font-size: 15px;
  opacity: 0.65;
  margin: 0;
}

/* -- FILTERS -- */
.filter-bar {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.filter-btn {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 8px 16px;
  border-radius: 100px;
  border: 1px solid var(--menu-border);
  background: var(--menu-color);
  color: var(--text-color);
  font-family: inherit;
  font-size: 13.5px;
  font-weight: 600;
  cursor: pointer;
  transition: border-color 0.18s, background 0.18s;
}

.filter-btn:hover {
  border-color: var(--main-color);
}

.filter-btn.active {
  border-color: var(--main-color);
  background: var(--main-color-light);
  color: var(--main-color-dark);
}

.filter-count {
  font-size: 11px;
  background: var(--menu-border);
  padding: 1px 7px;
  border-radius: 100px;
  font-weight: 700;
}

.filter-btn.active .filter-count {
  background: color-mix(in srgb, var(--main-color) 20%, transparent);
}

/* -- STATES -- */
.state-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  min-height: 240px;
  opacity: 0.6;
}

.empty-icon {
  color: var(--text-color);
}

.spinner {
  width: 32px;
  height: 32px;
  border: 5px solid var(--menu-border);
  border-top-color: var(--main-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

/* -- GRID -- */
.calls-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}

/* -- CARD -- */
.call-card {
  background: var(--menu-color);
  border: 1px solid var(--menu-border);
  border-radius: 16px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  transition: border-color 0.2s, transform 0.2s;
}

.call-card:hover {
  border-color: var(--main-color);
  transform: translateY(-2px);
}

.call-card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.call-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.call-id {
  font-size: 12px;
  opacity: 0.4;
  font-weight: 700;
}

.status-badge {
  font-size: 10.5px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  padding: 3px 10px;
  border-radius: 100px;
}

.status-open    { background: color-mix(in srgb, var(--good-color) 15%, transparent); color: var(--good-color); }
.status-draft   { background: color-mix(in srgb, var(--wait-color) 15%, transparent); color: var(--wait-color); }
.status-closed  { background: color-mix(in srgb, var(--text-color) 10%, transparent); color: var(--text-color); opacity: 0.7; }
.status-expired { background: color-mix(in srgb, var(--error-color) 15%, transparent); color: var(--error-color); }

.program-tag {
  font-size: 11px;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 100px;
  background: var(--main-color-light);
  color: var(--main-color-dark);
  border: 1px solid color-mix(in srgb, var(--main-color) 20%, transparent);
}

.call-title {
  font-size: 17px;
  font-weight: 700;
  margin: 0;
  line-height: 1.35;
}

.call-desc {
  font-size: 13.5px;
  line-height: 1.6;
  opacity: 0.75;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.spec-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.spec-tag {
  font-size: 11.5px;
  padding: 3px 10px;
  border-radius: 6px;
  background: var(--table-header-bg-color);
  color: var(--text-color);
  opacity: 0.85;
  font-weight: 600;
}

.call-footer {
  margin-top: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--menu-border);
}

.call-info-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12.5px;
  opacity: 0.7;
}

.info-item svg {
  flex-shrink: 0;
  color: var(--main-color);
  opacity: 1;
}

/* -- ADMIN ACTIONS -- */
.admin-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  padding: 7px 16px;
  border-radius: 8px;
  border: none;
  font-family: inherit;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.2s, transform 0.15s;
}

.action-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.action-btn:not(:disabled):hover {
  transform: translateY(-1px);
}

.action-btn--open  { background: var(--good-color);  color: #fff; }
.action-btn--close { background: var(--error-color); color: #fff; }

@media (max-width: 640px) {
  .page-inner { padding: 32px 20px; }
  .calls-grid { grid-template-columns: 1fr; }
}
</style>
