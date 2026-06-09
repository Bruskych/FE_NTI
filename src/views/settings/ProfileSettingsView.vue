<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import { useUserStore } from '@/stores/user'

const { t } = useI18n()
const authStore = useAuthStore()
const userStore = useUserStore()

const user = computed(() => authStore.user)
const role = computed(() => user.value?.roles?.[0]?.name ?? '')
const isStudent = computed(() => role.value === 'student' || role.value === 'team_leader')

const userInitials = computed(() => {
  const name = user.value?.name ?? ''
  return name.split(' ').slice(0, 2).map((p: string) => p.charAt(0)).join('').toUpperCase()
})

const memberSince = computed(() => {
  return new Date().getFullYear().toString()
})

// ── Avatar ──────────────────────────────────────────
const fileInput = ref<HTMLInputElement | null>(null)
const avatarError = ref<string | null>(null)
const avatarSuccess = ref(false)

function triggerFileInput() {
  avatarError.value = null
  avatarSuccess.value = false
  fileInput.value?.click()
}

async function onFileSelected(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  if (!['image/jpeg', 'image/png', 'image/jpg', 'image/webp'].includes(file.type)) {
    avatarError.value = t('error.avatar.error_invalid_type')
    return
  }
  if (file.size > 2 * 1024 * 1024) {
    avatarError.value = t('error.avatar.error_too_large')
    return
  }
  try {
    await authStore.uploadAvatar(file)
    avatarSuccess.value = true
    setTimeout(() => { avatarSuccess.value = false }, 3000)
  } catch (err: unknown) {
    const e = err as { response?: { data?: { message?: string } } }
    avatarError.value = e.response?.data?.message ?? 'Upload failed'
  } finally {
    if (fileInput.value) fileInput.value.value = ''
  }
}

// ── Name ─────────────────────────────────────────────
const editingName = ref(false)
const nameValue = ref('')
const nameSaved = ref(false)
const nameError = ref<string | null>(null)

function startEditName() {
  nameValue.value = user.value?.name ?? ''
  nameError.value = null
  editingName.value = true
}

async function saveName() {
  if (!nameValue.value.trim()) return
  nameError.value = null
  try {
    await userStore.updateProfileInfo({ name: nameValue.value.trim() })
    editingName.value = false
    nameSaved.value = true
    setTimeout(() => { nameSaved.value = false }, 3000)
  } catch (err: unknown) {
    const e = err as { response?: { data?: { message?: string } } }
    nameError.value = e.response?.data?.message ?? 'Error'
  }
}

// ── Email ────────────────────────────────────────────
const editingEmail = ref(false)
const emailValue = ref('')
const emailSaved = ref(false)
const emailError = ref<string | null>(null)

function startEditEmail() {
  emailValue.value = user.value?.email ?? ''
  emailError.value = null
  editingEmail.value = true
}

async function saveEmail() {
  if (!emailValue.value.trim()) return
  emailError.value = null
  try {
    await userStore.updateProfileInfo({ email: emailValue.value.trim() })
    editingEmail.value = false
    emailSaved.value = true
    setTimeout(() => { emailSaved.value = false }, 3000)
  } catch (err: unknown) {
    const e = err as { response?: { data?: { message?: string } } }
    emailError.value = e.response?.data?.message ?? 'Error'
  }
}

// ── Student profile ──────────────────────────────────
const spForm = ref({
  study_program: '',
  year: 1,
  avg_grade: '' as string | number,
  skills_json: [] as string[],
  has_carried_subjects: false,
})
const spEditing = ref(false)
const spSaved = ref(false)
const spError = ref<string | null>(null)
const skillInput = ref('')

function startEditSP() {
  const sp = userStore.studentProfile
  spForm.value = {
    study_program: sp?.study_program ?? '',
    year: sp?.year ?? 1,
    avg_grade: sp?.avg_grade ?? '',
    skills_json: [...(sp?.skills_json ?? [])],
    has_carried_subjects: sp?.has_carried_subjects ?? false,
  }
  spError.value = null
  spEditing.value = true
}

function cancelEditSP() {
  spEditing.value = false
}

function addSkill() {
  const s = skillInput.value.trim()
  if (s && !spForm.value.skills_json.includes(s)) {
    spForm.value.skills_json.push(s)
  }
  skillInput.value = ''
}

function removeSkill(idx: number) {
  spForm.value.skills_json.splice(idx, 1)
}

function onSkillKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter') { e.preventDefault(); addSkill() }
}

async function saveSP() {
  spError.value = null
  try {
    await userStore.updateStudentProfile({
      study_program: spForm.value.study_program,
      year: Number(spForm.value.year),
      avg_grade: spForm.value.avg_grade !== '' ? Number(spForm.value.avg_grade) : null,
      skills_json: spForm.value.skills_json,
      has_carried_subjects: spForm.value.has_carried_subjects,
    })
    spEditing.value = false
    spSaved.value = true
    setTimeout(() => { spSaved.value = false }, 3000)
  } catch (err: unknown) {
    const e = err as { response?: { data?: { message?: string } } }
    spError.value = e.response?.data?.message ?? 'Error'
  }
}

onMounted(async () => {
  if (isStudent.value && !userStore.studentProfileLoaded) {
    await userStore.fetchStudentProfile()
  }
})
</script>

<template>
  <div class="profile-settings">

    <!-- Header -->
    <div class="profile-header">
      <div class="profile-avatar-wrap">
        <img v-if="user?.avatar_url" :src="user.avatar_url" class="header-avatar" alt="avatar" />
        <div v-else class="header-avatar-placeholder">{{ userInitials }}</div>
      </div>
      <div class="profile-header-info">
        <h2 class="profile-name">{{ user?.name }}</h2>
        <span class="profile-email-small">{{ user?.email }}</span>
        <span class="role-pill">{{ role }}</span>
      </div>
    </div>

    <!-- Avatar card -->
    <div class="settings-card">
      <div class="card-header">
        <span class="card-title">{{ $t('settingsPanel.photo') }}</span>
        <span v-if="avatarSuccess" class="saved-badge">{{ $t('settingsPanel.saved') }}</span>
      </div>
      <div class="avatar-section">
        <div class="avatar-preview-wrap">
          <img v-if="user?.avatar_url" :src="user.avatar_url" class="avatar-preview-img" alt="avatar" />
          <div v-else class="avatar-preview-placeholder">{{ userInitials }}</div>
        </div>
        <div class="avatar-actions">
          <button class="btn btn-secondary" :disabled="authStore.loading" @click="triggerFileInput">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            {{ authStore.loading ? $t('settingsPanel.avatar_loading') : $t('settingsPanel.avatar_change') }}
          </button>
          <span class="avatar-hint">{{ $t('settingsPanel.avatar_hint') }}</span>
          <span v-if="avatarError" class="field-error">{{ avatarError }}</span>
        </div>
      </div>
      <input ref="fileInput" type="file" accept="image/jpeg,image/png,image/jpg,image/webp" hidden @change="onFileSelected" />
    </div>

    <!-- Account info card -->
    <div class="settings-card">
      <div class="card-header">
        <span class="card-title">{{ $t('settingsPanel.personal_info') }}</span>
      </div>

      <div class="info-rows">

        <!-- Name row -->
        <div class="info-row">
          <div class="info-row-label">{{ $t('settingsPanel.label_name') }}</div>
          <div class="info-row-value">
            <template v-if="!editingName">
              <span class="info-value-text">{{ user?.name }}</span>
              <div class="row-actions">
                <span v-if="nameSaved" class="saved-badge">{{ $t('settingsPanel.saved') }}</span>
                <button class="btn-edit" @click="startEditName">{{ $t('settingsPanel.edit') }}</button>
              </div>
            </template>
            <template v-else>
              <div class="inline-edit-group">
                <input v-model="nameValue" type="text" class="inline-input" @keydown.enter="saveName" @keydown.esc="editingName = false" />
                <div class="inline-actions">
                  <button class="btn btn-primary btn-sm" :disabled="userStore.loading" @click="saveName">{{ $t('settingsPanel.save') }}</button>
                  <button class="btn btn-ghost btn-sm" @click="editingName = false">{{ $t('settingsPanel.cancel') }}</button>
                </div>
                <span v-if="nameError" class="field-error">{{ nameError }}</span>
              </div>
            </template>
          </div>
        </div>

        <div class="row-divider"></div>

        <!-- Email row -->
        <div class="info-row">
          <div class="info-row-label">{{ $t('settingsPanel.label_email') }}</div>
          <div class="info-row-value">
            <template v-if="!editingEmail">
              <span class="info-value-text">{{ user?.email }}</span>
              <div class="row-actions">
                <span v-if="emailSaved" class="saved-badge">{{ $t('settingsPanel.saved') }}</span>
                <button class="btn-edit" @click="startEditEmail">{{ $t('settingsPanel.edit') }}</button>
              </div>
            </template>
            <template v-else>
              <div class="inline-edit-group">
                <input v-model="emailValue" type="email" class="inline-input" @keydown.enter="saveEmail" @keydown.esc="editingEmail = false" />
                <div class="inline-actions">
                  <button class="btn btn-primary btn-sm" :disabled="userStore.loading" @click="saveEmail">{{ $t('settingsPanel.save') }}</button>
                  <button class="btn btn-ghost btn-sm" @click="editingEmail = false">{{ $t('settingsPanel.cancel') }}</button>
                </div>
                <span v-if="emailError" class="field-error">{{ emailError }}</span>
              </div>
            </template>
          </div>
        </div>

        <div class="row-divider"></div>

        <!-- Role row (read-only) -->
        <div class="info-row">
          <div class="info-row-label">{{ $t('settingsPanel.label_role') }}</div>
          <div class="info-row-value">
            <span class="role-pill">{{ role }}</span>
          </div>
        </div>

      </div>
    </div>

    <!-- Student profile card -->
    <div v-if="isStudent" class="settings-card">
      <div class="card-header">
        <span class="card-title">{{ $t('settingsPanel.student_profile_title') }}</span>
        <div class="card-header-right">
          <span v-if="spSaved" class="saved-badge">{{ $t('settingsPanel.saved') }}</span>
          <button v-if="!spEditing" class="btn-edit" @click="startEditSP">{{ $t('settingsPanel.edit') }}</button>
        </div>
      </div>

      <!-- View mode -->
      <template v-if="!spEditing">
        <div v-if="userStore.studentProfile" class="sp-view-grid">
          <div class="sp-view-item">
            <span class="info-row-label">{{ $t('settingsPanel.label_study_program') }}</span>
            <span class="sp-value">{{ userStore.studentProfile.study_program || '—' }}</span>
          </div>
          <div class="sp-view-item">
            <span class="info-row-label">{{ $t('settingsPanel.label_year') }}</span>
            <span class="sp-value">{{ userStore.studentProfile.year }}</span>
          </div>
          <div class="sp-view-item">
            <span class="info-row-label">{{ $t('settingsPanel.label_avg_grade') }}</span>
            <span class="sp-value">{{ userStore.studentProfile.avg_grade ?? '—' }}</span>
          </div>
          <div class="sp-view-item">
            <span class="info-row-label">{{ $t('settingsPanel.label_has_carried') }}</span>
            <span class="sp-value">{{ userStore.studentProfile.has_carried_subjects ? '✓' : '✗' }}</span>
          </div>
          <div v-if="userStore.studentProfile.skills_json?.length" class="sp-view-item sp-view-full">
            <span class="info-row-label">{{ $t('settingsPanel.label_skills') }}</span>
            <div class="skills-display">
              <span v-for="s in userStore.studentProfile.skills_json" :key="s" class="skill-chip">{{ s }}</span>
            </div>
          </div>
        </div>
        <div v-else class="sp-empty">
          <p>{{ $t('settingsPanel.student_profile_title') }} — не заповнено</p>
        </div>
      </template>

      <!-- Edit mode -->
      <template v-else>
        <div class="sp-form">
          <div class="sp-form-row">
            <label class="sp-label">
              {{ $t('settingsPanel.label_study_program') }}
              <input v-model="spForm.study_program" type="text" class="sp-input" :placeholder="$t('settingsPanel.program_placeholder')" />
            </label>
            <label class="sp-label">
              {{ $t('settingsPanel.label_year') }}
              <input v-model.number="spForm.year" type="number" min="1" max="6" class="sp-input" :placeholder="$t('settingsPanel.year_placeholder')" />
            </label>
          </div>

          <div class="sp-form-row">
            <label class="sp-label">
              {{ $t('settingsPanel.label_avg_grade') }}
              <input v-model="spForm.avg_grade" type="number" min="1" max="4" step="0.1" class="sp-input" placeholder="1.0 – 4.0" />
            </label>
            <label class="sp-label sp-toggle-label">
              {{ $t('settingsPanel.label_has_carried') }}
              <button
                type="button"
                class="toggle-btn"
                :class="{ on: spForm.has_carried_subjects }"
                @click="spForm.has_carried_subjects = !spForm.has_carried_subjects"
              >
                <span class="toggle-thumb"></span>
              </button>
            </label>
          </div>

          <label class="sp-label">
            {{ $t('settingsPanel.label_skills') }}
            <div class="skill-input-row">
              <input
                v-model="skillInput"
                type="text"
                class="sp-input"
                :placeholder="$t('settingsPanel.skills_placeholder')"
                @keydown="onSkillKeydown"
              />
              <button type="button" class="btn btn-secondary btn-sm" @click="addSkill">+</button>
            </div>
            <div v-if="spForm.skills_json.length" class="skills-edit-chips">
              <span v-for="(s, i) in spForm.skills_json" :key="s" class="skill-chip-edit">
                {{ s }}
                <button type="button" class="chip-remove" @click="removeSkill(i)">×</button>
              </span>
            </div>
          </label>

          <span v-if="spError" class="field-error">{{ spError }}</span>

          <div class="sp-form-actions">
            <button class="btn btn-ghost btn-sm" @click="cancelEditSP">{{ $t('settingsPanel.cancel') }}</button>
            <button class="btn btn-primary" :disabled="userStore.loading" @click="saveSP">{{ $t('settingsPanel.save') }}</button>
          </div>
        </div>
      </template>
    </div>

  </div>
