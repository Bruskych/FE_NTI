<!--
  Кнопка переключения языка
-->

<script setup lang="ts">

defineProps<{ lang: string }>()
defineEmits<{ (e: 'toggle'): void }>()

</script>

<template>
  <button class="lang-toggle" @click="$emit('toggle')">
    <span class="lang-text">
      {{ lang.toUpperCase() }}
    </span>
  </button>
</template>

<style scoped>
.lang-text {
  color: var(--text-color);

  font-size: 12px;
  font-weight: 550;
  letter-spacing: 0.75px;
}
.lang-toggle {
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

  @media (hover:hover) and (pointer: fine){
    &:hover {
      background-color: var(--button-bg-hover-unimp);
    }
  }
  &:active {
    transform: scale(0.95);
  }
}
</style>