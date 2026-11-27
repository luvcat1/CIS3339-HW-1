import { defineStore } from 'pinia'
import { get, post } from '../client'
export const useStudentsStore = defineStore('students', {
  state: () => ({ students: [], loading: false }),
  actions: {
    async fetchStudents() { this.loading = true; try { this.students = await get('/api/students') } finally { this.loading = false } },
    async findStudentByName(name) { return post('/find-student', { name }) },
    async addStudent(data) { const result = await post('/add-student', data); await this.fetchStudents(); return result.student },
    async deleteStudent(id) { await post('/delete-student', { id }); await this.fetchStudents() },
  },
})
