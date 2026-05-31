<!--
  Элемент-кнопка для заголовка столбика в таблице, при нажатии на которую происходит сортировка
-->

<script setup lang="ts">

import { computed } from 'vue'
import ArrowIcon from '@/assets/icons/arrow.svg'

type SortOrder = 'asc' | 'desc'

const props = defineProps<{
  field: string
  sortKey: string | null
  sortOrder: SortOrder | null
}>()

const emit = defineEmits<{
  (e: 'sort', field: string): void
}>()

const isActive = computed(() => props.sortKey === props.field)

const direction = computed(() => {
  if (!isActive.value) return null
  return props.sortOrder
})

const handleClick = () => {
  emit('sort', props.field)
}
</script>

<template>
  <button class="sort-btn" type="button" @click="handleClick">
    <span class="label">
      <slot />
    </span>

    <span class="icon" :class="{ visible: isActive, rotated: direction === 'asc' }">
      <ArrowIcon />
    </span>
  </button>
</template>

<style scoped>
.sort-btn {
  width: 100%;
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;

  cursor: pointer;
  user-select: none;

  padding: 6px 8px;
  border-radius: 6px;

  &:hover {
    background: var(--table-header-bg-color-hover);
  }
  &:hover .icon {
    opacity: 1;
  }
}
.icon {
  opacity: 0;
  transition: 0.15s ease;
  display: inline-flex;

  &.visible {
    opacity: 1;
  }
  &.rotated {
    transform: rotate(180deg);
    transition: transform 0.2s ease;
  }
}
</style>