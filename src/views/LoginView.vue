<script setup lang="ts">

import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()

import BaseInput from '@/components/ui/BaseInput.vue'
import BaseButton from '@/components/ui/BaseButton.vue'

const emailError = ref('')
const passwordError = ref('')
const validateEmail = () => {
  const email = form.value.email
  if (!email) {
    emailError.value = t('login.requiredField')
  } else if (!email.includes('@')) {
    emailError.value = t('login.invalidEmail')
  } else {
    emailError.value = ''
  }
}
const validatePassword = () => {
  const password = form.value.password
  if (!password) {
    passwordError.value = t('login.requiredField')
  } else if (password.length < 8) {
    passwordError.value = t('login.passwordPlaceholder')
  } else {
    passwordError.value = ''
  }
}

const authStore = useAuthStore()
const router = useRouter()
const form = ref({
  email: '',
  password: ''
})
const handleLogin = async () => {
  validateEmail()
  validatePassword()
  if (emailError.value || passwordError.value) {
    return
  }
  try {
    await authStore.login(form.value.email, form.value.password)
    router.push({ name: 'home' })
  } catch (error) {
    console.error('Error:', error)
  }
}
</script>
<template>
  <div class="login-page">
    <form @submit.prevent="handleLogin" class="auth-form">
      <h1>{{ $t('login.welcomeBack') }}</h1>
      <BaseInput
          v-model="form.email"
          type="email"
          :label="$t('login.email')"
          :placeholder="$t('login.emailPlaceholder')"
          :error="emailError"
          @blur="validateEmail"
      />
      <BaseInput
          v-model="form.password"
          type="password"
          :label="$t('login.password')"
          :placeholder="$t('login.passwordPlaceholder')"
          :error="passwordError"
          @blur="validatePassword"
      />
      <BaseButton type="submit" :disabled="authStore.loading">
        {{ authStore.loading ? $t('login.loading') : $t('login.login') }}
      </BaseButton>
    </form>
  </div>
</template>
<style scoped>
.login-page {
  font-family: var(--font-main), sans-serif;
  font-weight: 550;
  color: var(--text-color);
}
.auth-form {
  max-width: 450px;
  margin: 40px auto;
  padding: 20px;
  background: var(--menu-color);
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  display: flex;
  flex-direction: column;
  gap: 15px;
}
</style>