import { createRouter, createWebHistory } from 'vue-router'
import StudentsView from './StudentsView.vue'
import CoursesView from './CoursesView.vue'
import EnrollmentsView from './EnrollmentsView.vue'
import RosterView from './RosterView.vue'

export default createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/students' },
    { path: '/students', name: 'students', component: StudentsView },
    { path: '/courses', name: 'courses', component: CoursesView },
    { path: '/enrollments', name: 'enrollments', component: EnrollmentsView },
    { path: '/roster', name: 'roster', component: RosterView },
  ],
})
