<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import NotificationsMenu from '@/components/ui/NotificationsMenu.vue'

const authStore = useAuthStore()
const isMenuOpen = ref(false)

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}

const closeMenu = () => {
  isMenuOpen.value = false
}
</script>

<template>
  <div class="notifications-wrapper" v-click-outside="closeMenu">

    <button class="bell-btn" @click="toggleMenu" :class="{ 'is-active': isMenuOpen }">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path>
        <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"></path>
      </svg>

      <span v-if="authStore.notifications.length > 0" class="bell-badge">
        {{ authStore.notifications.length }}
      </span>
    </button>

    <div v-if="isMenuOpen" class="menu-dropdown">
      <NotificationsMenu
          :notifications="authStore.notifications"
          @accept="authStore.acceptInvite"
          @decline="authStore.declineInvite"
      />
    </div>
  </div>
</template>

<style scoped>
.notifications-wrapper {
  position: relative;
  display: inline-block;
}

.bell-btn {
  /* Системные переменные для фона, рамки и цвета текста */
  background: var(--button-bg-color-unimp);
  border: 1px solid var(--button-border-color-unimp);
  color: var(--text-color);
  width: 42px;
  height: 42px;
  border-radius: 8px;

  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

/* Эффект при наведении и при открытом меню */
.bell-btn:hover, .bell-btn.is-active {
  background: var(--button-bg-hover-unimp);
}

/* Бейдж с цифрой */
.bell-badge {
  position: absolute;
  top: -2px;
  right: -2px;
  background-color: var(--error-color);
  color: var(--main-light-1);

  font-size: 10px;
  font-weight: 700;
  min-width: 16px;
  height: 16px;
  border-radius: 50%;

  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  border: 1.5px solid var(--menu-color);
  padding: 0 4px 1px 4px;
  line-height: 1;
}

.menu-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 8px;
  z-index: 1010;
}
</style>