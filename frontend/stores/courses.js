import { defineStore } from 'pinia'
import { get, post, del } from '../client'
export const useCoursesStore = defineStore('courses', {
  state: () => ({ courses: [], loading: false }),
  actions: {
    async fetchCourses() { this.loading = true; try { this.courses = await get('/api/courses') } finally { this.loading = false } },
    async addCourse(data) { const result = await post('/api/courses', data); await this.fetchCourses(); return result.course },
    async deleteCourse(id) { await del(`/api/courses/${encodeURIComponent(id)}`); await this.fetchCourses() },
  },
})
