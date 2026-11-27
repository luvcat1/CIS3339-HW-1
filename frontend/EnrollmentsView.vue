<script setup>
import { onMounted, ref } from 'vue'
import AlertMessage from '../components/AlertMessage.vue'
import EnrollmentForm from '../components/EnrollmentForm.vue'
import { useStudentsStore } from '../stores/students'
import { useCoursesStore } from '../stores/courses'

const studentsStore = useStudentsStore()
const coursesStore = useCoursesStore()
const message = ref(null)

onMounted(async () => {
  try {
    await Promise.all([studentsStore.fetchStudents(), coursesStore.fetchCourses()])
  } catch (error) {
    message.value = { type: 'error', text: error.message }
  }
})
</script>

<template>
  <section>
    <h1>Enrollments</h1>
    <AlertMessage v-if="message" :type="message.type">{{ message.text }}</AlertMessage>

    <AlertMessage v-if="!studentsStore.loading && !studentsStore.students.length" type="info">
      There are no students yet. Add a student on the Students page first.
    </AlertMessage>
    <AlertMessage v-if="!coursesStore.loading && !coursesStore.courses.length" type="info">
      There are no courses yet. Add a course on the Courses page first.
    </AlertMessage>

    <EnrollmentForm
      @enrolled="({ student, course }) => (message = { type: 'success', text: `Enrolled ${student.name} in ${course.courseId}.` })"
      @error="(text) => (message = { type: 'error', text })"
    />
  </section>
</template>
