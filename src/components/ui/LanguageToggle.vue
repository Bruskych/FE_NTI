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
  font-size: 12px;
  font-weight: 550;
  letter-spacing: 0.5px;
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

  transition: all 0.2s ease;
}
.lang-toggle:hover {
  background-color: var(--button-bg-hover-unimp);
}
</style>