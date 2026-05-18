<!--
  Поле ввода данных в виде раскрывающегося списка с вариантами выбора
-->

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import ArrowIcon from '@/assets/icons/arrow.svg'

interface Option {
  label: string
  value: string | number
}
interface Props {
  label?: string
  modelValue: string | number | null
  placeholder?: string
  options: Option[]
  error?: string
}

const props = defineProps<Props>()
const emit = defineEmits(['update:modelValue'])
const isOpen = ref(false)
const selectRef = ref<HTMLElement | null>(null)

const selectedLabel = computed(() => {
  const found = props.options.find(o => o.value === props.modelValue)
  return found ? found.label : ''
})
const toggle = () => {
  isOpen.value = !isOpen.value
}
const selectOption = (option: Option) => {
  emit('update:modelValue', option.value)
  isOpen.value = false
}
const handleOutside = (e: MouseEvent) => {
  if (selectRef.value && !selectRef.value.contains(e.target as Node)) {
    isOpen.value = false
  }
}

onMounted(() => document.addEventListener('click', handleOutside))
onBeforeUnmount(() => document.removeEventListener('click', handleOutside))
</script>

<template>
  <div class="select-wrapper" ref="selectRef">

    <label v-if="label" class="input-label">
      {{ label }}
    </label>

    <div
        class="select-box"
        :class="{ open: isOpen, 'input-error': error }"
        @click="toggle"
    >
      <span v-if="selectedLabel">{{ selectedLabel }}</span>
      <span v-else class="placeholder">{{ placeholder }}</span>

      <!-- ARROW -->
      <span class="arrow" :class="{ open: isOpen }">
        <ArrowIcon class="icon" />
      </span>
    </div>

    <!-- DROPDOWN -->
    <div class="dropdown-wrapper" :class="{ open: isOpen }">
      <div class="dropdown">
        <div
            v-for="option in options"
            :key="option.value"
            class="option"
            @click="selectOption(option)"
        >
          {{ option.label }}
        </div>
      </div>
    </div>

    <span v-if="error" class="error-message">{{ error }}</span>

  </div>
</template>

<style scoped>
.icon {
  color: var(--text-color);
}
.arrow {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.25s ease;
  transform-origin: center;

  &.open {
    transform: rotate(180deg);
  }
}
.select-wrapper {
  font-family: var(--font-main), sans-serif;
  font-weight: 550;

  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 16px;

  position: relative;
  width: 100%;
}
.input-label {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-color);
}
.select-box {
  font-weight: 550;
  font-size: 14px;

  padding: 10px 16px;
  border-radius: 6px;
  border: 1px solid var(--input-border-color);

  background: var(--input-bg-color);
  color: var(--text-color);

  display: flex;
  justify-content: space-between;
  align-items: center;

  cursor: pointer;
  user-select: none;

  transition: border 0.2s ease;

  &:hover {
    border-color: var(--input-border-color-focus);
  }
}
.dropdown-wrapper {
  position: absolute;
  bottom: 100%;
  left: 0;
  width: 100%;

  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);

  max-height: 0;
  opacity: 0;

  transform: translateY(5px);
  transition:
      max-height 0.25s ease,
      opacity 0.2s ease,
      transform 0.2s ease;

  margin-bottom: 6px;

  &.open {
    max-height: 200px;
    opacity: 1;
    transform: translateY(0);
  }
}
.dropdown {
  background: var(--select-bg-color);
  border: 1px solid var(--input-border-color);
  overflow-y: auto;
  max-height: 200px;
}
.option {
  padding: 10px 14px;
  cursor: pointer;
  transition: 0.2s;

  &:hover {
    background: var(--select-bg-color-focus);
  }
}
.placeholder {
  color: #888;
}
.input-error {
  border-color: var(--error-color);
}
.error-message {
  color: var(--error-color);
  font-size: 12px;
}
</style>