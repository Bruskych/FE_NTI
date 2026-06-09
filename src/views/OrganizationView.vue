<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useOrganizationsStore } from '@/stores/organizations'
import { useAuthStore } from '@/stores/auth'

const { t } = useI18n()
const orgStore = useOrganizationsStore()
const authStore = useAuthStore()

const org = computed(() => orgStore.organization)

const isOwner = computed(() => {
  if (!org.value || !authStore.user) return false
  return org.value.users.some(u => u.id === authStore.user!.id)
})

// Edit form
const editing = ref(false)
const editError = ref<string | null>(null)
const editForm = ref({ name: '', sector: '', website_link: '', description: '' })

function openEdit() {
  if (!org.value) return
  editForm.value = {
    name: org.value.name,
    sector: org.value.sector ?? '',
    website_link: org.value.website_link ?? '',
    description: org.value.description ?? '',
  }
  editError.value = null
  editing.value = true
}

async function handleSave() {
  if (!org.value) return
  editError.value = null
  try {
    await orgStore.updateOrganization(org.value.id, editForm.value)
    editing.value = false
  } catch (err: unknown) {
    editError.value = (err as Error).message ?? 'Error'
  }
}

// Add member
const inviteEmail = ref('')
const inviteError = ref<string | null>(null)
const inviteSuccess = ref(false)

async function handleAddMember() {
  if (!org.value || !inviteEmail.value) return
  inviteError.value = null
  inviteSuccess.value = false
  try {
    await orgStore.addMember(org.value.id, inviteEmail.value)
    inviteSuccess.value = true
    inviteEmail.value = ''
  } catch (err: unknown) {
    inviteError.value = (err as Error).message ?? 'Error'
  }
}

async function handleRemoveMember(userId: number) {
  if (!org.value) return
  if (!confirm(t('organizations.remove_confirm'))) return
  await orgStore.removeMember(org.value.id, userId)
}

