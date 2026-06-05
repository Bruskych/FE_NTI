<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()

const authStore = useAuthStore()
const fileInput = ref<HTMLInputElement | null>(null)
const validationError = ref<string | null>(null)

const triggerFileInput = () => {
  validationError.value = null
  fileInput.value?.click()
}

const onFileSelected = async (event: Event) => {
  const target = event.target as HTMLInputElement
  if (!target.files || target.files.length === 0) return
  const file = target.files[0]
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg']

  if (!allowedTypes.includes(file.type)) {
    validationError.value = t('error.avatar.error_invalid_type')
    return
  }
  const maxSize = 10 * 1024 * 1024
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
          v-if="authStore.user?.avatar_url"
          :src="authStore.user.avatar_url"
          alt="Avatar"
          class="avatar-img"
      />
      <div v-else class="avatar-placeholder">
        {{ authStore.user?.name?.charAt(0).toUpperCase() }}
      </div>
    </div>

    <input
        ref="fileInput"
        type="file"
        accept="image/jpeg, image/png, image/jpg"
        style="display: none"
        @change="onFileSelected"
    />

    <button
        type="button"
        class="upload-btn"
        :disabled="authStore.loading"
        @click="triggerFileInput"
    >
      {{ authStore.loading ? $t('error.avatar.loading') : $t('error.avatar.change_btn') }}
    </button>

    <p v-if="validationError" class="error-text">
      {{ validationError }}
    </p>
  </div>
</template>

<style scoped>
.avatar-uploader {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}
.avatar-preview {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  overflow: hidden;
  background-color: #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #ccc;
}
.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.avatar-placeholder {
  font-size: 32px;
  font-weight: bold;
  color: #666;
}
.upload-btn {
  padding: 8px 16px;
  background-color: #4f46e5;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;

  &:disabled {
    background-color: #a5b4fc;
    cursor: not-allowed;
  }
}
.error-text {
  color: #ef4444;
  font-size: 12px;
  margin: 0;
}
</style>