<script setup>
import { ref } from 'vue'
import BaseInput from './BaseInput.vue'
import { useCoursesStore } from '../stores/courses'
import { useFormValidation } from '../composables/useFormValidation'
import { courseRules } from '../utils/validators'

const emit = defineEmits(['added', 'error'])
const store = useCoursesStore()
const submitting = ref(false)
const { values, errors, validateField, validate, reset } = useFormValidation(
  { courseId: '', title: '' },
  courseRules,
)

async function onSubmit() {
  if (!validate()) return
  submitting.value = true
  try {
    const course = await store.addCourse({
      courseId: values.courseId.trim(),
      title: values.title.trim(),
    })
    reset()
    emit('added', course)
  } catch (error) {
    if (error.status === 409) errors.courseId = error.message // duplicate course ID
    else emit('error', error.message)
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <form class="card" novalidate @submit.prevent="onSubmit">
    <h2>Add a Course</h2>
    <BaseInput v-model="values.courseId" label="Course ID" :error="errors.courseId" @blur="validateField('courseId')" />
    <BaseInput v-model="values.title" label="Course Name" :error="errors.title" @blur="validateField('title')" />
    <button type="submit" :disabled="submitting">{{ submitting ? 'Adding...' : 'Add Course' }}</button>
  </form>
</template>
