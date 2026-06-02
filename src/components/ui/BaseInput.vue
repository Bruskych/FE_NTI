<!--
  Поле ввода данных
-->

<script setup lang="ts">

import { ref, computed } from 'vue'
import ClosedEye from '@/assets/icons/eye_closed.svg'
import OpenEye from '@/assets/icons/eye_open.svg'

interface Props {
  label?: string                  // Текст над полем ввода
  modelValue: string | number     // Главное значение input
  type?: string                   // Тип input (text / password / email / number)
  placeholder?: string            // Серый текст внутри input
  error?: string                  // Текст ошибки
  showPasswordToggle?: boolean    // Даёт возможность увидеть свой пароль
  visible?: boolean               // Вкл/Выкл поле ввода
  noMargin?: boolean              // Отключать отступ снизу
  variant?: 'default' | 'table'   // Варианты под конкретную страницу
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  placeholder: '',
  visible: true,
  variant: 'default'
})

const showPassword = ref(false)
const inputType = computed(() => {
  if (props.type !== 'password') return props.type
  return showPassword.value ? 'text' : 'password'
})

const emit = defineEmits(['update:modelValue'])
const updateValue = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
}

</script>

<template>
  <div v-show="visible" :class="['input-wrapper',{ 'no-margin': noMargin },`variant-${variant}`]">
    <!-- Название поля ввода -->
    <label v-if="label" class="input-label">
      {{ label }}
    </label>
    <!-- Поле ввода -->
    <div class="input-container">
      <input
          :type="inputType"
          :value="modelValue"
          :placeholder="placeholder"
          :class="[
            'base-input',
             { 'input-error': error },
             { 'has-eye': type === 'password' && showPasswordToggle }
          ]"
          @input="updateValue"
      />
      <button
          v-if="type === 'password' && showPasswordToggle"
          type="button"
          class="eye-btn"
          @click="showPassword = !showPassword"
      >
        <OpenEye v-if="showPassword" class="icon" />
        <ClosedEye v-else class="icon" />
      </button>
    </div>
    <!-- Сообщение о ошибке -->
    <transition name="fade">
      <span v-if="error" class="error-message">{{ error }}</span>
    </transition>
  </div>
</template>

<style scoped>
.icon {
  color: var(--text-color);
}
.input-container {
  position: relative;
  width: 100%;
}
.eye-btn {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);

  background: transparent;
  border: none;
  cursor: pointer;

  display: flex;
  align-items: center;
  justify-content: center;

  @media (hover:hover) and (pointer: fine){
    &:hover .icon {
      color: var(--button-bg-color);
      transform: scale(0.95);
    }
  }
}
.input-wrapper {
  font-weight: 550;

  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 16px;
  width: 100%;

  &.no-margin {
    margin-bottom: 0;
  }
}
.input-label {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-color);
}
.base-input {
  font-weight: 550;

  width: 100%;
  box-sizing: border-box;

  padding: 12px 16px;
  border-radius: 6px;
  border: 1.3px solid var(--input-border-color);

  background-color: var(--input-bg-color);
  color: var(--text-color);

  outline: none;

  &:focus {
    border-color: var(--input-border-color-focus);
  }
  &.input-error {
    border-color: var(--error-color);
  }
  &.has-eye {
    padding-right: 45px;
  }
}
.error-message {
  color: var(--error-color);
  font-size: 12px;
  margin-top: 2px;
}
.fade-enter-active, .fade-leave-active {
  opacity: 0;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

.variant-table {
  .base-input {
    border: 1.3px solid var(--table-header-bg-color);
    background-color: var(--table-row-bg-color);

    &:focus {
      border-color: var(--table-header-bg-color);
    }
    &::placeholder {
      color: var(--input-placeholder-color-table);
      opacity: 1;
    }
  }
}
</style>