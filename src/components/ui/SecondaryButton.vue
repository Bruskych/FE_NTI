<!--
  Второстепенная кнопка для обычных и неважных действий
-->

<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'

const props = defineProps<{
  type?: 'button' | 'submit' | 'reset'
  to?: string
}>()

const isLink = computed(() => !!props.to)
</script>

<template>
  <component
      :is="isLink ? RouterLink : 'button'"
      :to="to"
      :type="!isLink ? (type || 'button') : undefined"
      class="base-button"
      v-bind="$attrs"
  >
    <slot />
  </component>
</template>

<style scoped>
.base-button {
  all: unset;
  box-sizing: border-box;

  font-family: var(--font-main), sans-serif;
  font-weight: 550;

  padding: 10px 20px;
  border-radius: 6px;
  border: 1px solid var(--button-border-color-unimp);
  cursor: pointer;
  text-decoration: none;

  background-color: var(--button-bg-color-unimp);
  color: var(--button-text-color-unimp);

  display: inline-flex;
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