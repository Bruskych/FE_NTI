<!--
  Основная кнопка для основных действий
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
      class="base-button"
      v-bind="isLink ? { to } : { type: type || 'button' }"
  >
    <slot />
  </component>
</template>

<style scoped>
.base-button {
  font-weight: 550;

  box-sizing: border-box;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  text-decoration: none;

  background-color: var(--button-bg-color);
  color: var(--button-text-color);

  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-align: center;

  @media (hover:hover) and (pointer: fine){
    &:hover {
      background-color: var(--button-bg-hover);
    }
  }
  &:visited {
    color: var(--button-text-color);
  }
  &:active {
    transform: scale(0.95);
  }
}
@media (max-width: 768px) {
  .base-button {
    white-space: nowrap;
    min-width: fit-content;

    font-size: 13px;
    padding: 12px 14px;
  }
}
</style>