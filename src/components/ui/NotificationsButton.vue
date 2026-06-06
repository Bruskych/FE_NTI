<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useAuthStore } from '@/stores/auth'
import BellIcon from '@/assets/icons/bell.svg'
import NotificationsMenu from '@/components/ui/NotificationsMenu.vue'

const authStore = useAuthStore()
const isOpen = ref(false)
const wrapperRef = ref<HTMLElement | null>(null)

const toggleMenu = () => {
  isOpen.value = !isOpen.value

  // Если пользователь открывает меню, делаем запрос к бэкенду для актуализации списка
  if (isOpen.value) {
    authStore.fetchNotifications()
  }
}

// Закрытие меню при клике вне компонента
const handleOutside = (e: MouseEvent) => {
  if (
      wrapperRef.value &&
      !wrapperRef.value.contains(e.target as Node)
  ) {
    isOpen.value = false
  }
}

// Обработчик события "Принять инвайт" из дочернего меню
const handleAccept = (id: number) => {
  authStore.acceptInvite(id)
}

// Обработчик события "Отклонить инвайт" из дочернего меню
const handleDecline = (id: number) => {
  authStore.declineInvite(id)
}

onMounted(() => {
  document.addEventListener('click', handleOutside)

  // Если пользователь уже авторизован на момент загрузки, сразу запрашиваем его уведомления
  if (authStore.isAuthenticated) {
    authStore.fetchNotifications()
  }
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleOutside)
})
</script>

<template>
  <div class="notifications-wrapper" ref="wrapperRef">
    <button class="notifications-button" @click="toggleMenu">
      <BellIcon class="icon" />

      <span v-if="authStore.notifications.length" class="badge"></span>
    </button>

    <transition name="dropdown">
      <div v-if="isOpen" class="menu-container">
        <NotificationsMenu
            :notifications="authStore.notifications"
            @accept="handleAccept"
            @decline="handleDecline"
        />
      </div>
    </transition>
  </div>
</template>

<style scoped>
.notifications-wrapper {
  position: relative;
}
.icon {
  width: 24px;
  height: 24px;
  color: var(--text-color);
}
.notifications-button {
  position: relative; /* Необходим для позиционирования красного индикатора внутри кнопки */
  width: 40px;
  height: 40px;

  border: 1px solid var(--button-border-color-unimp);
  border-radius: 8px;
  background-color: var(--button-bg-color-unimp);

  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s ease, transform 0.1s ease;
}

@media (hover:hover) and (pointer: fine){
  .notifications-button:hover {
    background-color: var(--button-bg-hover-unimp);
  }
}
.notifications-button:active {
  transform: scale(0.95);
}

/* Красная точка-индикатор для новых уведомлений */
.badge {
  position: absolute;
  top: 5px;
  right: 5px;
  width: 8px;
  height: 8px;
  background-color: #ef4444;
  border-radius: 50%;
  border: 2px solid var(--menu-color); /* Чтобы точка плавно отделялась от кнопки */
}

.menu-container {
  position: absolute;
  top: calc(100% + 10px);
  right: 0; /* Изменил с left: 50% на right: 0, чтобы меню красиво выравнивалось по правому краю дзвоночка */
  z-index: 1000;
}

/* Анимации выпадающего списка */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
.dropdown-enter-to,
.dropdown-leave-from {
  opacity: 1;
  transform: translateY(0);
}
</style>