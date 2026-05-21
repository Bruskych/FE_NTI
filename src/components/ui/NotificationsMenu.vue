<!--
  Меню уведомлений
-->

<script setup lang="ts">
interface NotificationItem {
  id: number
  title: string
  message: string
  type: string
  read_at: string | null
}

defineProps<{
  notifications: NotificationItem[]
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
      >
        <div class="notification-title">
          {{ notification.title }}
        </div>

        <div class="notification-message">
          {{ notification.message }}
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

  width: 450px;
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
  max-height: 320px;
  overflow-y: auto;
}
.notification-item {
  color: var(--text-color);

  font-size: 15px;
  padding: 12px 16px;
  transition: background 0.2s ease;
  cursor: pointer;

  &:hover {
    background: var(--select-bg-color-focus);
  }
}
.empty-state {
  color: var(--text-color);

  padding: 20px 16px;
  font-size: 14px;
  line-height: 1.5;
}
.notification-title {
  font-size: 14px;
  font-weight: 700;
  margin-bottom: 4px;
}
.notification-message {
  font-size: 13px;
  opacity: 0.85;
}
</style>