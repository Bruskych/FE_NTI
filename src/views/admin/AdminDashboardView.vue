<script setup lang="ts">
import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAdminStore } from '@/stores/admin'

const { t } = useI18n()
const store = useAdminStore()

onMounted(() => {
  store.fetchDashboard()
})

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('sk-SK', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function primaryRole(roles: { name: string }[]): string {
  return roles?.[0]?.name ?? '—'
}
</script>

<template>
  <div class="dash-view">
    <h1 class="dash-title">{{ t('adminPanel.dash_title') }}</h1>

    <div v-if="store.dashboardLoading" class="dash-loading">{{ t('adminPanel.dash_loading') }}</div>

    <template v-else-if="store.dashboard">
      <!-- Stat cards -->
      <div class="stat-grid">
        <div class="stat-card stat-blue">
          <span class="stat-value">{{ store.dashboard.users_count }}</span>
          <span class="stat-label">{{ t('adminPanel.dash_users_total') }}</span>
        </div>
        <div class="stat-card stat-amber">
          <span class="stat-value">{{ store.dashboard.pending_applications_count }}</span>
          <span class="stat-label">{{ t('adminPanel.dash_pending_apps') }}</span>
        </div>
      </div>

      <!-- Latest users -->
      <div class="latest-section">
        <h2 class="section-title">{{ t('adminPanel.dash_latest_users') }}</h2>

        <div v-if="!store.dashboard.latest_users.length" class="empty-text">
          {{ t('adminPanel.dash_no_users') }}
        </div>

        <table v-else class="users-table">
          <thead>
            <tr>
              <th>#</th>
              <th>{{ t('adminPanel.dash_col_name') }}</th>
              <th>{{ t('adminPanel.dash_col_email') }}</th>
              <th>{{ t('adminPanel.dash_col_role') }}</th>
              <th>{{ t('adminPanel.dash_col_joined') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in store.dashboard.latest_users" :key="user.id">
              <td class="cell-id">{{ user.id }}</td>
              <td class="cell-name">{{ user.name }}</td>
              <td class="cell-email">{{ user.email }}</td>
              <td><span class="role-badge">{{ primaryRole(user.roles) }}</span></td>
              <td class="cell-date">{{ formatDate(user.created_at) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
  </div>
</template>

<style scoped>
.dash-view {
  color: var(--text-color);
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.dash-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
}

.dash-loading {
  color: var(--text-muted, #888);
  font-size: 0.95rem;
}

/* Stat cards */
.stat-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
}

.stat-card {
  border-radius: 14px;
  padding: 28px 24px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: var(--card-color, var(--bg-secondary));
  border: 1px solid var(--border-color, rgba(255,255,255,0.08));
}

.stat-card.stat-blue .stat-value { color: #3b82f6; }
.stat-card.stat-amber .stat-value { color: #f59e0b; }

.stat-value {
  font-size: 2.2rem;
  font-weight: 800;
  line-height: 1;
}

.stat-label {
  font-size: 0.85rem;
  color: var(--text-muted, #888);
  font-weight: 500;
}

/* Latest users table */
.latest-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.section-title {
  font-size: 1.05rem;
  font-weight: 700;
  margin: 0;
}

.empty-text {
  color: var(--text-muted, #888);
  font-size: 0.9rem;
}

.users-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

.users-table thead tr {
  border-bottom: 1px solid var(--border-color, rgba(255,255,255,0.1));
}

.users-table th {
  text-align: left;
  padding: 10px 12px;
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--text-muted, #888);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.users-table td {
  padding: 12px 12px;
  border-bottom: 1px solid var(--border-color, rgba(255,255,255,0.06));
  vertical-align: middle;
}

.users-table tbody tr:last-child td {
  border-bottom: none;
}

.cell-id {
  color: var(--text-muted, #888);
  font-size: 0.82rem;
  width: 48px;
}

.cell-name {
  font-weight: 600;
}

.cell-email {
  color: var(--text-muted, #888);
  font-size: 0.85rem;
}

.cell-date {
  color: var(--text-muted, #888);
  font-size: 0.85rem;
  white-space: nowrap;
}

.role-badge {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 0.76rem;
  font-weight: 600;
  background: var(--border-color, rgba(255,255,255,0.1));
  color: var(--text-color);
}
</style>
