<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import DataTable from '../components/DataTable.vue'
import AlertMessage from '../components/AlertMessage.vue'
import BaseSelect from '../components/BaseSelect.vue'
import { useCoursesStore } from '../stores/courses'
import { useEnrollmentsStore } from '../stores/enrollments'

const coursesStore = useCoursesStore()
const enrollmentsStore = useEnrollmentsStore()
const selectedCourseId = ref('')
const message = ref(null)

const columns = [
  { key: 'name', label: 'Name' },
  { key: 'id', label: 'Student ID' },
  { key: 'phone', label: 'Phone' },
  { key: 'zip', label: 'ZIP Code' },
]

const courseOptions = computed(() =>
  coursesStore.courses.map((c) => ({ value: c.courseId, label: `${c.courseId} - ${c.title}` })),
)

enrollmentsStore.clearRoster() // don't show a stale roster from an earlier visit

onMounted(async () => {
  try {
    await coursesStore.fetchCourses()
  } catch (error) {
    message.value = { type: 'error', text: error.message }
  }
})

watch(selectedCourseId, async (courseId) => {
  message.value = null
  if (!courseId) return enrollmentsStore.clearRoster()
  try {
    await enrollmentsStore.fetchRoster(courseId)
  } catch (error) {
    message.value = { type: 'error', text: error.status === 404 ? 'Course not found.' : error.message }
  }
})
</script>

<template>
  <section>
    <h1>Course Roster</h1>
    <AlertMessage v-if="message" :type="message.type">{{ message.text }}</AlertMessage>

    <div class="card">
      <BaseSelect v-model="selectedCourseId" label="Course" placeholder="Select a course" :options="courseOptions" />
      <p v-if="!coursesStore.loading && !coursesStore.courses.length" class="muted">No courses yet.</p>
    </div>

    <template v-if="enrollmentsStore.roster">
      <h2>{{ enrollmentsStore.roster.course.courseId }} - {{ enrollmentsStore.roster.course.title }}</h2>
      <DataTable
        :columns="columns"
        :rows="enrollmentsStore.roster.students"
        row-key="id"
        :loading="enrollmentsStore.loading"
        empty-text="No students are enrolled in this course yet."
      />
    </template>
  </section>
</template>
