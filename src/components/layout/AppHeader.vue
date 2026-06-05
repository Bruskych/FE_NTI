<script setup lang="ts">
import { nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useLanguage } from '@/composables/useLanguage'
import { useTheme } from '@/composables/useTheme'

import ntiLogo from '@/assets/images/nti_logo.png'

import LanguageToggle from '@/components/ui/LanguageToggle.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import SecondaryButton from '@/components/ui/SecondaryButton.vue'
import ThemeToggle from '@/components/ui/ThemeToggle.vue'
import UserDropdown from '@/components/layout/UserDropdown.vue'
import NotificationsButton from '@/components/ui/NotificationsButton.vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const { currentLang, setLanguage } = useLanguage()
const toggleLang = () => {
  setLanguage(currentLang.value === 'en' ? 'sk' : 'en')
}

const { isDark, toggleTheme } = useTheme()

const goLogin = () => { router.push('/login') }
const goRegister = () => { router.push('/register') }

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

const isSectionActive = (sectionId: string) => {
  return route.path === '/' && route.hash === `#${sectionId}`
}
</script>

<template>
  <header class="header">
    <div class="container">

      <div class="header-left">
        <router-link to="/" class="logo-wrapper">
          <img :src="ntiLogo" alt="NTI Logo" class="header-logo-img" :class="{ 'light-logo': !isDark }" />
          <span class="logo-text">NTI Portal</span>
        </router-link>

        <nav class="nav-links">
          <button
              @click="navigateToSection('about-us')"
              class="nav-link-btn"
              :class="{ 'is-active': isSectionActive('about-us') }"
          >
            {{ $t('header.about_us') }}
          </button>
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

.logo-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
}
.header-logo-img {
  height: 36px;
  width: auto;
  object-fit: contain;
}
.logo-text {
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--text-color);
  letter-spacing: -0.5px;
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

:global(.light) .header-logo-img,
:global(.light) .footer-logo-img {
  filter: invert(1) brightness(0.2);
}

.light-logo {
  filter: invert(1) brightness(0.1);
}

</style>