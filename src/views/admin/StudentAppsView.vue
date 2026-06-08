<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useAdminStore } from '@/stores/admin'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()

import IconButton from '@/components/ui/IconButton.vue'
import AcceptIcon from '@/assets/icons/check.svg'
import RejectIcon from '@/assets/icons/close.svg'
import BaseInput from '@/components/ui/BaseInput.vue'
import SortableTh from '@/components/ui/SortableTh.vue'
import EmptyIcon from '@/assets/icons/empty.svg'

const adminStore = useAdminStore()
const commentText = ref<Record<number, string>>({})

const sortKey = ref<string | null>(null)
const sortOrder = ref<'asc' | 'desc'>('asc')

const sortBy = (key: string) => {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    sortOrder.value = 'asc'
  }
}

const sortedApplications = computed(() => {
  const list = [...adminStore.studentApplications]
  if (!sortKey.value) return list

  return list.sort((a, b) => {
    const valA = String(a[sortKey.value as keyof typeof a] ?? '')
    const valB = String(b[sortKey.value as keyof typeof b] ?? '')
    const modifier = sortOrder.value === 'asc' ? 1 : -1
    return valA > valB ? modifier : -modifier
  })
})

const handleApprove = async (appId: number) => {
  try {
    await adminStore.approveStudent(appId, commentText.value[appId])
    delete commentText.value[appId]
  } catch (err) {
    alert(err)
  }
}

const handleReject = async (appId: number) => {
  if (!commentText.value[appId]) {
    alert(t('Prosím, uveďte dôvod zamietnutia žiadosti.'))
    return
  }
  try {
    await adminStore.rejectStudent(appId, commentText.value[appId])
    delete commentText.value[appId]
  } catch (err) {
    alert(err)
  }
}

const formatDate = (dateString: string | null) =>
    dateString
        ? new Date(dateString).toLocaleDateString('sk-SK', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
        : ''

onMounted(() => {
  adminStore.fetchPendingStudents()
})
</script>

<template>
  <div class="student-apps-page">
    <div class="page-header">
      <h1>{{ $t('adminTable.student_apps.title') }}</h1>
      <p class="subtitle">{{ $t('adminTable.student_apps.subtitle') }}</p>
    </div>

    <div class="table-container">
      <div class="table-header">
        <SortableTh field="application_id" :sort-key="sortKey" :sort-order="sortOrder" @sort="sortBy">
          {{ $t('adminTable.student_apps.columns.id') }}
        </SortableTh>

        <SortableTh field="student_name" :sort-key="sortKey" :sort-order="sortOrder" @sort="sortBy">
          {{ $t('adminTable.student_apps.columns.name') }}
        </SortableTh>

        <SortableTh field="student_email" :sort-key="sortKey" :sort-order="sortOrder" @sort="sortBy">
          {{ $t('adminTable.student_apps.columns.email') }}
        </SortableTh>

        <SortableTh field="submitted_at" :sort-key="sortKey" :sort-order="sortOrder" @sort="sortBy">
          {{ $t('adminTable.student_apps.columns.date') }}
        </SortableTh>

        <div class="th">{{ $t('adminTable.student_apps.columns.comment') }}</div>
        <div class="th">{{ $t('adminTable.student_apps.columns.actions') }}</div>
      </div>

      <div class="table-body">
        <div v-if="adminStore.loading" class="table-loading">
          <div class="spinner"></div>
          <p>{{ $t('adminTable.student_apps.loading') }}</p>
        </div>

        <div v-else-if="sortedApplications.length === 0" class="empty-state">
          <div class="empty-icon"><EmptyIcon class="icon" /></div>
          <p>{{ $t('adminTable.student_apps.empty') }}</p>
        </div>

        <div v-else v-for="app in sortedApplications" :key="app.application_id" class="table-row">
          <div class="td app-id">#{{ app.application_id }}</div>
          <div class="td student-name">{{ app.student_name }}</div>
          <div class="td email">{{ app.student_email }}</div>
          <div class="td date-td">{{ formatDate(app.submitted_at) }}</div>

          <div class="td">
            <BaseInput
                :model-value="commentText[app.application_id] || ''"
                @update:model-value="val => commentText[app.application_id] = val"
                :placeholder="$t('adminTable.student_apps.comment_placeholder')"
                no-margin
                :disabled="adminStore.actionLoading === app.application_id"
                variant="table"
            />
          </div>

          <div class="td actions-td">
            <div class="buttons-group">
              <IconButton
                  severity="success"
                  :disabled="adminStore.actionLoading !== null"
                  @click="handleApprove(app.application_id)"
                  v-tooltip="$t('actions.submit_application')"
              >
                <AcceptIcon v-if="adminStore.actionLoading !== app.application_id" />
              </IconButton>

              <IconButton
                  severity="danger"
                  :disabled="adminStore.actionLoading !== null"
                  @click="handleReject(app.application_id)"
                  v-tooltip="$t('actions.cancel_application')"
              >
                <RejectIcon v-if="adminStore.actionLoading !== app.application_id" />
              </IconButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.student-apps-page {
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
  grid-template-columns: 80px 1fr 1fr 150px 220px 120px;
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
  grid-template-columns: 80px 1fr 1fr 150px 220px 120px;
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
  font-weight: bold;
  color: var(--main-color);
}
.student-name {
  font-weight: 550;
}
.date-td {
  font-weight: 550;
  font-size: 14px;
}
.actions-td {
  transform: translateX(4px);
}
.buttons-group {
  display: flex;
  gap: 8px;
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