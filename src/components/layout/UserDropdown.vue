<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

import ArrowIcon from '@/assets/icons/arrow.svg'

const authStore = useAuthStore()
const router = useRouter()

const isOpen = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)

const user = computed(() => authStore.user)

// Имя
const userName = computed(() => {
  return user.value?.name || 'User'
})
// Аватар
const userAvatar = computed(() => {
  return (
      user.value?.avatar ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(userName.value)}`
  )
})
const toggle = () => {
  isOpen.value = !isOpen.value
}
const close = () => {
  isOpen.value = false
}
const handleOutside = (e: MouseEvent) => {
  if (dropdownRef.value && !dropdownRef.value.contains(e.target as Node)) {
    close()
  }
}
const logout = async () => {
  await authStore.logout()
  router.push('/')
}
const goProfile = () => {
  router.push('/profile')
  close()
}

onMounted(() => document.addEventListener('click', handleOutside))
onBeforeUnmount(() => document.removeEventListener('click', handleOutside))
</script>

<template>
  <div class="user-dropdown" ref="dropdownRef">

    <!-- TRIGGER -->
    <div class="trigger" @click="toggle">
      <img :src="userAvatar" class="avatar" />
      <span class="name">
        {{ userName }}
      </span>
      <ArrowIcon class="arrow" :class="{ open: isOpen }" />
    </div>

    <!-- MENU -->
    <div v-if="isOpen" class="menu">
      <div class="menu-item" @click="goProfile">
        {{ $t("userPanel.profile") }}
      </div>
      <div
          v-if="authStore.isAdmin"
          class="menu-item"
          @click="router.push('/admin')"
      >
        {{ $t("userPanel.admin_panel") }}
      </div>
      <div class="menu-divider"></div>
      <div class="menu-item logout" @click="logout">
        {{ $t("userPanel.logout") }}
      </div>
    </div>

  </div>
</template>

<style scoped>
.arrow {
  color: var(--text-color);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.25s ease;
  transform-origin: center;
}
.arrow.open {
  transform: rotate(180deg);
}
.user-dropdown {
  position: relative;
  font-family: var(--font-main), sans-serif;
  font-weight: 550;
}
.trigger {
  display: flex;
  align-items: center;
  gap: 10px;

  cursor: pointer;
  padding: 6px 10px;
  border-radius: 10px;

  transition: 0.2s;
}
.trigger:hover {
  background: rgba(0,0,0,0.05);
}
.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
}
.name {
  font-weight: 600;
  color: var(--text-color);
}
.menu {
  position: absolute;
  top: 110%;
  right: 0;

  width: 180px;
  background: var(--menu-color);
  border: 1px solid var(--menu-border);
  border-radius: 10px;

  box-shadow: 0 10px 25px rgba(0,0,0,0.15);
  overflow: hidden;

  z-index: 1000;
}
.menu-item {
  padding: 10px 12px;
  cursor: pointer;
  transition: 0.2s;
  font-size: 14px;
}
.menu-item:hover {
  background: rgba(0,0,0,0.05);
}
.logout {
  color: #e74c3c;
}
.menu-divider {
  height: 1px;
  background: var(--menu-border);
}
</style>