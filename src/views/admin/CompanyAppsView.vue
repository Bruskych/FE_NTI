<script setup lang="ts">
import { ref, onMounted } from 'vue'
import api from '@/core/api/axios'

import IconButton from '@/components/ui/IconButton.vue'
import AcceptIcon from '@/assets/icons/check.svg'
import RejectIcon from '@/assets/icons/close.svg'
import SortableTh from "@/components/ui/SortableTh.vue";
import BaseInput from "@/components/ui/BaseInput.vue";
import EmptyIcon from '@/assets/icons/empty.svg'

interface CompanyApplication {
  application_id: number
  status: string
  submitted_at: string
  company_name: string
  company_tax_id: string
  sector: string
  website_link: string | null
  description: string
  owner_name: string
  owner_email: string
  user_id: number | null
}

const sortKey = ref<string | null>(null)
const sortOrder = ref<'asc' | 'desc'>('asc')

const sortBy = (key: string) => {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    sortOrder.value = 'asc'
  }

  applications.value.sort((a, b) => {
    let valA = a[key as keyof CompanyApplication] ?? ''
    let valB = b[key as keyof CompanyApplication] ?? ''

    const strA = valA.toString().toLowerCase()
    const strB = valB.toString().toLowerCase()

    const modifier = sortOrder.value === 'asc' ? 1 : -1

    if (strA < strB) return -1 * modifier
    if (strA > strB) return 1 * modifier
    return 0
  })
}

const applications = ref<CompanyApplication[]>([])
const loading = ref(false)
const actionLoading = ref<number | null>(null)
const commentText = ref<Record<number, string>>({})

const fetchPendingApplications = async () => {
  loading.value = true
  try {
    const { data } = await api.get('/admin/companies/pending')
    applications.value = data
  } catch (error) {
    console.error('Error loading company applications:', error)
  } finally {
    loading.value = false
  }
}

const handleApprove = async (appId: number) => {
  actionLoading.value = appId
  try {
    await api.post(`/admin/companies/${appId}/approve`, {
      comment: commentText.value[appId] || 'Firma schválená administrátorom.'
    })
    applications.value = applications.value.filter(app => app.application_id !== appId)
  } catch (error) {
    console.error('Error approving company:', error)
  } finally {
    actionLoading.value = null
  }
}

const handleReject = async (appId: number) => {
  if (!commentText.value[appId]) {
    alert('Prosím, uveďte dôvod zamietnutia registrácie firmy.')
    return
  }
  actionLoading.value = appId
  try {
    await api.post(`/admin/companies/${appId}/reject`, {
      comment: commentText.value[appId]
    })
    applications.value = applications.value.filter(app => app.application_id !== appId)
  } catch (error) {
    console.error('Error rejecting company:', error)
  } finally {
    actionLoading.value = null
  }
}

