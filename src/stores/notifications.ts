import { defineStore } from 'pinia'
import { ref } from 'vue'

// ---------------------------------------------------------
// Интерфейсы данных
// ---------------------------------------------------------

export interface Toast {
    id: number
    message: string
    type: 'success' | 'error'
}

// ---------------------------------------------------------
// Стор уведомлений (Setup Store)
// ---------------------------------------------------------

export const useNotificationStore = defineStore('notifications', () => {
    // State
    const toasts = ref<Toast[]>([])

    // Actions
    function add(message: string, type: 'success' | 'error' = 'success') {
        const id = Date.now()
        toasts.value.push({ id, message, type })

        setTimeout(() => {
            toasts.value = toasts.value.filter(t => t.id !== id)
        }, 3000)
    }

    return {
        toasts,
        add
    }
})