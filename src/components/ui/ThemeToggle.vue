<script setup lang="ts">
// ICONS + THEME
import SunIcon from '@/assets/icons/sun.svg'
import MoonIcon from '@/assets/icons/moon.svg'
defineProps<{ isDark: boolean }>()
defineEmits<{ (e: 'toggle'): void }>()
</script>

<template>
  <button class="theme-toggle" @click="$emit('toggle')">
    <MoonIcon v-if="isDark" class="icon" />
    <SunIcon v-else class="icon" />
  </button>
</template>

<style scoped>
.icon {
  color: var(--text-color);
}
.theme-toggle {
  width: 40px;
  height: 40px;

  border: 1px solid var(--button-border-color-unimp);
  border-radius: 8px;

  background-color: var(--button-bg-color-unimp);
  color: var(--button-text-color-unimp);

  cursor: pointer;

  display: flex;
  align-items: center;
  justify-content: center;

  will-change: transform, background-color, filter;
  transition:
      transform 150ms ease-in-out,
      background-color 250ms ease,
      filter 250ms ease;

  &:hover {
    background-color: var(--button-bg-hover-unimp);
  }
  &:active {
    transform: scale(0.95);
  }
}
</style>