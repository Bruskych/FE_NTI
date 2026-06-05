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
    <span class="btn-content">
      <slot />
    </span>

    <span v-if="$slots.icon" class="btn-icon">
      <slot name="icon" />
    </span>
  </component>
</template>

<style scoped>
.base-button {
  font-weight: 550;

  box-sizing: border-box;
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
  gap: 8px;

  @media (hover:hover) and (pointer: fine) {
    &:hover {
      background-color: var(--button-bg-hover-unimp);
    }
  }
  &:active {
    transform: scale(0.95);
  }
}
.btn-content {
  display: inline-flex;
  align-items: center;
}
.btn-icon {
  width: 24px;
  height: 24px;
  display: inline-flex;
  align-items: center;
}
</style>