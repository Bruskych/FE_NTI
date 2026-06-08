<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()

import SecondaryButton from "@/components/ui/SecondaryButton.vue";
import SaveIcon from '@/assets/icons/empty.svg'

const authStore = useAuthStore()
const fileInput = ref<HTMLInputElement | null>(null)
const validationError = ref<string | null>(null)

const triggerFileInput = () => {
  validationError.value = null
  fileInput.value?.click()
}

// Формирование ссылки с динамическим очищением кэша браузера
const avatarSrc = computed(() => {
  const path = authStore.user?.avatar_path
  if (!path) return null

  if (path.startsWith('http')) {
    return `${path}?t=${Date.now()}`
  }

  const envUrl = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api'
  const baseUrl = envUrl.replace(/\/api$/, '')

  return `${baseUrl}/storage/${path}?t=${Date.now()}`
})

const userInitials = computed(() => {
  const name = authStore.user?.name ?? ''

  return name
      .split(' ')
      .slice(0, 2)
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
})

const onFileSelected = async (event: Event) => {
  const target = event.target as HTMLInputElement
  if (!target.files || target.files.length === 0) return
  const file = target.files[0]

  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp']

  if (!allowedTypes.includes(file.type)) {
    validationError.value = t('error.avatar.error_invalid_type')
    return
  }

  const maxSize = 2 * 1024 * 1024
  if (file.size > maxSize) {
    validationError.value = t('error.avatar.error_too_large')
    return
  }

  try {
    await authStore.uploadAvatar(file)
  } catch (err) {
    console.error(t('error.avatar.err_load'), err)
  } finally {
    if (fileInput.value) fileInput.value.value = ''
  }
}
</script>

<template>
  <div class="avatar-uploader">
    <div class="avatar-preview">
      <img
          v-if="avatarSrc"
          :src="avatarSrc"
          alt="Avatar"
          class="avatar-img"
      />
      <div v-else class="avatar-placeholder">
        {{ userInitials }}
      </div>
    </div>

    <input
        ref="fileInput"
        type="file"
        accept="image/jpeg, image/png, image/jpg, image/webp"
        style="display: none"
        @change="onFileSelected"
    />

    <div class="actions">
      <SecondaryButton
          type="button"
          :disabled="authStore.loading"
          @click="triggerFileInput"
      >
        <template #icon>
          <SaveIcon />
        </template>

        {{ authStore.loading ? $t('error.avatar.loading') : $t('error.avatar.change_btn') }}
      </SecondaryButton>

      <p v-if="validationError" class="error-text">
        {{ validationError }}
      </p>
    </div>

  </div>
</template>

<style scoped>
.avatar-uploader {
  display: flex;
  flex-direction: row;
  align-items: flex-end;
  gap: 20px;
}
.avatar-placeholder {
  background-color: var(--photo-bg);

  width: 100%;
  height: 100%;

  display: flex;
  align-items: center;
  justify-content: center;

  font-size: 48px;
  font-weight: 700;
}
.avatar-preview {
  width: 200px;
  height: 200px;
  border-radius: 5px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}
.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.avatar-placeholder {
  color: var(--text-color);

  font-size: 32px;
  font-weight: bold;
}
.actions {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
}
.error-text {
  color: var(--error-color);
  font-size: 12px;
  margin: 0;
}
</style>