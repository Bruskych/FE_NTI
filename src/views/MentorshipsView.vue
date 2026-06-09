<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useMentorshipsStore } from '@/stores/mentorships'
import type { Mentorship } from '@/stores/mentorships'

const mentorshipsStore = useMentorshipsStore()

const expanded = ref<Set<number>>(new Set())

function toggleExpand(id: number) {
  if (expanded.value.has(id)) expanded.value.delete(id)
  else expanded.value.add(id)
}

const formatDate = (d: string | null) => {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('sk-SK', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

const formatDateOnly = (d: string | null) => {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('sk-SK', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function statusClass(m: Mentorship) {
  return `ms-${m.status}`
}

onMounted(() => mentorshipsStore.fetchMentorships())
</script>

<template>
  <div class="mentorships-page">
    <div class="page-inner">

      <div class="page-header">
        <h1>{{ $t('mentorships.title') }}</h1>
        <p class="subtitle">{{ $t('mentorships.subtitle') }}</p>
      </div>

      <div v-if="mentorshipsStore.loading" class="state-box">
        <div class="spinner"></div>
        <p>{{ $t('mentorships.loading') }}</p>
      </div>

      <div v-else-if="mentorshipsStore.mentorships.length === 0" class="empty-card">
        <svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" class="empty-icon">
          <path d="M12 20h9"/>
          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
        </svg>
        <p class="empty-title">{{ $t('mentorships.empty') }}</p>
        <p class="empty-desc">{{ $t('mentorships.empty_desc') }}</p>
      </div>

      <div v-else class="mentorships-list">
        <div
          v-for="m in mentorshipsStore.mentorships"
          :key="m.id"
          class="mentorship-card"
          :class="{ 'card-active': m.is_active }"
        >
          <!-- Card header -->
          <div class="card-header" @click="toggleExpand(m.id)">
            <div class="card-header-left">
              <span class="status-badge" :class="statusClass(m)">
                {{ $t(`mentorships.status_${m.status}`) }}
              </span>
              <span class="project-name">
                {{ m.project ? m.project.title : $t('mentorships.no_project') }}
              </span>
            </div>
            <div class="card-header-right">
              <div class="date-range">
                <span v-if="m.started_at" class="date-item">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                  </svg>
                  {{ formatDateOnly(m.started_at) }}
                </span>
                <span v-if="m.finished_at" class="date-item date-item--finished">
                  → {{ formatDateOnly(m.finished_at) }}
                </span>
              </div>
              <svg
                xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" stroke-width="2"
                stroke-linecap="round" stroke-linejoin="round"
                class="expand-icon"
                :class="{ rotated: expanded.has(m.id) }"
              >
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </div>
          </div>

          <!-- Consultations -->
          <div v-if="expanded.has(m.id)" class="consultations-section">
            <h4 class="consult-title">{{ $t('mentorships.consultations_title') }}</h4>

            <div v-if="!m.consultations?.length" class="no-consult">
              {{ $t('mentorships.no_consultations') }}
            </div>

            <div v-else class="consult-list">
              <div
                v-for="c in m.consultations"
                :key="c.id"
                class="consult-row"
                :class="{ 'consult-completed': c.is_completed, 'consult-upcoming': c.is_upcoming && !c.is_completed }"
              >
                <div class="consult-dot" :class="c.is_completed ? 'dot-done' : c.is_upcoming ? 'dot-upcoming' : 'dot-pending'"></div>
                <div class="consult-body">
                  <div class="consult-top">
                    <span class="consult-date">
                      {{ c.scheduled_at ? formatDate(c.scheduled_at) : '—' }}
                    </span>
                    <span v-if="c.is_completed" class="consult-badge badge-done">
                      {{ $t('mentorships.consultation_completed') }}
                    </span>
                    <span v-else-if="c.is_upcoming" class="consult-badge badge-upcoming">
                      {{ $t('mentorships.consultation_upcoming') }}
                    </span>
                  </div>
                  <div v-if="c.notes" class="consult-notes">
                    <span class="consult-notes-label">{{ $t('mentorships.consultation_notes') }}:</span>
                    {{ c.notes }}
                  </div>
                  <div v-if="c.recommendations" class="consult-notes">
                    <span class="consult-notes-label">{{ $t('mentorships.consultation_recommendations') }}:</span>
                    {{ c.recommendations }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
.mentorships-page {
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
  gap: 32px;
}

.page-header h1 {
  font-size: clamp(22px, 3vw, 30px);
  font-weight: 800; letter-spacing: -0.5px; margin: 0 0 6px 0;
}
.subtitle { font-size: 15px; opacity: 0.65; margin: 0; }

/* STATES */
.state-box {
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; gap: 14px; min-height: 240px; opacity: 0.6;
}
.spinner {
  width: 32px; height: 32px;
  border: 5px solid var(--menu-border);
  border-top-color: var(--main-color);
  border-radius: 50%; animation: spin 1s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.empty-card {
  display: flex; flex-direction: column; align-items: center;
  gap: 12px; padding: 60px 40px;
  background: var(--menu-color); border: 1px solid var(--menu-border);
  border-radius: 20px; text-align: center;
}
.empty-icon  { color: var(--main-color); opacity: 0.4; }
.empty-title { font-size: 17px; font-weight: 800; margin: 0; }
.empty-desc  { font-size: 14px; opacity: 0.6; margin: 0; }

/* LIST */
.mentorships-list { display: flex; flex-direction: column; gap: 14px; }

/* CARD */
.mentorship-card {
  background: var(--menu-color);
  border: 1px solid var(--menu-border);
  border-radius: 16px;
  overflow: hidden;
  transition: border-color 0.2s;
}
.mentorship-card:hover { border-color: var(--main-color); }
.card-active { border-color: color-mix(in srgb, var(--good-color) 40%, transparent); }

.card-header {
  display: flex; align-items: center;
  justify-content: space-between; gap: 12px;
  padding: 18px 22px;
  cursor: pointer;
  user-select: none;
}
.card-header-left { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.card-header-right { display: flex; align-items: center; gap: 12px; flex-shrink: 0; }

/* STATUS BADGES */
.status-badge {
  font-size: 10.5px; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.8px;
  padding: 3px 10px; border-radius: 100px;
}
.ms-pending  { background: color-mix(in srgb, var(--wait-color) 15%, transparent); color: var(--wait-color); }
.ms-active   { background: color-mix(in srgb, var(--good-color) 15%, transparent); color: var(--good-color); }
.ms-finished { background: color-mix(in srgb, #6366f1 15%, transparent); color: #6366f1; }
.ms-cancelled { background: color-mix(in srgb, var(--text-color) 10%, transparent); color: var(--text-color); opacity: 0.7; }

.project-name { font-size: 15px; font-weight: 700; }

.date-range { display: flex; align-items: center; gap: 6px; }
.date-item {
  display: flex; align-items: center; gap: 4px;
  font-size: 12px; opacity: 0.6;
}
.date-item--finished { opacity: 0.45; }

.expand-icon {
  transition: transform 0.2s;
  opacity: 0.5;
  flex-shrink: 0;
}
.expand-icon.rotated { transform: rotate(180deg); }

/* CONSULTATIONS */
.consultations-section {
  padding: 0 22px 22px;
  border-top: 1px solid var(--menu-border);
  padding-top: 18px;
}
.consult-title {
  margin: 0 0 14px;
  font-size: 13px; font-weight: 800;
  text-transform: uppercase; letter-spacing: 0.7px; opacity: 0.55;
}
.no-consult { font-size: 13.5px; opacity: 0.5; }

.consult-list { display: flex; flex-direction: column; gap: 0; }

.consult-row {
  display: flex; gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid var(--menu-border);
}
.consult-row:last-child { border-bottom: none; }

.consult-dot {
  width: 10px; height: 10px; border-radius: 50%;
  margin-top: 5px; flex-shrink: 0;
}
.dot-done     { background: var(--good-color); }
.dot-upcoming { background: var(--main-color); }
.dot-pending  { background: var(--menu-border); }

.consult-body { flex: 1; display: flex; flex-direction: column; gap: 6px; }
.consult-top {
  display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
}
.consult-date { font-size: 13.5px; font-weight: 600; }

.consult-badge {
  font-size: 10px; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.7px;
  padding: 2px 8px; border-radius: 100px;
}
.badge-done     { background: color-mix(in srgb, var(--good-color) 15%, transparent); color: var(--good-color); }
.badge-upcoming { background: color-mix(in srgb, var(--main-color) 15%, transparent); color: var(--main-color-dark); }

.consult-notes {
  font-size: 13px; line-height: 1.5; opacity: 0.75;
}
.consult-notes-label { font-weight: 700; opacity: 1; }

@media (max-width: 640px) {
  .page-inner { padding: 32px 20px; }
  .card-header { flex-direction: column; align-items: flex-start; }
  .card-header-right { width: 100%; justify-content: space-between; }
}
</style>