const formatDate = (d: string | null) => {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('sk-SK', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

onMounted(() => {
  const orgId = authStore.user?.organization_id
  if (orgId) orgStore.fetchMyOrganization(orgId)
})
</script>

<template>
  <div class="org-page">
    <div class="page-inner">

      <div class="page-header">
        <div>
          <h1>{{ $t('organizations.title') }}</h1>
          <p class="subtitle">{{ $t('organizations.subtitle') }}</p>
        </div>
      </div>

      <div v-if="orgStore.loading" class="state-box">
        <div class="spinner"></div>
        <p>{{ $t('organizations.loading') }}</p>
      </div>

      <div v-else-if="!org" class="empty-card">
        <svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" class="empty-icon">
          <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
        </svg>
        <p class="empty-title">{{ $t('organizations.no_org') }}</p>
        <p class="empty-desc">{{ $t('organizations.no_org_desc') }}</p>
      </div>

      <template v-else>

        <!-- Info card -->
        <div class="section-card">
          <div class="section-header">
            <h3 class="section-title">{{ $t('organizations.info_title') }}</h3>
            <div class="section-header-right">
              <span class="status-badge" :class="`org-${org.status}`">
                {{ $t(`organizations.status_${org.status}`) }}
              </span>
              <button v-if="isOwner" class="btn btn-secondary" @click="openEdit">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
                {{ $t('organizations.edit_info') }}
              </button>
            </div>
          </div>

          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">{{ $t('organizations.label_name') }}</span>
              <span class="info-value">{{ org.name }}</span>
            </div>
            <div v-if="org.tax_id" class="info-item">
              <span class="info-label">{{ $t('organizations.label_tax_id') }}</span>
              <span class="info-value">{{ org.tax_id }}</span>
            </div>
            <div v-if="org.sector" class="info-item">
              <span class="info-label">{{ $t('organizations.label_sector') }}</span>
              <span class="info-value">{{ org.sector }}</span>
            </div>
            <div v-if="org.website_link" class="info-item">
              <span class="info-label">{{ $t('organizations.label_website') }}</span>
              <a :href="org.website_link" target="_blank" class="info-link">{{ org.website_link }}</a>
            </div>
            <div class="info-item">
              <span class="info-label">{{ $t('organizations.label_created') }}</span>
              <span class="info-value">{{ formatDate(org.created_at) }}</span>
            </div>
          </div>

          <div v-if="org.description" class="org-desc-block">
            <span class="info-label">{{ $t('organizations.label_description') }}</span>
            <p class="org-desc">{{ org.description }}</p>
          </div>
        </div>

        <!-- Members card -->
        <div class="section-card">
          <div class="section-header">
            <h3 class="section-title">{{ $t('organizations.members_title') }}</h3>
          </div>

          <div v-if="org.users.length === 0" class="no-members">
            {{ $t('organizations.no_members') }}
          </div>

          <div v-else class="members-list">
            <div v-for="member in org.users" :key="member.id" class="member-row">
              <div class="member-avatar">
                <img v-if="member.avatar_url" :src="member.avatar_url" :alt="member.name" />
                <span v-else>{{ member.name.charAt(0).toUpperCase() }}</span>
              </div>
              <div class="member-info">
                <span class="member-name">{{ member.name }}</span>
                <span class="member-email">{{ member.email }}</span>
              </div>
              <div class="member-right">
                <span v-if="member.roles?.length" class="role-tag">{{ member.roles[0] }}</span>
                <button
                  v-if="isOwner && member.id !== authStore.user?.id"
                  class="remove-btn"
                  :disabled="orgStore.actionLoading"
                  @click="handleRemoveMember(member.id)"
                >
                  {{ $t('organizations.remove_member') }}
                </button>
              </div>
            </div>
          </div>

          <!-- Add member form -->
          <div v-if="isOwner" class="add-member-form">
            <input
              v-model="inviteEmail"
              type="email"
              :placeholder="$t('organizations.invite_email')"
              class="invite-input"
              @keydown.enter.prevent="handleAddMember"
            />
            <button
              class="btn btn-primary"
              :disabled="orgStore.actionLoading || !inviteEmail"
              @click="handleAddMember"
            >
              {{ $t('organizations.invite_send') }}
            </button>
          </div>
          <p v-if="inviteSuccess" class="success-msg">{{ $t('organizations.invite_success') }}</p>
          <p v-if="inviteError" class="error-msg">{{ inviteError }}</p>
        </div>

      </template>

      <!-- Edit modal -->
      <div v-if="editing" class="modal-overlay" @click.self="editing = false">
        <div class="modal-box">
          <h3>{{ $t('organizations.edit_info') }}</h3>
          <form class="edit-form" @submit.prevent="handleSave">
            <label class="form-label">
              {{ $t('organizations.label_name') }} *
              <input v-model="editForm.name" required type="text" class="form-input" />
            </label>
            <label class="form-label">
              {{ $t('organizations.label_sector') }}
              <input v-model="editForm.sector" type="text" class="form-input" />
            </label>
            <label class="form-label">
              {{ $t('organizations.label_website') }}
              <input v-model="editForm.website_link" type="url" class="form-input" />
            </label>
            <label class="form-label">
              {{ $t('organizations.label_description') }}
              <textarea v-model="editForm.description" rows="4" class="form-input"></textarea>
            </label>
            <p v-if="editError" class="error-msg">{{ editError }}</p>
            <div class="form-actions">
              <button type="button" class="btn btn-secondary" @click="editing = false">{{ $t('organizations.cancel') }}</button>
              <button type="submit" class="btn btn-primary" :disabled="orgStore.actionLoading">
                {{ orgStore.actionLoading ? $t('organizations.saving') : $t('organizations.save') }}
              </button>
            </div>
          </form>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
.org-page {
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
  font-weight: 800;
  letter-spacing: -0.5px;
  margin: 0 0 6px 0;
}
.subtitle { font-size: 15px; opacity: 0.65; margin: 0; }

/* BUTTONS */
.btn {
  display: inline-flex; align-items: center; gap: 7px;
  padding: 9px 20px; border-radius: 10px; border: none;
  font-family: inherit; font-size: 13.5px; font-weight: 700;
  cursor: pointer; transition: opacity 0.18s, transform 0.15s;
}
.btn:disabled { opacity: 0.45; cursor: not-allowed; }
.btn:not(:disabled):hover { transform: translateY(-1px); }
.btn-primary  { background: var(--main-color); color: #fff; }
.btn-secondary {
  background: var(--menu-color);
  border: 1px solid var(--menu-border);
  color: var(--text-color);
}

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

/* SECTION CARD */
.section-card {
  background: var(--menu-color);
  border: 1px solid var(--menu-border);
  border-radius: 20px; padding: 28px;
  display: flex; flex-direction: column; gap: 20px;
}

.section-header {
  display: flex; align-items: center;
  justify-content: space-between; gap: 12px; flex-wrap: wrap;
}
.section-header-right { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.section-title { margin: 0; font-size: 16px; font-weight: 800; letter-spacing: -0.3px; }

/* STATUS BADGE */
.status-badge {
  font-size: 10.5px; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.8px;
  padding: 3px 10px; border-radius: 100px;
}
.org-pending  { background: color-mix(in srgb, var(--wait-color) 15%, transparent); color: var(--wait-color); }
.org-active   { background: color-mix(in srgb, var(--good-color) 15%, transparent); color: var(--good-color); }
.org-rejected { background: color-mix(in srgb, var(--error-color) 15%, transparent); color: var(--error-color); }
.org-suspended { background: color-mix(in srgb, var(--text-color) 10%, transparent); color: var(--text-color); opacity: 0.7; }

/* INFO GRID */
.info-grid {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px 24px;
}
.info-item { display: flex; flex-direction: column; gap: 3px; }
.info-label {
  font-size: 11px; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.7px; opacity: 0.5;
}
.info-value { font-size: 15px; font-weight: 600; }
.info-link {
  font-size: 14px; font-weight: 600;
  color: var(--main-color); text-decoration: none;
}
.info-link:hover { text-decoration: underline; }

.org-desc-block { display: flex; flex-direction: column; gap: 6px; }
.org-desc { margin: 0; font-size: 14px; line-height: 1.6; opacity: 0.8; }

/* MEMBERS */
.no-members { font-size: 14px; opacity: 0.55; }
.members-list { display: flex; flex-direction: column; gap: 10px; }

.member-row {
  display: flex; align-items: center; gap: 14px;
  padding: 12px 16px; border-radius: 12px;
  background: var(--bg-color); border: 1px solid var(--menu-border);
  transition: border-color 0.18s;
}
.member-row:hover { border-color: var(--main-color); }

.member-avatar {
  width: 38px; height: 38px; border-radius: 50%;
  background: var(--main-color-light);
  color: var(--main-color-dark);
  font-weight: 800; font-size: 16px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; overflow: hidden;
}
.member-avatar img { width: 100%; height: 100%; object-fit: cover; }

.member-info { display: flex; flex-direction: column; gap: 2px; flex: 1; min-width: 0; }
.member-name { font-size: 14px; font-weight: 700; }
.member-email { font-size: 12px; opacity: 0.55; }
.member-right { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }

.role-tag {
  font-size: 11px; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.7px;
  padding: 3px 10px; border-radius: 100px;
  background: var(--main-color-light); color: var(--main-color-dark);
}

.remove-btn {
  font-size: 12px; font-weight: 700;
  padding: 4px 12px; border-radius: 8px;
  border: 1px solid var(--error-color);
  background: transparent; color: var(--error-color);
  cursor: pointer; font-family: inherit;
  transition: background 0.18s;
}
.remove-btn:hover { background: color-mix(in srgb, var(--error-color) 10%, transparent); }
.remove-btn:disabled { opacity: 0.45; cursor: not-allowed; }

/* ADD MEMBER */
.add-member-form {
  display: flex; gap: 10px;
  padding-top: 8px;
  border-top: 1px solid var(--menu-border);
}
.invite-input {
  flex: 1; padding: 9px 16px; border-radius: 10px;
  border: 1px solid var(--menu-border);
  background: var(--bg-color); color: var(--text-color);
  font-family: inherit; font-size: 14px; outline: none;
  transition: border-color 0.18s;
}
.invite-input:focus { border-color: var(--main-color); }

.success-msg { font-size: 13px; color: var(--good-color); font-weight: 600; margin: 0; }
.error-msg   { font-size: 13px; color: var(--error-color); font-weight: 600; margin: 0; }

/* MODAL */
.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.45);
  display: flex; align-items: center; justify-content: center;
  z-index: 1001; padding: 20px;
  color: var(--text-color);
}
.modal-box {
  background: var(--menu-color); border: 1px solid var(--menu-border);
  border-radius: 20px; padding: 32px;
  width: 100%; max-width: 500px;
}
.modal-box h3 { margin: 0 0 24px; font-size: 18px; font-weight: 800; }

.edit-form { display: flex; flex-direction: column; gap: 16px; }
.form-label {
  display: flex; flex-direction: column; gap: 6px;
  font-size: 13px; font-weight: 700;
}
.form-input {
  padding: 9px 14px; border-radius: 10px;
  border: 1px solid var(--menu-border);
  background: var(--bg-color); color: var(--text-color);
  font-family: inherit; font-size: 14px;
  outline: none; resize: vertical;
  transition: border-color 0.18s;
}
.form-input:focus { border-color: var(--main-color); }
.form-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 4px; }

@media (max-width: 640px) {
  .page-inner { padding: 32px 20px; }
  .add-member-form { flex-direction: column; }
  .info-grid { grid-template-columns: 1fr; }
}
</style>
