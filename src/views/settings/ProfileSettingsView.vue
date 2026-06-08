<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import AvatarUploader from '@/components/ui/AvatarUploader.vue'
import BaseInput from '@/components/ui/BaseInput.vue'

import { useI18n } from 'vue-i18n'
const { t } = useI18n()

const authStore = useAuthStore()

const nameInput = ref('')
const surnameInput = ref('')

// Разрезаем монолитную строку из базы "Имя Фамилия" на два инпута
const parseUserData = () => {
  const rawName = authStore.user?.name?.trim() || ''
  const parts = rawName.split(/\s+/)

  if (parts.length > 1) {
    nameInput.value = parts[0]
    surnameInput.value = parts.slice(1).join(' ')
  } else {
    nameInput.value = rawName
    surnameInput.value = ''
  }
}

watch(() => authStore.user?.name, parseUserData)
onMounted(parseUserData)

// Единая функция сохранения для обеих кнопок
const saveProfileData = async () => {
  const first = nameInput.value.trim()
  const last = surnameInput.value.trim()

  if (!first) {
    alert(t('The name cannot be empty'))
    return
  }

  // Склеиваем имя и фамилию обратно через пробел
  const fullName = last ? `${first} ${last}` : first

  try {
    // Шлем склеенную строку в поле 'name'
    await authStore.updateName(fullName)
    console.log('Profile successfully updated with full name.')
  } catch (err) {
    console.error(t('error.error_save'), err)
  }
}
</script>

<template>
  <div class="profile-settings">

    <h2 class="section-title">{{ $t('settingsPanel.profile_settings_title') }}</h2>

    <div class="settings-card avatar-section">
      <h3 class="card-title">{{ $t('settingsPanel.photo') }}</h3>
      <AvatarUploader />
    </div>

    <div class="settings-card info-section">
      <h3 class="card-title">{{ $t('settingsPanel.personal_info') }}</h3>

      <div class="info-grid">
        <div class="info-group">
          <BaseInput
              :model-value="nameInput"
              @update:model-value="val => nameInput = String(val)"
              showSaveToggle
              :label="$t('settingsPanel.label_name')"
              :disabled="authStore.loading"
              @save="saveProfileData"
          />
          <BaseInput
              :model-value="surnameInput"
              @update:model-value="val => surnameInput = String(val)"
              showSaveToggle
              :label="$t('settingsPanel.label_surname')"
              :disabled="authStore.loading"
              @save="saveProfileData"
          />
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
.profile-settings {
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-width: 600px;
  width: 100%;
}
.section-title {
  font-size: 24px;
  margin: 0;
  color: var(--text-color);
}
.settings-card {
  background: var(--menu-color);
  border-radius: 8px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.avatar-section {
  padding: 32px 24px;
}
.card-title {
  font-size: 18px;
  margin: 0 0 8px 0;
  color: var(--text-color);
}
.info-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.info-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
</style>