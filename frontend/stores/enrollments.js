import { defineStore } from 'pinia'
import { get, post } from '../client'
export const useEnrollmentsStore = defineStore('enrollments', {
  state: () => ({ roster: null, loading: false }),
  actions: {
    async enroll(data) { return post('/api/enrollments', data) },
    clearRoster() { this.roster = null },
    async fetchRoster(id) { this.roster = null; this.loading = true; try { this.roster = await get(`/api/courses/${encodeURIComponent(id)}/roster`) } finally { this.loading = false } },
  },
})
