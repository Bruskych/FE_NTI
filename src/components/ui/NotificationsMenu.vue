<script setup lang="ts">
// Описываем интерфейс элемента уведомления для типизации Props
interface NotificationItem {
  id: number
  title: string
  message: string
  type: string
  read_at: string | null
  data?: {
    team_id?: number
    team_name?: string
    invited_by?: string
  }
}

// Принимаем массив уведомлений от родительского компонента
defineProps<{
  notifications: NotificationItem[]
}>()

// Объявляем события для отправки наверх (в родительский компонент/стор)
defineEmits(['accept', 'decline'])
</script>

<template>
  <div class="notifications-menu">
    <div class="menu-header">
      <h3>{{ $t('notification.title') }}</h3>
    </div>

    <div class="menu-content custom-scrollbar">
      <div
          v-for="notification in notifications"
          :key="notification.id"
          class="notification-item"
          :class="{ 'is-unread': !notification.read_at }"
      >
        <div class="notification-body">
          <div class="notification-title">{{ notification.title }}</div>
          <div class="notification-message">{{ notification.message }}</div>

          <div v-if="notification.type === 'team_invite'" class="notification-actions">
            <button class="btn-accept" @click="$emit('accept', notification.id)">
              {{ $t('notification.accept') }}
            </button>
            <button class="btn-decline" @click="$emit('decline', notification.id)">
              {{ $t('notification.decline') }}
            </button>
          </div>
        </div>
      </div>

      <div v-if="notifications.length === 0" class="empty-state">
        <p>{{ $t('notification.empty') }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.notifications-menu {
  width: 340px;
  max-height: 420px;
  background: var(--menu-color);
  border: 1px solid var(--menu-border);
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.menu-header {
  padding: 14px 18px;
  border-bottom: 1px solid var(--menu-border);
  background: rgba(255, 255, 255, 0.01);
}

.menu-header h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-color);
}

.menu-content {
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.notification-item {
  padding: 14px 18px;
  border-bottom: 1px solid var(--menu-border);
  background: transparent;
}

.notification-item.is-unread {
  background: rgba(100, 116, 139, 0.03);
  box-shadow: inset 3px 0 0 0 var(--main-color);
}

.notification-item:hover {
  background: rgba(100, 116, 139, 0.05);
}

.notification-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-color);
  margin-bottom: 4px;
}

.notification-message {
  font-size: 0.82rem;
  color: var(--text-color);
  opacity: 0.7;
  line-height: 1.4;
}

.notification-actions {
  display: flex;
  gap: 8px;
  margin-top: 10px;
}

.notification-actions button {
  flex: 1;
  padding: 7px 10px;
  border-radius: 6px;
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  border: none;
}

.notification-actions button:active {
  transform: scale(0.97);
}

.btn-accept {
  background-color: var(--good-color, #45c893);
  color: #ffffff;
}

.btn-decline {
  background: var(--button-bg-color-unimp);
  color: var(--text-color);
  border: 1px solid var(--button-border-color-unimp) !important;
}

.btn-decline:hover {
  background: var(--button-bg-hover-unimp);
}

.empty-state {
  padding: 45px 20px;
  text-align: center;
}

.empty-state p {
  margin: 0;
  font-size: 0.85rem;
  color: var(--text-color);
  opacity: 0.5;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 5px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: var(--scroll-color);
  border-radius: 10px;
}
</style>