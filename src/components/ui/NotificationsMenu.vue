<!--
  Меню уведомлений
-->

<script setup lang="ts">
// Описываем структуру уведомления. Сделали data? необязательным, чтобы соответствовать auth.ts
interface NotificationItem {
  id: number
  title: string
  message: string
  type: string // Например: 'team_invite', 'company_registration_rejected'
  read_at: string | null
  data?: Record<string, unknown> // Добавлен знак ?, теперь TypeScript полностью доволен
}

defineProps<{
  notifications: NotificationItem[]
}>()

// Объявляем события, которые мы отправляем кнопке-родителю при клике на "Принять" или "Отклонить"
const emit = defineEmits<{
  (e: 'accept', notificationId: number): void
  (e: 'decline', notificationId: number): void
}>()
</script>

<template>
  <div class="notifications-menu">

    <div class="menu-header">
      Notifications
    </div>

    <div class="divider"></div>

    <div v-if="notifications.length" class="notifications-list">
      <div
          v-for="notification in notifications"
          :key="notification.id"
          class="notification-item"
          :class="{ 'is-unread': !notification.read_at }"
      >
        <div class="notification-body">
          <div class="notification-title">
            {{ notification.title }}
          </div>
          <div class="notification-message">
            {{ notification.message }}
          </div>
        </div>

        <div v-if="notification.type === 'team_invite'" class="invite-actions">
          <button
              class="action-btn accept-btn"
              @click.stop="emit('accept', notification.id)"
          >
            Принять
          </button>
          <button
              class="action-btn decline-btn"
              @click.stop="emit('decline', notification.id)"
          >
            Отклонить
          </button>
        </div>
      </div>
    </div>

    <div v-else class="empty-state">
      Here you will see notifications about news and important events.
    </div>

  </div>
</template>

<style scoped>
.notifications-menu {
  background: var(--menu-color);
  border: 1px solid var(--menu-border);
  box-shadow: 0 6px 20px rgba(0,0,0,0.12);

  width: 420px;
  border-radius: 12px;
  overflow: hidden;
}
.menu-header {
  color: var(--text-color);

  padding: 14px 16px;
  font-size: 15px;
  font-weight: 700;
}
.divider {
  background: var(--menu-border);
  height: 1px;
}
.notifications-list {
  max-height: 380px;
  overflow-y: auto;
}
.notification-item {
  color: var(--text-color);
  padding: 14px 16px;
  border-bottom: 1px solid var(--menu-border);
  display: flex;
  flex-direction: column;
  gap: 10px;
  transition: background 0.2s ease;
}

.notification-item.is-unread {
  background: var(--main-color-light, rgba(59, 130, 246, 0.04));
}

.notification-item:last-child {
  border-bottom: none;
}

@media (hover:hover) and (pointer: fine){
  .notification-item:hover {
    background: var(--select-bg-color-focus);
  }
}

.notification-title {
  font-size: 14px;
  font-weight: 700;
  margin-bottom: 4px;
}
.notification-message {
  font-size: 13px;
  opacity: 0.85;
  line-height: 1.4;
}

.invite-actions {
  display: flex;
  gap: 8px;
  margin-top: 2px;
}
.action-btn {
  padding: 6px 14px;
  font-size: 12px;
  font-weight: 600;
  border-radius: 6px;
  cursor: pointer;
  border: none;
  transition: all 0.2s ease;
}
.accept-btn {
  background-color: #22c55e;
  color: white;
}
.accept-btn:hover {
  background-color: #16a34a;
}
.decline-btn {
  background-color: var(--button-bg-color-unimp);
  border: 1px solid var(--button-border-color-unimp);
  color: var(--text-color);
}
.decline-btn:hover {
  background-color: #ef4444;
  color: white;
  border-color: #ef4444;
}

.empty-state {
  color: var(--text-color);
  padding: 30px 16px;
  font-size: 14px;
  line-height: 1.5;
  text-align: center;
  opacity: 0.8;
}
</style>