</template>

<style scoped>
.profile-settings {
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 640px;
  width: 100%;
  font-family: var(--font-main), sans-serif;
}

/* ── HEADER ── */
.profile-header {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 24px 28px;
  background: var(--menu-color);
  border-radius: 18px;
  border: 1px solid var(--menu-border);
}

.header-avatar, .header-avatar-placeholder {
  width: 68px; height: 68px;
  border-radius: 50%;
  flex-shrink: 0;
}
.header-avatar { object-fit: cover; }
.header-avatar-placeholder {
  background: var(--main-color-light);
  color: var(--main-color-dark);
  display: flex; align-items: center; justify-content: center;
  font-size: 24px; font-weight: 800;
}

.profile-header-info {
  display: flex; flex-direction: column; gap: 4px; min-width: 0;
}
.profile-name       { font-size: 20px; font-weight: 800; margin: 0; }
.profile-email-small { font-size: 13px; opacity: 0.55; }
.role-pill {
  display: inline-block;
  font-size: 11px; font-weight: 700; text-transform: uppercase;
  letter-spacing: 0.8px; padding: 3px 10px; border-radius: 100px;
  background: var(--main-color-light); color: var(--main-color-dark);
  margin-top: 2px;
  width: fit-content;
}

/* ── CARD ── */
.settings-card {
  background: var(--menu-color);
  border: 1px solid var(--menu-border);
  border-radius: 18px;
  padding: 22px 28px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.card-header {
  display: flex; align-items: center;
  justify-content: space-between; gap: 12px;
}
.card-header-right { display: flex; align-items: center; gap: 10px; }
.card-title { font-size: 15px; font-weight: 800; }

/* ── SAVED BADGE ── */
.saved-badge {
  font-size: 12px; font-weight: 700;
  color: var(--good-color);
  background: color-mix(in srgb, var(--good-color) 12%, transparent);
  padding: 2px 10px; border-radius: 100px;
}

/* ── AVATAR ── */
.avatar-section { display: flex; align-items: center; gap: 24px; }

.avatar-preview-wrap {
  width: 90px; height: 90px; border-radius: 50%;
  overflow: hidden; flex-shrink: 0;
  border: 3px solid var(--menu-border);
}
.avatar-preview-img { width: 100%; height: 100%; object-fit: cover; }
.avatar-preview-placeholder {
  width: 100%; height: 100%;
  background: var(--main-color-light);
  color: var(--main-color-dark);
  display: flex; align-items: center; justify-content: center;
  font-size: 28px; font-weight: 800;
}
.avatar-actions { display: flex; flex-direction: column; gap: 8px; }
.avatar-hint { font-size: 12px; opacity: 0.5; }

/* ── INFO ROWS ── */
.info-rows { display: flex; flex-direction: column; }
.info-row {
  display: flex; align-items: flex-start;
  gap: 16px; padding: 12px 0;
}
.info-row-label {
  flex: 0 0 140px;
  font-size: 13px; font-weight: 700; opacity: 0.55;
  padding-top: 2px; flex-shrink: 0;
}
.info-row-value {
  flex: 1; display: flex; align-items: center;
  justify-content: space-between; gap: 12px;
}
.info-value-text { font-size: 14.5px; font-weight: 600; }
.row-actions { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
.row-divider { height: 1px; background: var(--menu-border); }

/* ── INLINE EDIT ── */
.inline-edit-group { display: flex; flex-direction: column; gap: 8px; flex: 1; }
.inline-input {
  width: 100%; padding: 8px 13px;
  border-radius: 10px; border: 1px solid var(--menu-border);
  background: var(--bg-color); color: var(--text-color);
  font-family: inherit; font-size: 14px; outline: none;
  transition: border-color 0.18s; box-sizing: border-box;
}
.inline-input:focus { border-color: var(--main-color); }
.inline-actions { display: flex; gap: 8px; }

/* ── BUTTONS ── */
.btn {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 8px 18px; border-radius: 10px; border: none;
  font-family: inherit; font-size: 13.5px; font-weight: 700;
  cursor: pointer; transition: opacity 0.18s, transform 0.15s;
}
.btn:disabled { opacity: 0.45; cursor: not-allowed; }
.btn:not(:disabled):hover { transform: translateY(-1px); }
.btn-primary   { background: var(--main-color); color: #fff; }
.btn-secondary {
  background: var(--bg-color);
  border: 1px solid var(--menu-border);
  color: var(--text-color);
}
.btn-ghost {
  background: transparent;
  border: 1px solid var(--menu-border);
  color: var(--text-color);
}
.btn-sm { padding: 6px 14px; font-size: 13px; }
.btn-edit {
  font-size: 12.5px; font-weight: 700; color: var(--main-color);
  background: none; border: none; cursor: pointer; padding: 0;
  text-decoration: underline; text-underline-offset: 3px;
}

.field-error { font-size: 12.5px; color: var(--error-color); font-weight: 600; }

/* ── STUDENT PROFILE ── */
.sp-empty { font-size: 14px; opacity: 0.55; }

.sp-view-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px 24px;
}
.sp-view-full { grid-column: 1 / -1; }
.sp-view-item { display: flex; flex-direction: column; gap: 4px; }
.sp-view-item .info-row-label { flex: none; padding-top: 0; }
.sp-value { font-size: 15px; font-weight: 700; }

.skills-display { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 4px; }
.skill-chip {
  font-size: 12px; font-weight: 600; padding: 4px 12px;
  border-radius: 8px;
  background: var(--table-header-bg-color);
  color: var(--text-color);
}

.sp-form { display: flex; flex-direction: column; gap: 16px; }
.sp-form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.sp-label {
  display: flex; flex-direction: column; gap: 6px;
  font-size: 13px; font-weight: 700;
}
.sp-toggle-label { justify-content: space-between; flex-direction: row; align-items: center; }
.sp-input {
  padding: 9px 13px; border-radius: 10px;
  border: 1px solid var(--menu-border);
  background: var(--bg-color); color: var(--text-color);
  font-family: inherit; font-size: 14px; outline: none;
  transition: border-color 0.18s;
}
.sp-input:focus { border-color: var(--main-color); }

.skill-input-row { display: flex; gap: 8px; }
.skill-input-row .sp-input { flex: 1; }

.skills-edit-chips { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 6px; }
.skill-chip-edit {
  display: inline-flex; align-items: center; gap: 5px;
  font-size: 12px; font-weight: 600; padding: 4px 10px;
  border-radius: 8px;
  background: var(--main-color-light); color: var(--main-color-dark);
}
.chip-remove {
  background: none; border: none; cursor: pointer;
  font-size: 14px; color: var(--main-color-dark);
  padding: 0; line-height: 1;
}

/* TOGGLE */
.toggle-btn {
  width: 44px; height: 24px; border-radius: 100px;
  border: none; background: var(--menu-border);
  cursor: pointer; position: relative;
  transition: background 0.2s; flex-shrink: 0;
}
.toggle-btn.on { background: var(--main-color); }
.toggle-thumb {
  position: absolute; top: 3px; left: 3px;
  width: 18px; height: 18px; border-radius: 50%;
  background: #fff; transition: transform 0.2s;
}
.toggle-btn.on .toggle-thumb { transform: translateX(20px); }

.sp-form-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 4px; }

@media (max-width: 540px) {
  .sp-form-row   { grid-template-columns: 1fr; }
  .sp-view-grid  { grid-template-columns: 1fr; }
  .info-row      { flex-direction: column; gap: 8px; }
  .info-row-label { flex: none; }
}
</style>
