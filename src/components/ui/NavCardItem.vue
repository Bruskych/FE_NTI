<!--
  Карточка для перенаправления на страницу, содержит иконку, заголовок, описание
-->

<script setup lang="ts">
import {type Component, computed} from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const props = defineProps<{
  label: string
  icon?: Component | string
  to?: string
  roles?: string[]
  description?: string
}>()

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const hasAccess = computed(() => {
  if (!props.roles || props.roles.length === 0) return true
  return authStore.hasAnyRole(props.roles)
})
const handleClick = () => {
  if (isActive.value) return
  if (props.to) {
    router.push(props.to)
  }
}
const isActive = computed(() => {
  if (!props.to) return false
  return route.path === props.to
})
</script>

<template>
  <div
      v-if="hasAccess"
      class="nav-card"
      :class="{ active: isActive }"
      @click="handleClick"
  >
    <component v-if="icon" :is="icon" class="nav-icon" />

    <div class="nav-content">
      <div class="nav-title">
        {{ label }}
      </div>
      <div v-if="description" class="nav-desc">
        {{ description }}
      </div>
    </div>

  </div>
</template>

<style scoped>
.nav-card {
  color: var(--card-text-color);

  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 16px;
  border-radius: 10px;
  cursor: pointer;

  @media (hover:hover) and (pointer: fine){
    &:hover {
      color: var(--card-text-color-hover);
    }
  }
  &.active {
    color: var(--card-text-color-active);
    background: var(--card-bg-color-active);
    cursor: default;
    pointer-events: none;
  }
}
.nav-icon {
  width: 25px;
  height: 25px;

  flex-shrink: 0;
  color: inherit;
}
.nav-title {
  font-size: 16px;
  font-weight: 600;
  color: inherit;
}
.nav-desc {
  font-size: 12px;
  opacity: 0.7;
  color: inherit;
}
</style>