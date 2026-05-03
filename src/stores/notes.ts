import { defineStore } from 'pinia'
import api from '@/core/api/axios'

export const useNotesStore = defineStore('notes', {
  state: () => ({
    notes: [],
    myNotes: [],
    paginationAll: null,
    paginationMine: null,
    selectedNote: null,
    loadingAll: false,
    loadingMine: false,
    loadingDetail: false,
    error: null,
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
      } catch (error) {
        this.error = error.response?.data?.message || 'Nepodarilo sa načítať poznámky.'
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
      } catch (error) {
        this.error = error.response?.data?.message || 'Nepodarilo sa načítať moje poznámky.'
      } finally {
        this.loadingMine = false
      }
    },

    async fetchNoteDetail(id) {
      this.loadingDetail = true
      this.error = null
      this.selectedNote = null

      try {
        const response = await api.get(`/notes/${id}`)
        this.selectedNote = response.data.note
      } catch (error) {
        this.error = error.response?.data?.message || 'Nepodarilo sa načítať detail poznámky.'
      } finally {
        this.loadingDetail = false
      }
    },

    async openAttachment(publicId) {
      try {
        const response = await api.get(`/attachments/${publicId}/link`)
        window.open(response.data.url, '_blank')
      } catch (error) {
        this.error = error.response?.data?.message || 'Nepodarilo sa otvoriť prílohu.'
      }
    },
  },
})
