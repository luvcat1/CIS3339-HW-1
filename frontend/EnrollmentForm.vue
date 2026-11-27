<script setup>
import { computed, ref } from 'vue'
import BaseSelect from './BaseSelect.vue'
import { useStudentsStore } from './stores/students'
import { useCoursesStore } from './stores/courses'
import { useEnrollmentsStore } from './stores/enrollments'
const emit = defineEmits(['enrolled', 'error'])
const students = useStudentsStore(), courses = useCoursesStore(), enrollments = useEnrollmentsStore()
const studentId = ref(''), courseId = ref(''), submitting = ref(false), error = ref('')
const studentOptions = computed(() => students.students.map(s => ({ value: s.id, label: `${s.name} (${s.id})` })))
const courseOptions = computed(() => courses.courses.map(c => ({ value: c.courseId, label: `${c.courseId} - ${c.title}` })))
async function submit() {
  if (!studentId.value || !courseId.value) { error.value = 'Select a student and a course.'; return }
  submitting.value = true; error.value = ''
  try {
    await enrollments.enroll({ studentId: studentId.value, courseId: courseId.value })
    emit('enrolled', { student: students.students.find(s => s.id === studentId.value), course: courses.courses.find(c => c.courseId === courseId.value) })
  } catch (e) { emit('error', e.message) } finally { submitting.value = false }
}
</script>
<template><form class="card" @submit.prevent="submit"><h2>Enroll a Student</h2><BaseSelect v-model="studentId" label="Student" placeholder="Select a student" :options="studentOptions" /><BaseSelect v-model="courseId" label="Course" placeholder="Select a course" :options="courseOptions" /><p v-if="error" class="error-text" role="alert">{{ error }}</p><button :disabled="submitting">{{ submitting ? 'Enrolling...' : 'Enroll' }}</button></form></template>
