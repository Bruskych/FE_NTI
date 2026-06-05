<script setup lang="ts">
import { ref, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useUserStore } from '@/stores/user' // Импортируем новый стор
import AvatarUploader from '@/components/ui/AvatarUploader.vue'
import BaseInput from '@/components/ui/BaseInput.vue'

import { useI18n } from 'vue-i18n'
const { t } = useI18n()

const authStore = useAuthStore()
const userStore = useUserStore()
const nameInput = ref(authStore.user?.name || '')

watch(() => authStore.user?.name, (newVal) => {
  if (newVal) nameInput.value = newVal
})

const saveProfileData = async (newValue: string | number) => {
  try {
    const updatedName = String(newValue).trim()
    if (!updatedName) return
    await userStore.updateProfileInfo({ name: updatedName })
    console.log('The profile has been successfully updated via the userStore.')
  } catch (err) {
    console.error('Error saving data:', err)
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
              v-model="nameInput"
              showSaveToggle
              :label="$t('settingsPanel.label_name')"
              :disabled="userStore.loading"
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