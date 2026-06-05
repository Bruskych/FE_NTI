<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useAuthStore, type RegisterFormData } from '@/stores/auth'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

import BaseInput from '@/components/ui/BaseInput.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import ErrorMessage from '@/components/ui/ErrorMessage.vue'

const { t } = useI18n()
const authStore = useAuthStore()
const router = useRouter()

// Переменные для хранения ошибок валидации
const firstNameError = ref('')
const lastNameError = ref('')
const emailError = ref('')
const passwordError = ref('')
const passwordConfirmationError = ref('')
const companyNameError = ref('')
const companyTaxIdError = ref('')
const sectorError = ref('')
const websiteError = ref('')
const descriptionError = ref('')

// Инициализация формы с дефолтными значениями
const form = ref({
  first_name: '',
  last_name: '',
  email: '',
  password: '',
  password_confirmation: '',
  role: 'student',
  company_name: '',
  company_tax_id: '',
  sector: '',
  website_link: '',
  description: ''
})

// Валидация стандартных полей
const hasSpacesOrNumbers = /[\d\s]/
const validateFirstName = () => {
  const firstName = form.value.first_name.trim()
  if (!firstName) {
    firstNameError.value = t('register.requiredField')
  } else if (hasSpacesOrNumbers.test(firstName)) {
    firstNameError.value = t('register.invalidNameSymbols')
  } else {
    firstNameError.value = ''
  }
}
const validateLastName = () => {
  const lastName = form.value.last_name.trim()
  if (!lastName) {
    lastNameError.value = t('register.requiredField')
  } else if (hasSpacesOrNumbers.test(lastName)) {
    lastNameError.value = t('register.invalidNameSymbols')
  } else {
    lastNameError.value = ''
  }
}
const validateEmail = () => {
  const email = form.value.email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!email) {
    emailError.value = t('register.requiredField')
  } else if (!emailRegex.test(email)) {
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

// Валидации для полей компании
const validateCompanyName = () => {
  if (form.value.role === 'company' && !form.value.company_name.trim()) {
    companyNameError.value = t('register.requiredField')
  } else {
    companyNameError.value = ''
  }
}
const taxIdRegex = /^\d{8,10}$/
const validateCompanyTaxId = () => {
  const taxId = form.value.company_tax_id.trim()
  if (form.value.role === 'company' && !taxId) {
    companyTaxIdError.value = t('register.requiredField')
  } else if (form.value.role === 'company' && !taxIdRegex.test(taxId)) {
    companyTaxIdError.value = t('register.invalidTaxId')
  } else {
    companyTaxIdError.value = ''
  }
}
const validateSector = () => {
  if (form.value.role === 'company' && !form.value.sector.trim()) {
    sectorError.value = t('register.requiredField')
  } else {
    sectorError.value = ''
  }
}
const urlRegex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/
const validateWebsite = () => {
  const url = form.value.website_link.trim()
  if (form.value.role === 'company' && !url) {
    websiteError.value = t('register.requiredField')
  } else if (form.value.role === 'company' && !urlRegex.test(url)) {
    websiteError.value = t('register.invalidUrl')
  } else {
    websiteError.value = ''
  }
}
const validateDescription = () => {
  if (form.value.role === 'company' && !form.value.description.trim()) {
    descriptionError.value = t('register.requiredField')
  } else {
    descriptionError.value = ''
  }
}

// Варианты регистрации
const roleOptions = computed(() => [
  { label: t('role.student'), value: 'student' },
  { label: t('role.company'), value: 'company' }
])

// Сброс ошибок для полей компании при переключении
watch(() => form.value.role, () => {
  companyNameError.value = ''
  companyTaxIdError.value = ''
  sectorError.value = ''
  websiteError.value = ''
  descriptionError.value = ''
})

// Сам процесс регистрации и проверки полей
const handleRegister = async () => {
  validateFirstName()
  validateLastName()
  validateEmail()
  validatePassword()
  validatePasswordConfirmation()

  if (form.value.role === 'company') {
    validateCompanyName()
    validateCompanyTaxId()
    validateSector()
    validateWebsite()
    validateDescription()
  }
  if (
      firstNameError.value ||
      lastNameError.value ||
      emailError.value ||
      passwordError.value ||
      passwordConfirmationError.value ||
      companyNameError.value ||
      companyTaxIdError.value ||
      sectorError.value ||
      websiteError.value ||
      descriptionError.value ||
      !form.value.role
  ) {
    return
  }
  try {
    await authStore.register(form.value as RegisterFormData)
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
          showPasswordToggle
          :label="$t('register.password')"
          :placeholder="$t('register.passwordPlaceholder')"
          :error="passwordError"
          @blur="validatePassword"
      />
      <BaseInput
          v-model="form.password_confirmation"
          type="password"
          showPasswordToggle
          :label="$t('register.confirmPassword')"
          :placeholder="$t('register.confirmPasswordPlaceholder')"
          :error="passwordConfirmationError"
          @blur="validatePasswordConfirmation"
      />
      <BaseInput
          v-model="form.company_name"
          :visible="form.role === 'company'"
          type="text"
          :label="$t('register.company_name')"
          :placeholder="$t('register.company_name_placeholder')"
          :error="companyNameError"
          @blur="validateCompanyName"
      />
      <BaseInput
          v-model="form.company_tax_id"
          :visible="form.role === 'company'"
          type="text"
          :label="$t('register.company_tax_id')"
          :placeholder="$t('register.company_tax_id_placeholder')"
          :error="companyTaxIdError"
          @blur="validateCompanyTaxId"
      />
      <BaseInput
          v-model="form.sector"
          :visible="form.role === 'company'"
          type="text"
          :label="$t('register.company_sector')"
          :placeholder="$t('register.company_sector_placeholder')"
          :error="sectorError"
          @blur="validateSector"
      />
      <BaseInput
          v-model="form.website_link"
          :visible="form.role === 'company'"
          type="text"
          :label="$t('register.company_website')"
          :placeholder="$t('register.company_website_placeholder')"
          :error="websiteError"
          @blur="validateWebsite"
      />
      <BaseInput
          v-model="form.description"
          :visible="form.role === 'company'"
          type="text"
          :label="$t('register.company_description')"
          :placeholder="$t('register.company_description_placeholder')"
          :error="descriptionError"
          @blur="validateDescription"
      />
      <BaseSelect
          v-model="form.role"
          :label="$t('role.role')"
          :placeholder="$t('role.selectRole')"
          :options="roleOptions"
      />
      <ErrorMessage
          v-if="authStore.error"
          :message="authStore.error"
          closable
          @close="authStore.error = ''"
      />
      <BaseButton type="submit" :disabled="authStore.loading">
        {{ authStore.loading ? $t('register.loading') : $t('register.register') }}
      </BaseButton>
    </form>
  </div>
</template>

<style scoped>
.register-page {
  color: var(--text-color);
  font-weight: 550;
}
.auth-form {
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);

  background: var(--menu-color);
  max-width: 450px;
  margin: 40px auto;
  padding: 20px;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  gap: 15px;
}
</style>