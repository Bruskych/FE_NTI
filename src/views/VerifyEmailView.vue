<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import api from '@/core/api/axios'
import BaseButton from '@/components/ui/BaseButton.vue'

const route = useRoute()
const authStore = useAuthStore()

type Status = 'loading' | 'success' | 'error' | 'already'

const status = ref<Status>('loading')
const resendLoading = ref(false)
const resendSent = ref(false)

onMounted(async () => {
  // Извлекаем id пользователя и хеш верификации из параметров роута
  const id   = route.params.id as string
  const hash = route.params.hash as string

  if (!id || !hash) {
    status.value = 'error'
    return
  }

  try {
    // Отправляем запрос на бэкенд для подтверждения почты
    await api.get(`/auth/verify-email/${id}/${hash}`)
    status.value = 'success'

    // Если пользователь уже залогинен, обновляем его профиль в стейте
    if (authStore.isAuthenticated) {
      await authStore.fetchMe()
    }
  } catch (error: unknown) {
    // Заменяем error: any на ручное безопасное сопоставление статуса ответа
    const err = error as { response?: { status?: number } }
    if (err.response?.status === 400 || err.response?.status === 409) {
      status.value = 'already'
    } else {
      status.value = 'error'
    }
  }
})

const handleResend = async () => {
  if (!authStore.user?.email) return

  resendLoading.value = true
  try {
    await api.post('/auth/email/resend', { email: authStore.user.email })
    resendSent.value = true
  } catch (e) {
    console.error(e)
  } finally {
    resendLoading.value = false
  }
}
</script>

<template>
  <div class="login-page">
    <div class="auth-form">

      <template v-if="status === 'loading'">
        <h1>{{ $t('login.verifyEmail.verifying') }}</h1>
        <p class="hint-text">{{ $t('login.loading') }}</p>
      </template>

      <template v-else-if="status === 'success'">
        <h1>{{ $t('login.verifyEmail.successTitle') }}</h1>
        <p class="hint-text">{{ $t('login.verifyEmail.successHint') }}</p>
        <BaseButton to="/">
          {{ $t('login.verifyEmail.goHome') }}
        </BaseButton>
      </template>

      <template v-else-if="status === 'already'">
        <h1>{{ $t('login.verifyEmail.alreadyTitle') }}</h1>
        <p class="hint-text">{{ $t('login.verifyEmail.alreadyHint') }}</p>
        <BaseButton to="/">
          {{ $t('login.verifyEmail.goHome') }}
        </BaseButton>
      </template>

      <template v-else>
        <h1>{{ $t('login.verifyEmail.errorTitle') }}</h1>
        <p class="hint-text">{{ $t('login.verifyEmail.errorHint') }}</p>

        <template v-if="authStore.user && !authStore.user.email_verified_at">
          <template v-if="resendSent">
            <p class="hint-text">{{ $t('login.verifyEmail.resendSent') }}</p>
          </template>
          <template v-else>
            <BaseButton
                type="button"
                :disabled="resendLoading"
                @click="handleResend"
            >
              {{ resendLoading ? $t('login.loading') : $t('login.verifyEmail.resend') }}
            </BaseButton>
          </template>
        </template>

        <p class="bottom-link">
          <RouterLink to="/login">{{ $t('login.back') }}</RouterLink>
        </p>
      </template>

    </div>
  </div>
</template>

<style scoped>
.login-page {
  font-weight: 550;
  color: var(--text-color);
}
.auth-form {
  max-width: 450px;
  margin: 40px auto;
  padding: 20px;
  background: var(--menu-color);
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  gap: 15px;
}
.auth-form h1 {
  text-align: left; /* Текст заголовков слева */
  margin: 0;
}
.hint-text {
  text-align: left; /* Описание слева */
  font-size: 14px;
  color: var(--text-color);
  opacity: 0.7;
  margin: 0;
  line-height: 1.4;
}
.bottom-link {
  text-align: center; /* Кнопки навигации по центру */
  font-size: 14px;
  margin: 0;
}
.bottom-link a {
  color: var(--main-color, #ea6d7e);
  text-decoration: none;
}
@media (hover: hover) and (pointer: fine) {
  .bottom-link a:hover {
    text-decoration: underline;
  }
}
</style>