<!--
  Маленькая квадратная кнопка с иконкой внутри вместо текста
-->

<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'

const props = defineProps<{
  type?: 'button' | 'submit' | 'reset'
  to?: string
  severity?: 'success' | 'danger' | 'primary'
  disabled?: boolean
}>()

const isLink = computed(() => !!props.to)

// Динамические классы в зависимости от тяжести действия (severity)
const buttonClass = computed(() => [
  'icon-button',
  props.severity ? `severity-${props.severity}` : 'severity-primary'
])
</script>

<template>
  <component
      :is="isLink ? RouterLink : 'button'"
      :class="buttonClass"
      :disabled="disabled"
      v-bind="isLink ? { to } : { type: type || 'button' }"
  >
    <div class="icon-wrapper">
      <slot />
    </div>
  </component>
</template>

<style scoped>
.icon-button {
  box-sizing: border-box;

  width: 36px;
  height: 36px;
  border-radius: 6px;
  cursor: pointer;
  text-decoration: none;

  display: inline-flex;
  align-items: center;
  justify-content: center;

  &:active:not(:disabled) {
    transform: scale(0.92);
  }
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
}
.icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;

  & :deep(svg) {
    width: 26px;
    height: 26px;
  }
}
.severity-primary {
  background-color: var(--button-bg-color);
  color: var(--button-text-color);

  @media (hover:hover) and (pointer: fine){
    &:hover:not(:disabled) {
      background-color: var(--button-bg-hover);
    }
  }
}
.severity-success {
  color: var(--good-color);
  border: 1.4px solid var(--good-color);

  @media (hover:hover) and (pointer: fine){
    &:hover:not(:disabled) {
      background-color: var(--good-color);
      color: #ffffff;
    }
  }
}
.severity-danger {
  color: var(--error-color);
  border: 1.4px solid var(--error-color);

  @media (hover:hover) and (pointer: fine){
    &:hover:not(:disabled) {
      background-color: var(--error-color);
      color: #ffffff;
    }
  }
}
</style>