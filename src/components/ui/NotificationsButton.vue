<!--
  Кнопка открытия меню уведомлений
-->

<script setup lang="ts">

import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useAuthStore } from '@/stores/auth'
import BellIcon from '@/assets/icons/bell.svg'
import NotificationsMenu from '@/components/ui/NotificationsMenu.vue'

const authStore = useAuthStore()
const isOpen = ref(false)
const notifications = ref([
  {
    id: 1,
    text: 'New system update available.'
  },
  {
    id: 2,
    text: 'Your profile was updated successfully.'
  }
])

const wrapperRef = ref<HTMLElement | null>(null)
const toggleMenu = () => {
  isOpen.value = !isOpen.value
}
const handleOutside = (e: MouseEvent) => {
  if (
      wrapperRef.value &&
      !wrapperRef.value.contains(e.target as Node)
  ) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleOutside)
})
onBeforeUnmount(() => {
  document.removeEventListener('click', handleOutside)
})

</script>

<template>

  <div class="notifications-wrapper" ref="wrapperRef">
    <button class="notifications-button" @click="toggleMenu">
      <BellIcon class="icon" />
    </button>
    <transition name="dropdown">
      <div v-if="isOpen" class="menu-container">
        <NotificationsMenu :notifications="authStore.notifications" />
      </div>
    </transition>
  </div>

</template>

<style scoped>
.notifications-wrapper {
  position: relative;
}
.icon {
  color: var(--text-color);
}
.notifications-button {
  width: 40px;
  height: 40px;

  border: 1px solid var(--button-border-color-unimp);
  border-radius: 8px;

  background-color: var(--button-bg-color-unimp);

  display: flex;
  align-items: center;
  justify-content: center;

  cursor: pointer;

  transition:
      transform 150ms ease,
      background-color 250ms ease;

  &:hover {
    background-color: var(--button-bg-hover-unimp);
  }
  &:active {
    transform: scale(0.95);
  }
}
.menu-container {
  position: absolute;
  top: calc(100% + 10px);
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
}
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}
.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateX(-50%);
}
.dropdown-enter-to,
.dropdown-leave-from {
  opacity: 1;
  transform: translateX(-50%);
}
</style>