const formatDate = (dateString: string) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('sk-SK', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(() => {
  fetchPendingApplications()
})
</script>

<template>
  <div class="company-apps-page">
    <div class="page-header">
      <h1>
        {{ $t('adminTable.company_apps.title') }}
      </h1>
      <p class="subtitle">
        {{ $t('adminTable.company_apps.subtitle') }}
      </p>
    </div>

    <div class="table-container">
      <div class="table-header">
        <SortableTh field="application_id" :sort-key="sortKey" :sort-order="sortOrder" @sort="sortBy">
          {{ $t('adminTable.company_apps.columns.id') }}
        </SortableTh>

        <SortableTh field="company_name" :sort-key="sortKey" :sort-order="sortOrder" @sort="sortBy">
          {{ $t('adminTable.company_apps.columns.company') }}
        </SortableTh>

        <SortableTh field="company_tax_id" :sort-key="sortKey" :sort-order="sortOrder" @sort="sortBy">
          {{ $t('adminTable.company_apps.columns.ico') }}
        </SortableTh>

        <SortableTh field="description" :sort-key="sortKey" :sort-order="sortOrder" @sort="sortBy">
          {{ $t('adminTable.company_apps.columns.description') }}
        </SortableTh>

        <SortableTh field="owner_name" :sort-key="sortKey" :sort-order="sortOrder" @sort="sortBy">
          {{ $t('adminTable.company_apps.columns.representative') }}
        </SortableTh>

        <SortableTh field="submitted_at" :sort-key="sortKey" :sort-order="sortOrder" @sort="sortBy">
          {{ $t('adminTable.company_apps.columns.date') }}
        </SortableTh>

        <div class="th">
          {{ $t('adminTable.company_apps.columns.comment') }}
        </div>

        <div class="th">
          {{ $t('adminTable.company_apps.columns.actions') }}
        </div>
      </div>

      <div class="table-body">
        <div v-if="loading" class="table-loading">
          <div class="spinner"></div>
          <p>{{ $t('adminTable.company_apps.loading') }}</p>
        </div>
        <div v-else-if="applications.length === 0" class="empty-state">
          <div class="empty-icon">
            <EmptyIcon class="icon" />
          </div>
          <p>{{ $t('adminTable.company_apps.empty') }}</p>
        </div>

        <div v-else v-for="app in applications" :key="app.application_id" class="table-row">
          <div class="td app-id">#{{ app.application_id }}</div>

          <div class="td company-info">
            <div class="company-name">{{ app.company_name }}</div>
            <div class="company-sector">{{ app.sector }}</div>
          </div>

          <div class="td tax-id">
            {{ app.company_tax_id }}
          </div>

          <div class="td description-text">
            {{ app.description }}
          </div>

          <div class="td owner-info">
            <div class="owner-name">{{ app.owner_name }}</div>
            <div class="owner-email">{{ app.owner_email }}</div>
          </div>

          <div class="td date-td">{{ formatDate(app.submitted_at) }}</div>

          <div class="td">
            <BaseInput
                v-model="commentText[app.application_id]"
                :placeholder="$t('adminTable.company_apps.comment_placeholder')"
                no-margin
                :disabled="actionLoading === app.application_id"
                variant="table"
            />
          </div>

          <div class="td actions-td">
            <div class="buttons-group">
              <IconButton severity="success" :disabled="actionLoading !== null" @click="handleApprove(app.application_id)">
                <AcceptIcon v-if="actionLoading !== app.application_id" />
              </IconButton>
              <IconButton severity="danger" :disabled="actionLoading !== null" @click="handleReject(app.application_id)">
                <RejectIcon v-if="actionLoading !== app.application_id" />
              </IconButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.company-apps-page {
  color: var(--text-color);
  display: flex;
  flex-direction: column;
  height: 100%;
}
.page-header {
  margin-bottom: 24px;
}
.subtitle {
  font-size: 16px;
}

/* -- TABLE STRUCTURE -- */
.table-container {
  background: var(--table-row-bg-color);
  display: flex;
  flex-direction: column;
  flex: 1;
  border-radius: 12px;
  border: 1px solid var(--menu-border);
  overflow: hidden;
}
.table-header {
  background: var(--table-header-bg-color);
  color: var(--table-header-text-color);
  display: grid;
  grid-template-columns: 80px 1.5fr 100px 2fr 1.5fr 120px 200px 120px;
  align-items: center;
  padding: 16px;
  font-weight: 600;
  border-bottom: 1px solid var(--menu-border);
}
.table-body {
  flex: 1;
  overflow-y: auto;
}
.table-row {
  background: var(--table-row-bg-color);
  color: var(--table-row-text-color);
  display: grid;
  grid-template-columns: 80px 1.5fr 100px 2fr 1.5fr 120px 200px 120px;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid var(--menu-border);

  &:hover {
    background: var(--table-header-bg-color);
  }
}
.table-row:last-child {
  border-bottom: none;
}
.td {
  padding: 0 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  word-break: break-word;
}
.th {
  display: flex;
  align-items: center;
  padding: 6px 8px;
  line-height: 1;
}

/* -- CELL CONTENT -- */
.app-id {
  font-weight: bold; color: var(--main-color);
}
.company-name {
  font-weight: 550;
  font-size: 17px;
  color: var(--text-color);
}
.company-sector {
  font-weight: 500;
  font-size: 14px;
  color: var(--table-row-text-color-unimp);
  opacity: 0.8;
}
.tax-id {
  font-size: 14px;
}
.description-text {
  font-size: 14px;
  line-height: 1.4;
  color: var(--text-color);
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.owner-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  overflow: hidden;
}
.owner-name {
  font-weight: 550;
  font-size: 17px;
  color: var(--text-color);
}
.owner-email {
  font-weight: 500;
  font-size: 14px;
  color: var(--table-row-text-color-unimp);
  opacity: 0.8;
}
.date-td {
  font-weight: 550;
  font-size: 14px;
}
.buttons-group {
  display: flex; gap: 8px; justify-content: flex-end;
}

/* -- STATES & LOADING -- */
.empty-state, .table-loading {
  height: 100%;
  min-height: 250px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 12px;
}
.empty-state {
  opacity: 0.6;
}
.table-loading {
  opacity: 0.7;
}
.empty-icon {
  width: 50px;
  height: 50px;
  margin-bottom: 8px;
  color: var(--text-color);
}
.spinner {
  width: 32px;
  height: 32px;
  border: 6px solid var(--table-header-bg-color-hover);
  border-top-color: var(--main-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>