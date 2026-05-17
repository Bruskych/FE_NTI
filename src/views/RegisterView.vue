<script setup lang="ts">

import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

import BaseInput from '@/components/ui/BaseInput.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'

import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()

const firstNameError = ref('')
const lastNameError = ref('')
const emailError = ref('')
const passwordError = ref('')
const passwordConfirmationError = ref('')

const validateFirstName = () => {
  firstNameError.value = !form.value.first_name ? t('register.requiredField') : ''
}
const validateLastName = () => {
  lastNameError.value = !form.value.last_name ? t('register.requiredField') : ''
}
const validateEmail = () => {
  const email = form.value.email
  if (!email) {
    emailError.value = t('register.requiredField')
  } else if (!email.includes('@')) {
    emailError.value = t('register.invalidEmail')
  } else {
    emailError.value = ''
  }
}
const validatePassword = () => {
  const password = form.value.password
  if (!password) {
    passwordError.value = t('register.requiredField')
  } else if (password.length < 8) {
    passwordError.value = t('register.passwordPlaceholder')
  } else {
    passwordError.value = ''
  }
  if (form.value.password_confirmation) {
    validatePasswordConfirmation()
  }
}
const validatePasswordConfirmation = () => {
  const confirm = form.value.password_confirmation
  if (!confirm) {
    passwordConfirmationError.value = t('register.requiredField')
  } else if (confirm !== form.value.password) {
    passwordConfirmationError.value = t('register.confirmPasswordPlaceholder')
  } else {
    passwordConfirmationError.value = ''
  }
}
const authStore = useAuthStore()
const router = useRouter()
const form = ref({
  first_name: '',
  last_name: '',
  email: '',
  password: '',
  password_confirmation: '',
  role: 'student'
})
const roleOptions = computed(() => [
  { label: t('role.student'), value: 'student' },
  { label: t('role.company'), value: 'company' }
])
const handleRegister = async () => {
  validateFirstName()
  validateLastName()
  validateEmail()
  validatePassword()
  validatePasswordConfirmation()
  if (firstNameError.value || lastNameError.value || emailError.value || passwordError.value || passwordConfirmationError.value || !form.value.role) {
    return
  }
  try {
    await authStore.register(form.value)
    router.push({ name: 'home' })
  } catch (error) {
    console.error('Error:', error)
  }
}
</script>

<template>
  <div class="register-page">
    <form @submit.prevent="handleRegister" class="auth-form">
      <h1>{{ $t('register.register') }}</h1>
      <BaseInput
          v-model="form.first_name"
          type="text"
          :label="$t('register.firstName')"
          :placeholder="$t('register.firstNamePlaceholder')"
          :error="firstNameError"
          @blur="validateFirstName"
      />
      <BaseInput
          v-model="form.last_name"
          type="text"
          :label="$t('register.lastName')"
          :placeholder="$t('register.lastNamePlaceholder')"
          :error="lastNameError"
          @blur="validateLastName"
      />
      <BaseInput
          v-model="form.email"
          type="email"
          :label="$t('register.email')"
          :placeholder="$t('register.emailPlaceholder')"
          :error="emailError"
          @blur="validateEmail"
      />
      <BaseInput
          v-model="form.password"
          type="password"
          :label="$t('register.password')"
          :placeholder="$t('register.passwordPlaceholder')"
          :error="passwordError"
          @blur="validatePassword"
      />
      <BaseInput
          v-model="form.password_confirmation"
          type="password"
          :label="$t('register.confirmPassword')"
          :placeholder="$t('register.confirmPasswordPlaceholder')"
          :error="passwordConfirmationError"
          @blur="validatePasswordConfirmation"
      />
      <BaseSelect
          v-model="form.role"
          :label="$t('role.role')"
          :placeholder="$t('role.selectRole')"
          :options="roleOptions"
      />
      <BaseButton type="submit" :disabled="authStore.loading">
        {{ authStore.loading ? $t('register.loading') : $t('register.register') }}
      </BaseButton>
    </form>
  </div>
</template>

<style scoped>
.register-page {
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