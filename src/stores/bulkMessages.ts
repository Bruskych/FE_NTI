import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/core/api/axios'

export interface BulkMessageSender {
  id: number
  name: string
  email: string
  avatar_url: string | null
}

export interface BulkMessage {
  id: number
  sender_id: number
  target_group: string
  subject: string
  body: string
  recipient_count: number
  is_sent: boolean
  sent_at: string | null
  sender: BulkMessageSender | null
  created_at: string
}

export interface SendBulkMessagePayload {
  target_group: string
  subject: string
  body: string
}

export const useBulkMessagesStore = defineStore('bulkMessages', () => {
  const messages = ref<BulkMessage[]>([])
  const loading = ref(false)
  const sending = ref(false)
  const currentPage = ref(1)
  const lastPage = ref(1)
  const total = ref(0)

  async function fetchMessages(page = 1) {
    loading.value = true
    try {
      const { data } = await api.get(`/admin/bulk-messages?page=${page}`)
      messages.value = data.data ?? []
      currentPage.value = data.meta?.current_page ?? 1
      lastPage.value = data.meta?.last_page ?? 1
      total.value = data.meta?.total ?? messages.value.length
    } finally {
      loading.value = false
    }
  }

  async function sendMessage(payload: SendBulkMessagePayload): Promise<BulkMessage> {
    sending.value = true
    try {
      const { data } = await api.post('/admin/bulk-messages', payload)
      const msg: BulkMessage = data.bulk_message
      messages.value.unshift(msg)
      total.value++
      return msg
    } finally {
      sending.value = false
    }
  }

  return {
    messages, loading, sending, currentPage, lastPage, total,
    fetchMessages, sendMessage,
  }
})
