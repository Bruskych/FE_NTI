<script setup lang="ts">

// LANGUAGE
import LanguageToggle from '@/components/ui/LanguageToggle.vue'
import { useLanguage } from '@/composables/useLanguage'
const { currentLang, setLanguage } = useLanguage()
const toggleLang = () => {
  setLanguage(currentLang.value === 'en' ? 'sk' : 'en')
}

// DARK / LIGHT THEME
import { useTheme } from '@/composables/useTheme'
const { isDark, toggleTheme } = useTheme()

// OTHER
import BaseButton from '@/components/ui/BaseButton.vue'
import SecondaryButton from '@/components/ui/SecondaryButton.vue'
import ThemeToggle from '@/components/ui/ThemeToggle.vue'

import { useAuthStore } from '@/stores/auth'
const authStore = useAuthStore()

</script>

<template>
  <header class="header">
    <div class="container">
      <router-link to="/" class="logo">NTI Portal</router-link>

      <div class="nav-right">

        <!-- ГОСТЬ -->
        <LanguageToggle :lang="currentLang" @toggle="toggleLang"/>
        <ThemeToggle :isDark="isDark" @toggle="toggleTheme"/>
        <div v-if="!authStore.isAuthenticated" class="auth-buttons">
          <SecondaryButton to="/register">{{ $t('header.sign_up') }}</SecondaryButton>
          <BaseButton to="/login">{{ $t('header.log_in') }}</BaseButton>
        </div>

      </div>

    </div>
  </header>
</template>

<style scoped>
.header {
  font-family: var(--font-main), sans-serif;

  position: sticky;
  top: 0;
  z-index: 1000;

  background: var(--menu-color);
  border-bottom: 1px solid var(--menu-border);
}

.container {
  margin: 0 auto;
  padding: 0 20px;

  display: flex;
  align-items: center;
  justify-content: space-between;

  height: 75px;
}

.logo {
  font-size: 1.4rem;
  font-weight: 700;
  text-decoration: none;
  color: var(--text-color);
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 15px;
}

.auth-buttons {
  display: flex;
  gap: 10px;
}
</style>