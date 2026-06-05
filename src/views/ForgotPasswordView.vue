<script setup lang="ts">
import { ref } from 'vue'
import api from '@/core/api/axios'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import ErrorMessage from '@/components/ui/ErrorMessage.vue'

const email = ref('')
const emailErrorKey = ref('')
const loading = ref(false)
const submitted = ref(false)
const serverError = ref('')

const validateEmail = () => {
  if (!email.value) {
    emailErrorKey.value = 'login.requiredField'
  } else if (!email.value.includes('@')) {
    emailErrorKey.value = 'login.invalidEmail'
  } else {
    emailErrorKey.value = ''
  }
}

const handleSubmit = async () => {
  validateEmail()
  if (emailErrorKey.value) return

  loading.value = true
  serverError.value = ''

  try {
    await api.post('/forgot-password', { email: email.value })
    submitted.value = true
  } catch (error: unknown) {
    // Безопасное приведение типов ошибок для строгого ESLint без использования any
    const err = error as {
      response?: {
        data?: { errors?: Record<string, string[]>; message?: string };
        status?: number
      };
      message?: string
    }

    if (err.response?.data) {
      const responseData = err.response.data
      if (responseData.errors) {
        serverError.value = Object.values(responseData.errors).flat().join(', ')
      } else if (responseData.message) {
        serverError.value = `Server: ${responseData.message}`
      } else {
        serverError.value = `Server error (Status: ${err.response.status})`
      }
    } else {
      serverError.value = `Connection error: ${err.message || 'API is unreachable'}`
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login-page">
    <form @submit.prevent="handleSubmit" class="auth-form">

      <template v-if="submitted">
        <div class="header-group">
          <h1>{{ $t('login.forgotPassword.checkEmail') }}</h1>
          <p class="hint-text">{{ $t('login.forgotPassword.checkEmailHint') }}</p>
        </div>

        <BaseButton to="/login">
          {{ $t('login.back') }}
        </BaseButton>
      </template>

      <template v-else>
        <div class="header-group">
          <h1>{{ $t('login.forgotPassword.title') }}</h1>
          <p class="hint-text">{{ $t('login.forgotPassword.hint') }}</p>
        </div>

        <ErrorMessage
            v-if="serverError"
            :message="serverError"
            closable
            @close="serverError = ''"
        />

        <BaseInput
            v-model="email"
            type="email"
            :label="$t('login.email')"
            :placeholder="$t('login.emailPlaceholder')"
            :error="emailErrorKey ? $t(emailErrorKey) : ''"
            @blur="validateEmail"
            @input="emailErrorKey = ''; serverError = ''"
        />

        <BaseButton type="submit" :disabled="loading">
          {{ loading ? $t('login.loading') : $t('login.forgotPassword.send') }}
        </BaseButton>

        <p class="bottom-link">
          <RouterLink to="/login">{{ $t('login.back') }}</RouterLink>
        </p>
      </template>

    </form>
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
  padding: 30px 25px;
  background: var(--menu-color);
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.header-group {
  margin-bottom: 10px;
}
.header-group h1 {
  text-align: left; /* Текст заголовка слева */
  margin: 0 0 10px 0;
  font-size: 28px;
}
.hint-text {
  text-align: left; /* Подсказка слева */
  font-size: 14px;
  color: var(--text-color);
  opacity: 0.7;
  margin: 0;
  line-height: 1.4;
}
.bottom-link {
  text-align: center; /* Ссылка возврата по центру */
  font-size: 14px;
  margin: 5px 0 0 0;
}
.bottom-link a {
  color: var(--main-color, --main-color);
  text-decoration: none;
}
@media (hover: hover) and (pointer: fine) {
  .bottom-link a:hover {
    text-decoration: underline;
  }
}
</style>