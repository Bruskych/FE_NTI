<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/core/api/axios'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import ErrorMessage from '@/components/ui/ErrorMessage.vue'

const route = useRoute()
const router = useRouter()

const form = ref({
  token: '',
  email: '',
  password: '',
  password_confirmation: ''
})

const passwordErrorKey = ref('')
const confirmErrorKey = ref('')
const loading = ref(false)
const serverError = ref('')

onMounted(() => {
  form.value.token = (route.query.token as string) || ''
  form.value.email = (route.query.email as string) || ''

  if (!form.value.token) {
    serverError.value = 'Invalid or missing password reset token.'
  }
})

const validatePassword = () => {
  if (!form.value.password) {
    passwordErrorKey.value = 'login.requiredField'
  } else if (form.value.password.length < 8) {
    passwordErrorKey.value = 'login.resetPassword.passwordMin'
  } else {
    passwordErrorKey.value = ''
  }
}

const validateConfirmPassword = () => {
  if (!form.value.password_confirmation) {
    confirmErrorKey.value = 'login.requiredField'
  } else if (form.value.password !== form.value.password_confirmation) {
    confirmErrorKey.value = 'login.resetPassword.passwordMismatch'
  } else {
    confirmErrorKey.value = ''
  }
}

const handleSubmit = async () => {
  validatePassword()
  validateConfirmPassword()

  if (passwordErrorKey.value || confirmErrorKey.value || !form.value.token) return

  loading.value = true
  serverError.value = ''

  try {
    await api.post('/reset-password', form.value)
    router.push({ name: 'login' })
  } catch (error: unknown) {
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
        serverError.value = responseData.message
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
      <div class="header-group">
        <h1>{{ $t('login.resetPassword.title') }}</h1>
      </div>

      <ErrorMessage
          v-if="serverError"
          :message="serverError"
          closable
          @close="serverError = ''"
      />

      <input type="hidden" v-model="form.token" />
      <input type="hidden" v-model="form.email" />

      <BaseInput
          v-model="form.password"
          type="password"
          showPasswordToggle
          :label="$t('login.password')"
          :placeholder="$t('login.passwordPlaceholder')"
          :error="passwordErrorKey ? $t(passwordErrorKey) : ''"
          @blur="validatePassword"
          @input="passwordErrorKey = ''; serverError = ''"
      />

      <BaseInput
          v-model="form.password_confirmation"
          type="password"
          showPasswordToggle
          :label="$t('login.confirmPassword')"
          :placeholder="$t('login.confirmPasswordPlaceholder')"
          :error="confirmErrorKey ? $t(confirmErrorKey) : ''"
          @blur="validateConfirmPassword"
          @input="confirmErrorKey = ''; serverError = ''"
      />

      <BaseButton type="submit" :disabled="loading || !form.token">
        {{ loading ? $t('login.loading') : $t('login.resetPassword.submit') }}
      </BaseButton>

      <p class="bottom-link">
        <RouterLink to="/login">{{ $t('login.back') }}</RouterLink>
      </p>
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
  text-align: left;
  margin: 0;
  font-size: 28px;
}
.bottom-link {
  text-align: center;
  font-size: 14px;
  margin: 5px 0 0 0;
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