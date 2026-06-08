<script setup lang="ts">
import { ref } from 'vue'
import CopyIcon from '@/assets/icons/copy.svg'

interface NotificationItem {
  id: number
  title: string
  message: string
  type: string
  read_at: string | null
  created_at?: string
  data?: {
    team_id?: number
    team_name?: string
    invited_by?: string
  }
}

const props = defineProps<{
  notifications: NotificationItem[]
}>()

const emit = defineEmits(['accept', 'decline', 'read'])

// Локальное состояние для анимации прочтения конкретного уведомления
const readingId = ref<number | null>(null)

// Функция для обработки клика по уведомлению
const handleRead = async (id: number) => {
  readingId.value = id

  // Имитируем небольшую искусственную задержку в 800мс для красоты анимации,
  // чтобы успели пробежать три точки, прежде чем бэкенд скроет уведомление
  await new Promise(resolve => setTimeout(resolve, 800))

  emit('read', id)

  // Сбрасываем ID читаемого уведомления
  if (readingId.value === id) {
    readingId.value = null
  }
}

// Функция для форматирования даты в формат "ДД.ММ"
const formatDate = (dateString?: string) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0') // Месяцы в JS идут с 0 до 11

  return `${day}.${month}`
}

// Функция для копирования текста уведомления
const copyNotification = (notification: NotificationItem) => {
  const textToCopy = `${notification.title}: ${notification.message}`

  navigator.clipboard.writeText(textToCopy)
      .then(() => {
        // Здесь при желании можно вызвать твой toastStore, чтобы показать плашку "Скопировано!"
        console.log('Текст уведомления скопирован!')
      })
      .catch(err => {
        console.error('Не удалось скопировать текст: ', err)
      })
}
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
          :class="{
            'is-unread': !notification.read_at,
            'is-reading': readingId === notification.id
          }"
          @click.stop="!notification.read_at && readingId !== notification.id && handleRead(notification.id)"
      >
        <button
            class="btn-copy"
            v-tooltip="$t('actions.copy')"
            @click.stop="copyNotification(notification)"
        >
          <CopyIcon class="copy-icon" />
        </button>

        <div class="notification-body">
          <template v-if="readingId !== notification.id">
            <div class="notification-title">{{ notification.title }}</div>
            <div class="notification-message">{{ notification.message }}</div>

            <div v-if="notification.type === 'team_invite'" class="notification-actions">
              <button class="btn-accept" @click.stop="$emit('accept', notification.id)">
                {{ $t('notification.accept') }}
              </button>
              <button class="btn-decline" @click.stop="$emit('decline', notification.id)">
                {{ $t('notification.decline') }}
              </button>
            </div>
            <div v-if="notification.created_at" class="notification-date">
              {{ formatDate(notification.created_at) }}
            </div>
          </template>

          <template v-else>
            <div class="reading-state">
              <span class="reading-text">{{ $t('actions.read_notification') }}</span>
              <div class="dots">
                <span class="dot">.</span>
                <span class="dot">.</span>
                <span class="dot">.</span>
              </div>
            </div>
          </template>
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
  width: 550px;
  max-height: 420px;
  max-width: 100%;
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

  & h3 {
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
    color: var(--text-color);
  }
}
.menu-content {
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  padding: 4px 0;
  gap: 2px;
}
.notification-item {
  padding: 14px 18px;
  border-bottom: 1px solid var(--menu-border);
  background: transparent;
  cursor: pointer;
  user-select: none;
  position: relative;
  z-index: 1;
  transition: all 0.2s ease-in-out;

  &:last-child {
    border-bottom: none;
  }

  &.is-unread {
    background: rgba(100, 116, 139, 0.03);
    box-shadow: inset 3px 0 0 0 var(--main-color);
  }

  &:hover {
    background: rgba(100, 116, 139, 0.07);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
    z-index: 2;

    & .btn-copy {
      opacity: 0.5;
    }
  }

  &.is-unread:hover {
    box-shadow: inset 3px 0 0 0 var(--main-color), 0 4px 12px rgba(0, 0, 0, 0.12);
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
  }

  &.is-reading {
    background: rgba(100, 116, 139, 0.01) !important;
    transform: scale(0.98);
    opacity: 0.75;
    pointer-events: none;
  }

  & .notification-title {
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--text-color);
    margin-bottom: 4px;
    padding-right: 22px;
  }

  & .notification-message {
    font-size: 0.82rem;
    color: var(--text-color);
    opacity: 0.7;
    line-height: 1.4;
  }

  & .notification-body {
    display: flex;
    flex-direction: column;
    position: relative;
  }

  & .notification-date {
    align-self: flex-end;
    font-size: 0.72rem;
    font-weight: 500;
    color: var(--text-color);
    opacity: 0.4;
    margin-top: 4px;
    user-select: none;
    transition: opacity 0.2s ease;
  }

  &:hover .notification-date {
    opacity: 0.7;
  }

  & .btn-copy {
    position: absolute;
    top: 12px;
    right: 12px;
    background: transparent;
    border: none;
    opacity: 0;
    padding: 5px;
    border-radius: 6px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: opacity 0.2s, background-color 0.2s;

    &:hover {
      opacity: 1 !important;
      background: rgba(100, 116, 139, 0.15);

      & .copy-icon {
        color: var(--main-color);
      }
    }

    & .copy-icon {
      width: 16px;
      height: 16px;
      color: var(--text-color);
      transition: color 0.2s;
    }
  }
}
.notification-actions {
  display: flex;
  gap: 8px;
  margin-top: 10px;

  & button {
    flex: 1;
    padding: 7px 10px;
    border-radius: 6px;
    font-size: 0.78rem;
    font-weight: 600;
    cursor: pointer;
    border: none;
    transition: transform 0.1s ease;

    &:active {
      transform: scale(0.95);
    }
  }
}
.btn-accept {
  background-color: var(--good-color, #45c893);
  color: #ffffff;
}
.btn-decline {
  background: var(--button-bg-color-unimp);
  color: var(--text-color);
  border: 1px solid var(--button-border-color-unimp) !important;

  &:hover {
    background: var(--button-bg-hover-unimp);
  }
}
.reading-state {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.85rem;
  font-weight: 550;
  color: var(--main-color);
  padding: 8px 0;
}
.dots {
  & .dot {
    font-size: 1.2rem;
    line-height: 0;
    animation: blink 1.4s infinite both;

    &:nth-child(2) {
      animation-delay: .2s;
    }

    &:nth-child(3) {
      animation-delay: .4s;
    }
  }
}
@keyframes blink {
  0% { opacity: .2; }
  20% { opacity: 1; }
  100% { opacity: .2; }
}
.empty-state {
  padding: 45px 20px;
  text-align: center;

  & p {
    margin: 0;
    font-size: 0.85rem;
    color: var(--text-color);
    opacity: 0.5;
  }
}
.custom-scrollbar {
  &::-webkit-scrollbar {
    width: 5px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: var(--scroll-color);
    border-radius: 10px;
  }
}
</style>