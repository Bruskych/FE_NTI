import { defineStore } from 'pinia'
import api from '@/core/api/axios'
import axios from 'axios'

type Note = {
  id: number
  title?: string
  content?: string
  [key: string]: unknown
}

type Pagination = {
  current_page: number
  last_page: number
  per_page: number
  total: number
}

type ApiError = string | null

export const useNotesStore = defineStore('notes', {
  state: () => ({
    notes: [] as Note[],
    myNotes: [] as Note[],

    paginationAll: null as Pagination | null,
    paginationMine: null as Pagination | null,

    selectedNote: null as Note | null,

    loadingAll: false,
    loadingMine: false,
    loadingDetail: false,

    error: null as ApiError,
  }),

  actions: {
    async fetchAllNotes(page = 1) {
      this.loadingAll = true
      this.error = null

      try {
        const response = await api.get(`/notes?page=${page}`)
        const payload = response.data.notes

        this.notes = payload.data
        this.paginationAll = {
          current_page: payload.current_page,
          last_page: payload.last_page,
          per_page: payload.per_page,
          total: payload.total,
        }
      } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
          this.error =
            error.response?.data?.message ||
            'Nepodarilo sa načítať poznámky.'
        } else {
          this.error = 'Nepodarilo sa načítať poznámky.'
        }
      } finally {
        this.loadingAll = false
      }
    },

    async fetchMyNotes(page = 1) {
      this.loadingMine = true
      this.error = null

      try {
        const response = await api.get(`/my-notes?page=${page}`)
        const payload = response.data.notes

        this.myNotes = payload.data
        this.paginationMine = {
          current_page: payload.current_page,
          last_page: payload.last_page,
          per_page: payload.per_page,
          total: payload.total,
        }
      } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
          this.error =
            error.response?.data?.message ||
            'Nepodarilo sa načítať moje poznámky.'
        } else {
          this.error = 'Nepodarilo sa načítať moje poznámky.'
        }
      } finally {
        this.loadingMine = false
      }
    },

    async fetchNoteDetail(id: number | string) {
      this.loadingDetail = true
      this.error = null
      this.selectedNote = null

      try {
        const response = await api.get(`/notes/${id}`)
        this.selectedNote = response.data.note
      } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
          this.error =
            error.response?.data?.message ||
            'Nepodarilo sa načítať detail poznámky.'
        } else {
          this.error = 'Nepodarilo sa načítať detail poznámky.'
        }
      } finally {
        this.loadingDetail = false
      }
    },

    async openAttachment(publicId: string | number) {
      try {
        const response = await api.get(`/attachments/${publicId}/link`)
        window.open(response.data.url, '_blank')
      } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
          this.error =
            error.response?.data?.message ||
            'Nepodarilo sa otvoriť prílohu.'
        } else {
          this.error = 'Nepodarilo sa otvoriť prílohu.'
        }
      }
    },
  },
})