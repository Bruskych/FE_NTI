<script setup lang="ts">
import CloseIcon from '@/assets/icons/close.svg'
import { computed } from 'vue'

interface Props {
  message: string
  closable?: boolean
}

const props = defineProps<Props>()
const emit = defineEmits(['close'])

const hasMessage = computed(() => !!props.message)
</script>

<template>
  <div v-if="hasMessage" class="error-box">
    <span class="text">
      {{ message }}
    </span>
    <button
        v-if="closable"
        class="close-btn"
        @click="$emit('close')"
        type="button"
    >
      <CloseIcon class="icon" />
    </button>
  </div>
</template>

<style scoped>
.error-box {
  display: flex;
  align-items: center;
  justify-content: space-between;

  padding: 10px 12px;
  border: 1px solid var(--error-color);
  border-radius: 8px;

  background: transparent;
  color: var(--error-color);

  font-size: 14px;
  font-weight: 500;

  transition: 0.2s;
}
.text {
  flex: 1;
  padding-right: 10px;
}
.close-btn {
  background: transparent;
  border: none;
  cursor: pointer;

  display: flex;
  align-items: center;
  justify-content: center;

  width: 24px;
  height: 24px;
  padding: 0;

  &:hover .icon {
    transform: rotate(90deg);
  }
  &:active {
    transform: scale(0.95);
  }
}
.icon {
  color: var(--error-color);

  transition: transform 0.25s ease;
  transform-origin: center;
  transform-box: fill-box;
}
</style>