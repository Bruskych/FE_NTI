<script setup lang="ts">
type OptionValue = string | number

interface Option {
  label: string
  value: OptionValue
}

const props = defineProps<{
  options: Option[]
  modelValue: OptionValue
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: OptionValue): void
}>()

const handleSelect = (value: OptionValue) => {
  if (props.modelValue === value) return
  emit('update:modelValue', value)
}
</script>

<template>
  <div class="toggle-group">
    <button
        v-for="option in props.options"
        :key="option.value"
        type="button"
        :class="['toggle-btn', { active: props.modelValue === option.value }]"
        @click="handleSelect(option.value)"
    >
      {{ option.label }}
    </button>
  </div>
</template>

<style scoped>
.toggle-group {
  font-family: var(--font-main), sans-serif;
  font-weight: 550;

  display: flex;
  gap: 10px;
  width: 100%;
}
.toggle-btn {
  flex: 1;
  padding: 12px 20px;
  border: 1px solid #d1d1d1;
  border-radius: 8px;
  background: var(--bg-color, #ffffff);
  color: var(--text-color, #333333);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
}
.toggle-btn:hover {
  border-color: #66cba2;
}
.toggle-btn.active {
  background: #66cba2;
  color: white;
  border-color: #66cba2;
  box-shadow: 0 4px 12px rgba(102, 203, 162, 0.3);
}
</style>