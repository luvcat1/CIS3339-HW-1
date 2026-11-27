<script setup>
import { onMounted, ref } from 'vue'
import DataTable from '../components/DataTable.vue'
import AlertMessage from '../components/AlertMessage.vue'
import CourseForm from '../components/CourseForm.vue'
import { useCoursesStore } from '../stores/courses'

const store = useCoursesStore()
const message = ref(null)

const columns = [
  { key: 'courseId', label: 'Course ID' },
  { key: 'title', label: 'Course Name' },
]

const notify = (type, text) => (message.value = { type, text })

onMounted(async () => {
  try {
    await store.fetchCourses()
  } catch (error) {
    notify('error', error.message)
  }
})

async function remove(course) {
  if (!confirm(`Delete course ${course.courseId}? Its enrollments will also be removed.`)) return
  try {
    await store.deleteCourse(course.courseId)
    notify('success', `Deleted ${course.courseId}.`)
  } catch (error) {
    notify('error', error.message)
  }
}
</script>

<template>
  <section>
    <h1>Courses</h1>
    <AlertMessage v-if="message" :type="message.type">{{ message.text }}</AlertMessage>

    <CourseForm @added="(c) => notify('success', `Added ${c.courseId}.`)" @error="(m) => notify('error', m)" />

    <h2>All Courses</h2>
    <DataTable :columns="columns" :rows="store.courses" row-key="courseId" :loading="store.loading" empty-text="No courses yet.">
      <template #actions="{ row }">
        <button type="button" class="danger" @click="remove(row)">Delete</button>
      </template>
    </DataTable>
  </section>
</template>
