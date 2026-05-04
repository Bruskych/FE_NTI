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
  >
    <slot />
  </component>
</template>

<style scoped>
.base-button {
  font-family: var(--font-main), sans-serif;
  font-weight: 550;

  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  text-decoration: none;

  background-color: var(--button-bg-color);
  color: var(--button-text-color);

  display: inline-block;

  transition: background-color 0.25s ease, filter 0.25s ease;
  will-change: background-color, filter;
}
.base-button:hover {
  background-color: var(--button-bg-hover);
}
</style>