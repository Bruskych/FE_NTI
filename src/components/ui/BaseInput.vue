<script setup lang="ts">
interface Props {
  label?: string                  // Текст над полем ввода
  modelValue: string | number     // Главное значение input
  type?: string                   // Тип input (text / password / email / number)
  placeholder?: string            // Серый текст внутри input
  error?: string                  // Текст ошибки
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  placeholder: '',
})

const emit = defineEmits(['update:modelValue'])
const updateValue = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
}
</script>

<template>
  <div class="input-wrapper">
    <!-- Название поля ввода -->
    <label v-if="label" class="input-label">
      {{ label }}
    </label>
    <!-- Поле ввода -->
    <input
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :class="['base-input', { 'input-error': error }]"
        @input="updateValue"
    />
    <!-- Сообщение о ошибке -->
    <transition name="fade">
      <span v-if="error" class="error-message">{{ error }}</span>
    </transition>
  </div>
</template>

<style scoped>
.input-wrapper {
  font-family: var(--font-main), sans-serif;
  font-weight: 550;

  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 16px;
  width: 100%;
}
.input-label {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-color);
}
.base-input {
  padding: 12px 16px;
  border-radius: 6px;
  border: 1px solid var(--input-border-color);

  background-color: var(--input-bg-color);
  color: var(--text-color);

  font-family: var(--font-main), sans-serif;
  font-weight: 550;

  transition: all 0.2s ease;
  outline: none;
}
.base-input:focus {
  border-color: var(--input-border-color-focus);
}
.base-input.input-error {
  border-color: #e74c3c;
}
.error-message {
  color: #e74c3c;
  font-size: 12px;
  margin-top: 2px;
}
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>