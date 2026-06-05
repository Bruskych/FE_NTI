<script setup lang="ts">
import { nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useLanguage } from '@/composables/useLanguage'
import { useTheme } from '@/composables/useTheme'

// Импорт UI компонентов
import LanguageToggle from '@/components/ui/LanguageToggle.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import SecondaryButton from '@/components/ui/SecondaryButton.vue'
import ThemeToggle from '@/components/ui/ThemeToggle.vue'
import UserDropdown from '@/components/layout/UserDropdown.vue'
import NotificationsButton from '@/components/ui/NotificationsButton.vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

// Логика смены языка локализации
const { currentLang, setLanguage } = useLanguage()
const toggleLang = () => {
  setLanguage(currentLang.value === 'en' ? 'sk' : 'en')
}

// Переключение темной/светлой темы
const { isDark, toggleTheme } = useTheme()

// Быстрые переходы по авторизации
const goLogin = () => { router.push('/login') }
const goRegister = () => { router.push('/register') }

/**
 * Плавный скролл к секциям. Если роут отличается от главной —
 * сначала возвращает на главную, затем скроллит.
 */
const navigateToSection = async (sectionId: string) => {
  if (route.path !== '/') {
    await router.push('/')
    await nextTick()
  }
  const element = document.getElementById(sectionId)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

/**
 * Проверка, является ли секция активной (по хэшу урла),
 * используется для динамической подсветки активной кнопки.
 */
const isSectionActive = (sectionId: string) => {
  return route.path === '/' && route.hash === `#${sectionId}`
}
</script>

<template>
  <header class="header">
    <div class="container">

      <div class="header-left">
        <router-link to="/" class="logo">NTI Portal</router-link>

        <nav class="nav-links">
          <button
              @click="navigateToSection('programs')"
              class="nav-link-btn"
              :class="{ 'is-active': isSectionActive('programs') }"
          >
            {{ $t('header.programs') }}
          </button>
          <button
              @click="navigateToSection('news')"
              class="nav-link-btn"
              :class="{ 'is-active': isSectionActive('news') }"
          >
            {{ $t('header.news') }}
          </button>
          <button
              @click="navigateToSection('partners')"
              class="nav-link-btn"
              :class="{ 'is-active': isSectionActive('partners') }"
          >
            {{ $t('header.partners') }}
          </button>
        </nav>
      </div>

      <div class="nav-right">
        <NotificationsButton v-if="authStore.isAuthenticated" />
        <LanguageToggle :lang="currentLang" @toggle="toggleLang"/>
        <ThemeToggle :isDark="isDark" @toggle="toggleTheme"/>

        <div v-if="!authStore.isAuthenticated" class="auth-buttons">
          <SecondaryButton @click="goRegister">{{ $t('header.sign_up') }}</SecondaryButton>
          <BaseButton @click="goLogin">{{ $t('header.log_in') }}</BaseButton>
        </div>

        <div v-else class="user-menu">
          <UserDropdown />
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
  width: 100%;
}
.container {
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 75px;
  width: 100%;
  max-width: 1440px;
}
.header-left {
  display: flex;
  align-items: center;
  gap: 32px;
}
.logo {
  font-size: 1.4rem;
  font-weight: 700;
  text-decoration: none;
  color: var(--text-color);
  display: flex;
  align-items: center;
  height: 100%;
}
.nav-links {
  display: flex;
  align-items: center;
  gap: 6px;
}
.nav-link-btn {
  background: none;
  border: none;
  font-family: inherit;
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--text-color);
  opacity: 0.75;
  transition: all 0.2s ease;
  padding: 8px 14px;
  border-radius: 6px;
  white-space: nowrap;
}
.nav-link-btn:hover {
  opacity: 1;
  background: rgba(100, 116, 139, 0.08);
}
.nav-link-btn.is-active {
  opacity: 1;
  color: var(--main-color);
  background: var(--main-color-light);
  font-weight: 600;
}
.nav-right {
  display: flex;
  align-items: center;
  gap: 16px;
}
.auth-buttons {
  display: flex;
  gap: 10px;
}
.user-menu {
  display: flex;
  align-items: center;
}
@media (max-width: 992px) {
  .nav-links { display: none; }
}
</style>