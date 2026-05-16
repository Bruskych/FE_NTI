import { defineStore } from 'pinia'

interface Toast {
  id: number
  message: string
  type: 'success' | 'error'
}

export const useNotificationStore = defineStore('notifications', {
  state: () => ({
    toasts: [] as Toast[]
  }),
  actions: {
    add(message: string, type: 'success' | 'error' = 'success') {
      const id = Date.now()
      this.toasts.push({ id, message, type })

      setTimeout(() => {
        this.toasts = this.toasts.filter(t => t.id !== id)
      }, 3000)
    }
  }
})