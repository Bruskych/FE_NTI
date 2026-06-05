<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

// Импорт иконок-компонентов
import ArrowIcon from '@/assets/icons/arrow.svg'
import SettingsIcon from '@/assets/icons/settings.svg'
import AdminIcon from '@/assets/icons/admin.svg'
import LogoutIcon from '@/assets/icons/logout.svg'
import DashboardIcon from '@/assets/icons/dashboard.svg'
import DropdownMenuItem from '@/components/ui/DropdownMenuItem.vue'

const authStore = useAuthStore()
const router = useRouter()

const isOpen = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)

// Вычисляемые свойства данных текущего пользователя
const user = computed(() => authStore.user)
const userName = computed(() => user.value?.name || 'User')

// Проверка наличия прав администратора
const isAnyAdmin = computed(() => {
  return user.value?.roles?.some(r => ['admin', 'super_admin'].includes(r.name)) ?? false
})

// Генерация аватара: если кастомного нет, берем красивый дефолтный по инициалам
const userAvatar = computed(() => {
  return (
      user.value?.avatar_url ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(userName.value)}`
  )
})

// Управление состоянием видимости меню
const toggle = () => { isOpen.value = !isOpen.value }
const close = () => { isOpen.value = false }

// Логика "Click Outside": закрывает меню, если кликнули в любое другое место экрана
const handleOutside = (e: MouseEvent) => {
  if (dropdownRef.value && !dropdownRef.value.contains(e.target as Node)) {
    close()
  }
}

// Функция выхода из системы
const logout = async () => {
  await authStore.logout()
  router.push('/')
}

// Регистрация и очистка глобального слушателя событий клика
onMounted(() => document.addEventListener('click', handleOutside))
onBeforeUnmount(() => document.removeEventListener('click', handleOutside))
</script>

<template>
  <div class="user-dropdown" ref="dropdownRef">

    <div class="trigger" @click="toggle">
      <img :src="userAvatar" class="avatar" alt="User Avatar" />
      <span class="user-name">{{ userName }}</span>
      <ArrowIcon class="arrow" :class="{ open: isOpen }" />
    </div>

    <div v-if="isOpen" class="menu" @click="close">
      <DropdownMenuItem
          :label="$t('userPanel.dashboard')"
          :icon="DashboardIcon"
          to="/"
      />

      <DropdownMenuItem
          v-if="isAnyAdmin"
          :label="$t('userPanel.admin_panel')"
          :icon="AdminIcon"
          to="/admin"
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
.user-dropdown {
  position: relative;
  font-family: var(--font-main), sans-serif;
  font-weight: 550;
  user-select: none;
}
.trigger {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  padding: 6px 10px;
  border-radius: 10px;
  transition: background 0.2s;
}
.trigger:hover {
  background: rgba(100, 116, 139, 0.06);
}
.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  border: 1.5px solid var(--menu-border);
}
.user-name {
  color: var(--text-color);
  font-weight: 600;
  font-size: 0.95rem;
}
.arrow {
  color: var(--text-color);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transform-origin: center;
  transition: transform 0.2s ease;
}
.arrow.open {
  transform: rotate(180deg);
}
.menu {
  background: var(--user-menu-bg-color);
  border: 1px solid var(--user-menu-border-color);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.2);
  position: absolute;
  top: 120%;
  right: 0;
  width: 195px;
  border-radius: 10px;
  overflow: hidden;
  z-index: 1000;
}
.menu-divider {
  background: var(--user-menu-line-color);
  height: 1px;
  margin: 4px 0;
}
</style>