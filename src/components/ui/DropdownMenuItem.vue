<!--
  Элементы для меню пользователя (при нажатии на профиль в углу экрана)
-->

<script setup lang="ts">
import { computed, type Component } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const props = defineProps<{
  label: string
  icon?: Component | string
  to?: string
  roles?: string[]
  danger?: boolean
}>()

const emit = defineEmits<{
  (e: 'click'): void
}>()

const router = useRouter()
const authStore = useAuthStore()

const hasAccess = computed(() => {
  if (!props.roles || props.roles.length === 0) {
    return true
  }
  return authStore.hasAnyRole(props.roles)
})

const handleClick = () => {
  emit('click')

  if (props.to) {
    router.push(props.to)
  }
}
</script>

<template>
  <div
      v-if="hasAccess"
      class="menu-item"
      :class="{ danger }"
      @click="handleClick"
  >
    <component :is="icon" v-if="icon" class="menu-icon"/>
    <span>
      {{ label }}
    </span>

  </div>
</template>

<style scoped>
.menu-item {
  color: var(--text-color);

  padding: 10px 12px;
  cursor: pointer;
  font-size: 14px;

  display: flex;
  align-items: center;
  gap: 10px;

  @media (hover:hover) and (pointer: fine){
    &:hover {
      color: var(--user-menu-text-color);
      background: var(--user-menu-bg-color-hover);
    }
  }
}
.menu-icon {
  width: 24px;
  height: 24px;
  flex-shrink: 0;
}
.danger {
  color: var(--error-color);
}
</style>