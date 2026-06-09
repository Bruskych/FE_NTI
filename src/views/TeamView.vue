<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useTeamStore } from '@/stores/team'
import { useAuthStore } from '@/stores/auth'

const teamStore = useTeamStore()
const authStore = useAuthStore()

const isLeader = computed(() =>
  !!teamStore.team && teamStore.team.leader?.id === authStore.user?.id
)

// Create team form
const showCreateForm = ref(false)
const createForm = ref({ name: '', description: '', capacity: '' })

// Edit team form
const showEditForm = ref(false)
const editForm = ref({ name: '', description: '', capacity: '' })

// Invite
const inviteEmail = ref('')
const inviteSuccess = ref(false)
const inviteError = ref<string | null>(null)

// General error
const actionError = ref<string | null>(null)

function openEditForm() {
  if (!teamStore.team) return
  editForm.value = {
    name: teamStore.team.name,
    description: teamStore.team.description ?? '',
    capacity: teamStore.team.capacity?.toString() ?? '',
  }
  showEditForm.value = true
}

const formatDate = (d: string | null) => {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('sk-SK', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

async function handleCreate() {
  actionError.value = null
  try {
    await teamStore.createTeam({
      name: createForm.value.name,
      description: createForm.value.description || undefined,
      capacity: createForm.value.capacity ? Number(createForm.value.capacity) : undefined,
    })
    showCreateForm.value = false
    createForm.value = { name: '', description: '', capacity: '' }
  } catch (err: unknown) {
    const e = err as { response?: { data?: { message?: string } } }
    actionError.value = e.response?.data?.message ?? 'Error'
  }
}

async function handleUpdate() {
  actionError.value = null
  try {
    await teamStore.updateTeam({
      name: editForm.value.name,
      description: editForm.value.description || undefined,
      capacity: editForm.value.capacity ? Number(editForm.value.capacity) : undefined,
    })
    showEditForm.value = false
  } catch (err: unknown) {
    const e = err as { response?: { data?: { message?: string } } }
    actionError.value = e.response?.data?.message ?? 'Error'
  }
}

async function handleInvite() {
  inviteError.value = null
  inviteSuccess.value = false
  try {
    await teamStore.inviteMember(inviteEmail.value)
    inviteSuccess.value = true
    inviteEmail.value = ''
  } catch (err: unknown) {
    const e = err as { response?: { data?: { message?: string } } }
    inviteError.value = e.response?.data?.message ?? 'Error'
  }
}

async function handleRemoveMember(userId: number) {
  if (!confirm('Remove this member from the team?')) return
  actionError.value = null
  try {
    await teamStore.removeMember(userId)
  } catch (err: unknown) {
    const e = err as { response?: { data?: { message?: string } } }
    actionError.value = e.response?.data?.message ?? 'Error'
  }
}

async function handleLeave() {
  if (!confirm('Are you sure you want to leave this team?')) return
  actionError.value = null
  try {
    await teamStore.leaveTeam()
  } catch (err: unknown) {
    const e = err as { response?: { data?: { message?: string } } }
    actionError.value = e.response?.data?.message ?? 'Error'
  }
}

async function handleDelete() {
  if (!confirm('Are you sure you want to delete this team? This cannot be undone.')) return
  actionError.value = null
  try {
    await teamStore.deleteTeam()
  } catch (err: unknown) {
    const e = err as { response?: { data?: { message?: string } } }
    actionError.value = e.response?.data?.message ?? 'Error'
  }
}

onMounted(() => teamStore.fetchMyTeam())
</script>

<template>
  <div class="team-page">
    <div class="page-inner">

      <div class="page-header">
        <div>
          <h1>{{ $t('team.title') }}</h1>
          <p class="subtitle">{{ $t('team.subtitle') }}</p>
        </div>
        <div class="header-actions" v-if="teamStore.team && isLeader">
          <button class="btn btn-secondary" @click="openEditForm">
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            {{ $t('team.edit_team') }}
          </button>
        </div>
      </div>

      <!-- Error banner -->
      <div v-if="actionError" class="error-banner">{{ actionError }}</div>

      <!-- Loading -->
      <div v-if="teamStore.loading" class="state-box">
        <div class="spinner"></div>
        <p>{{ $t('team.loading') }}</p>
      </div>

      <!-- No team -->
      <template v-else-if="!teamStore.team">
        <div class="no-team-card">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" class="no-team-icon">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
          <h2>{{ $t('team.no_team_title') }}</h2>
          <p>{{ $t('team.no_team_desc') }}</p>
          <button class="btn btn-primary" @click="showCreateForm = true">
            {{ $t('team.create_team') }}
          </button>
        </div>

        <!-- Create form -->
        <div v-if="showCreateForm" class="modal-overlay" @click.self="showCreateForm = false">
          <div class="modal-box">
            <h3>{{ $t('team.create_team') }}</h3>
            <form @submit.prevent="handleCreate" class="team-form">
              <label>
                {{ $t('team.form_name') }}
                <input v-model="createForm.name" required type="text" />
              </label>
              <label>
                {{ $t('team.form_description') }}
                <textarea v-model="createForm.description" rows="3"></textarea>
              </label>
              <label>
                {{ $t('team.form_capacity') }}
                <input v-model="createForm.capacity" type="number" min="1" :placeholder="$t('team.form_capacity_placeholder')" />
              </label>
              <div class="form-actions">
                <button type="button" class="btn btn-secondary" @click="showCreateForm = false">{{ $t('team.cancel') }}</button>
                <button type="submit" class="btn btn-primary" :disabled="teamStore.actionLoading">{{ $t('team.create_team') }}</button>
              </div>
            </form>
          </div>
        </div>
      </template>

      <!-- Team exists -->
      <template v-else>

        <!-- Team info card -->
        <div class="team-info-card">
          <div class="team-info-top">
            <div>
              <div class="team-name-row">
                <h2>{{ teamStore.team.name }}</h2>
                <span v-if="teamStore.team.is_full" class="badge badge-full">{{ $t('team.full_badge') }}</span>
                <span class="badge" :class="`badge-${teamStore.team.status}`">
                  {{ $t(`team.status_${teamStore.team.status}`) }}
                </span>
              </div>
              <p v-if="teamStore.team.description" class="team-desc">{{ teamStore.team.description }}</p>
            </div>
            <div class="team-stats">
              <div class="stat-item">
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                </svg>
                <span>{{ teamStore.team.members.length }}<template v-if="teamStore.team.capacity"> / {{ teamStore.team.capacity }}</template></span>
              </div>
            </div>
          </div>

          <div v-if="teamStore.team.skills?.length" class="skills-list">
            <span v-for="skill in teamStore.team.skills" :key="skill" class="skill-tag">{{ skill }}</span>
          </div>
        </div>

        <!-- Members -->
        <div class="section">
          <h3 class="section-title">{{ $t('team.members') }}</h3>
          <div class="members-list">
            <div v-for="member in teamStore.team.members" :key="member.id" class="member-row">
              <div class="member-avatar">{{ member.name.charAt(0).toUpperCase() }}</div>
              <div class="member-info">
                <span class="member-name">{{ member.name }}</span>
                <span class="member-email">{{ member.email }}</span>
              </div>
              <div class="member-right">
                <span class="role-badge" :class="`role-${member.team_role}`">
                  {{ $t(`team.role_${member.team_role}`) }}
                </span>
                <span class="joined-date">{{ formatDate(member.joined_at) }}</span>
                <button
                  v-if="isLeader && member.team_role !== 'leader'"
                  class="remove-btn"
                  :disabled="teamStore.actionLoading"
                  @click="handleRemoveMember(member.id)"
                >
                  {{ $t('team.remove_member') }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Invite (leader only) -->
        <div v-if="isLeader" class="section">
          <h3 class="section-title">{{ $t('team.invite_member') }}</h3>
          <div class="invite-form">
            <input
              v-model="inviteEmail"
              type="email"
              :placeholder="$t('team.invite_email_placeholder')"
              class="invite-input"
            />
            <button
              class="btn btn-primary"
              :disabled="teamStore.actionLoading || !inviteEmail"
              @click="handleInvite"
            >
              {{ $t('team.invite_send') }}
            </button>
          </div>
          <p v-if="inviteSuccess" class="success-msg">{{ $t('team.invite_success') }}</p>
          <p v-if="inviteError" class="error-msg">{{ inviteError }}</p>
        </div>

        <!-- Danger zone -->
        <div class="section danger-section">
          <button v-if="!isLeader" class="btn btn-danger" :disabled="teamStore.actionLoading" @click="handleLeave">
            {{ $t('team.leave_team') }}
          </button>
          <button v-if="isLeader" class="btn btn-danger" :disabled="teamStore.actionLoading" @click="handleDelete">
            {{ $t('team.delete_team') }}
          </button>
        </div>

      </template>

      <!-- Edit modal -->
      <div v-if="showEditForm" class="modal-overlay" @click.self="showEditForm = false">
        <div class="modal-box">
          <h3>{{ $t('team.edit_team') }}</h3>
          <form @submit.prevent="handleUpdate" class="team-form">
            <label>
              {{ $t('team.form_name') }}
              <input v-model="editForm.name" required type="text" />
            </label>
            <label>
              {{ $t('team.form_description') }}
              <textarea v-model="editForm.description" rows="3"></textarea>
            </label>
            <label>
              {{ $t('team.form_capacity') }}
              <input v-model="editForm.capacity" type="number" min="1" :placeholder="$t('team.form_capacity_placeholder')" />
            </label>
            <div class="form-actions">
              <button type="button" class="btn btn-secondary" @click="showEditForm = false">{{ $t('team.cancel') }}</button>
              <button type="submit" class="btn btn-primary" :disabled="teamStore.actionLoading">{{ $t('team.save') }}</button>
            </div>
          </form>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
.team-page {
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

.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
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

.header-actions { display: flex; gap: 10px; align-items: center; padding-top: 4px; }

/* BUTTONS */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 9px 20px;
  border-radius: 10px;
  border: none;
  font-family: inherit;
  font-size: 13.5px;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.18s, transform 0.15s;
}
.btn:disabled { opacity: 0.45; cursor: not-allowed; }
.btn:not(:disabled):hover { transform: translateY(-1px); }
.btn-primary  { background: var(--main-color); color: #fff; }
.btn-secondary {
  background: var(--menu-color);
  border: 1px solid var(--menu-border);
  color: var(--text-color);
}
.btn-danger { background: var(--error-color); color: #fff; }

/* STATE */
.state-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  min-height: 240px;
  opacity: 0.6;
}
.spinner {
  width: 32px; height: 32px;
  border: 5px solid var(--menu-border);
  border-top-color: var(--main-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* NO TEAM */
.no-team-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  padding: 60px 40px;
  background: var(--menu-color);
  border: 1px solid var(--menu-border);
  border-radius: 20px;
  text-align: center;
}
.no-team-icon { color: var(--main-color); opacity: 0.5; }
.no-team-card h2 { font-size: 20px; font-weight: 800; margin: 0; }
.no-team-card p { font-size: 14px; opacity: 0.65; margin: 0; max-width: 380px; }

/* TEAM INFO CARD */
.team-info-card {
  background: var(--menu-color);
  border: 1px solid var(--menu-border);
  border-radius: 20px;
  padding: 28px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.team-info-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}
.team-name-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}
.team-name-row h2 { margin: 0; font-size: 22px; font-weight: 800; }
.team-desc { margin: 6px 0 0; font-size: 14px; opacity: 0.7; }
.team-stats { display: flex; gap: 12px; align-items: center; }
.stat-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 700;
  color: var(--main-color);
}

/* BADGES */
.badge {
  font-size: 10.5px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  padding: 3px 10px;
  border-radius: 100px;
}
.badge-active     { background: color-mix(in srgb, var(--good-color) 15%, transparent); color: var(--good-color); }
.badge-recruiting { background: color-mix(in srgb, var(--main-color) 15%, transparent); color: var(--main-color-dark); }
.badge-formed     { background: color-mix(in srgb, #6366f1 15%, transparent); color: #6366f1; }
.badge-inactive   { background: color-mix(in srgb, var(--text-color) 10%, transparent); color: var(--text-color); opacity: 0.7; }
.badge-full       { background: color-mix(in srgb, var(--wait-color) 15%, transparent); color: var(--wait-color); }

/* SKILLS */
.skills-list { display: flex; flex-wrap: wrap; gap: 7px; }
.skill-tag {
  font-size: 12px;
  font-weight: 600;
  padding: 4px 12px;
  border-radius: 8px;
  background: var(--table-header-bg-color);
  color: var(--text-color);
}

/* SECTIONS */
.section {
  background: var(--menu-color);
  border: 1px solid var(--menu-border);
  border-radius: 16px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.section-title {
  margin: 0;
  font-size: 15px;
  font-weight: 800;
  letter-spacing: -0.3px;
}

/* MEMBERS */
.members-list { display: flex; flex-direction: column; gap: 10px; }
.member-row {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 16px;
  border-radius: 12px;
  background: var(--bg-color);
  border: 1px solid var(--menu-border);
  transition: border-color 0.18s;
}
.member-row:hover { border-color: var(--main-color); }
.member-avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: var(--main-color-light);
  color: var(--main-color-dark);
  font-weight: 800;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.member-info { display: flex; flex-direction: column; gap: 2px; flex: 1; min-width: 0; }
.member-name { font-size: 14px; font-weight: 700; }
.member-email { font-size: 12px; opacity: 0.55; }
.member-right { display: flex; align-items: center; gap: 10px; flex-shrink: 0; flex-wrap: wrap; }
.joined-date { font-size: 12px; opacity: 0.5; }
.role-badge {
  font-size: 10.5px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  padding: 3px 10px;
  border-radius: 100px;
}
.role-leader { background: color-mix(in srgb, var(--main-color) 15%, transparent); color: var(--main-color-dark); }
.role-member { background: color-mix(in srgb, var(--text-color) 8%, transparent); color: var(--text-color); opacity: 0.85; }

.remove-btn {
  font-size: 12px;
  font-weight: 700;
  padding: 4px 12px;
  border-radius: 8px;
  border: 1px solid var(--error-color);
  background: transparent;
  color: var(--error-color);
  cursor: pointer;
  font-family: inherit;
  transition: background 0.18s;
}
.remove-btn:hover { background: color-mix(in srgb, var(--error-color) 10%, transparent); }
.remove-btn:disabled { opacity: 0.45; cursor: not-allowed; }

/* INVITE */
.invite-form { display: flex; gap: 10px; }
.invite-input {
  flex: 1;
  padding: 9px 16px;
  border-radius: 10px;
  border: 1px solid var(--menu-border);
  background: var(--bg-color);
  color: var(--text-color);
  font-family: inherit;
  font-size: 14px;
  transition: border-color 0.18s;
  outline: none;
}
.invite-input:focus { border-color: var(--main-color); }
.success-msg { font-size: 13px; color: var(--good-color); font-weight: 600; margin: 0; }
.error-msg   { font-size: 13px; color: var(--error-color); font-weight: 600; margin: 0; }

/* DANGER */
.danger-section { border-color: color-mix(in srgb, var(--error-color) 30%, transparent); }

/* ERROR BANNER */
.error-banner {
  background: color-mix(in srgb, var(--error-color) 12%, transparent);
  border: 1px solid color-mix(in srgb, var(--error-color) 30%, transparent);
  color: var(--error-color);
  border-radius: 12px;
  padding: 12px 18px;
  font-size: 13.5px;
  font-weight: 600;
}

/* MODAL */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
  padding: 20px;
}
.modal-box {
  background: var(--menu-color);
  border: 1px solid var(--menu-border);
  border-radius: 20px;
  padding: 32px;
  width: 100%;
  max-width: 480px;
}
.modal-box h3 { margin: 0 0 24px; font-size: 18px; font-weight: 800; }

/* FORM */
.team-form { display: flex; flex-direction: column; gap: 16px; }
.team-form label {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 13.5px;
  font-weight: 700;
}
.team-form input,
.team-form textarea {
  padding: 9px 14px;
  border-radius: 10px;
  border: 1px solid var(--menu-border);
  background: var(--bg-color);
  color: var(--text-color);
  font-family: inherit;
  font-size: 14px;
  outline: none;
  resize: vertical;
  transition: border-color 0.18s;
}
.team-form input:focus,
.team-form textarea:focus { border-color: var(--main-color); }
.form-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 4px; }

@media (max-width: 640px) {
  .page-inner { padding: 32px 20px; }
  .invite-form { flex-direction: column; }
  .member-right { gap: 6px; }
}
</style>
