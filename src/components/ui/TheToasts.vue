<script setup lang="ts">
import { useNotificationStore } from '@/stores/notifications'
const store = useNotificationStore()
</script>

<template>
  <div class="toast-container">
    <TransitionGroup name="list">
      <div v-for="toast in store.toasts" :key="toast.id" :class="['toast', toast.type]">
        {{ toast.message }}
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.toast-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.toast {
  padding: 12px 24px;
  border-radius: 8px;
  color: white;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}
.success { background-color: #66cba2; } /* Твой зеленый */
.error { background-color: #e74c3c; }

.list-enter-active, .list-leave-active { transition: all 0.5s ease; }
.list-enter-from { opacity: 0; transform: translateX(30px); }
.list-leave-to { opacity: 0; transform: scale(0.9); }
</style>