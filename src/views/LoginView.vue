<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import ErrorMessage from '@/components/ui/ErrorMessage.vue'

const authStore = useAuthStore()
const router = useRouter()

const form = ref({
  email: '',
  password: ''
})

const emailErrorKey = ref('')
const passwordErrorKey = ref('')

onMounted(() => {
  // Очищаем прошлые ошибки авторизации при входе на страницу
  authStore.error = ''
})

const validateEmail = () => {
  if (!form.value.email) {
    emailErrorKey.value = 'login.requiredField'
  } else if (!form.value.email.includes('@')) {
    emailErrorKey.value = 'login.invalidEmail'
  } else {
    emailErrorKey.value = ''
  }
}

const validatePassword = () => {
  if (!form.value.password) {
    passwordErrorKey.value = 'login.requiredField'
  } else if (form.value.password.length < 8) {
    passwordErrorKey.value = 'login.passwordTooShort'
  } else {
    passwordErrorKey.value = ''
  }
}

const handleLogin = async () => {
  validateEmail()
  validatePassword()

  if (emailErrorKey.value || passwordErrorKey.value) return

  try {
    await authStore.login(form.value.email, form.value.password)
    router.push({ name: 'home' })
  } catch (error) {
    console.error('Login request failed:', error)
  }
}
</script>

<template>
  <div class="login-page">
    <form @submit.prevent="handleLogin" class="auth-form">
      <h1>{{ $t('login.welcomeBack') }}</h1>

      <ErrorMessage
          v-if="authStore.error"
          :message="$t('login.invalidCredentials')"
          closable
          @close="authStore.error = ''"
      />

      <BaseInput
          v-model="form.email"
          type="email"
          :label="$t('login.email')"
          :placeholder="$t('login.emailPlaceholder')"
          :error="emailErrorKey ? $t(emailErrorKey) : ''"
          @blur="validateEmail"
          @input="emailErrorKey = ''"
      />

      <BaseInput
          v-model="form.password"
          type="password"
          showPasswordToggle
          :label="$t('login.password')"
          :placeholder="$t('login.passwordPlaceholder')"
          :error="passwordErrorKey ? $t(passwordErrorKey) : ''"
          @blur="validatePassword"
          @input="passwordErrorKey = ''"
      />

      <BaseButton type="submit" :disabled="authStore.loading">
        {{ authStore.loading ? $t('login.loading') : $t('login.login') }}
      </BaseButton>

      <p class="bottom-link">
        <RouterLink to="/forgot-password">
          {{ $t('login.forgotPasswordLink') }}
        </RouterLink>
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
  padding: 20px;
  background: var(--menu-color);
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  display: flex;
  flex-direction: column;
  gap: 15px;
}
.auth-form h1 {
  text-align: left; /* Заголовок строго слева */
  margin: 0 0 5px 0;
}
.bottom-link {
  text-align: center; /* Ссылка строго по центру */
  margin-top: 5px;
}
.bottom-link a {
  color: var(--main-color, #ea6d7e);
  text-decoration: none;
}
.bottom-link a:hover {
  text-decoration: underline;
}
</style>