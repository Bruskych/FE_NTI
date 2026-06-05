<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useI18n } from 'vue-i18n'
import SecondaryButton from "@/components/ui/SecondaryButton.vue";
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

    <SecondaryButton
        type="button"
        :disabled="authStore.loading"
        @click="triggerFileInput"
    >
      {{ authStore.loading ? $t('error.avatar.loading') : $t('error.avatar.change_btn') }}
    </SecondaryButton>

    <p v-if="validationError" class="error-text">
      {{ validationError }}
    </p>
  </div>
</template>

<style scoped>
.avatar-uploader {
  display: flex;
  flex-direction: row;
  align-items: flex-end;
  gap: 20px;
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
  font-size: 32px;
  font-weight: bold;
  color: #666;
}
.error-text {
  color: #ef4444;
  font-size: 12px;
  margin: 0;
}
</style>