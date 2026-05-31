<!--
  Панель, которая появляется при нажатии на профиль пользователя,
  где можно выйти из аккаунта, изменить данные аккаунта и так далее
-->

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

import ArrowIcon from '@/assets/icons/arrow.svg'

import SettingsIcon from '@/assets/icons/settings.svg'
import AdminIcon from '@/assets/icons/admin.svg'
import LogoutIcon from '@/assets/icons/logout.svg'

import DropdownMenuItem from '@/components/ui/DropdownMenuItem.vue'

const authStore = useAuthStore()
const router = useRouter()

const isOpen = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)

const user = computed(() => authStore.user)
const userName = computed(() => {
  return user.value?.name || 'User'
})

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

onMounted(() => document.addEventListener('click', handleOutside))
onBeforeUnmount(() => document.removeEventListener('click', handleOutside))
</script>

<template>
  <div class="user-dropdown" ref="dropdownRef">

    <!-- TRIGGER -->
    <div class="trigger" @click="toggle">
      <img :src="userAvatar" class="avatar" />
      <span class="user-name">
        {{ userName }}
      </span>
      <ArrowIcon class="arrow" :class="{ open: isOpen }" />
    </div>

    <!-- MENU -->
    <div v-if="isOpen" class="menu">
      <DropdownMenuItem
          :label="$t('userPanel.admin_panel')"
          :icon="AdminIcon"
          to="/admin"
          :roles="['admin', 'super_admin']"
      />
      <DropdownMenuItem
          :label="$t('userPanel.settings')"
          :icon="SettingsIcon"
          to="/settings"
      />
      <div class="menu-divider"></div>
      <DropdownMenuItem
          :label="$t('userPanel.logout')"
          :icon="LogoutIcon"
          danger
          @click="logout"
      />
    </div>

  </div>
</template>

<style scoped>
.arrow {
  color: var(--text-color);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transform-origin: center;

  &.open {
    transform: rotate(180deg);
  }
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
}
.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
}
.user-name {
  color: var(--text-color);
  font-weight: 600;
}
.menu {
  background: var(--user-menu-bg-color);
  border: 1px solid var(--user-menu-border-color);
  box-shadow: 0 10px 25px rgba(0,0,0,0.15);

  position: absolute;
  top: 110%;
  right: 0;
  width: 180px;
  border-radius: 10px;
  overflow: hidden;
  z-index: 1000;
}
.menu-divider {
  background: var(--user-menu-line-color);
  height: 1.2px;
}
</style>