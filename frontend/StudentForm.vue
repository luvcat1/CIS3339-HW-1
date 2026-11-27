<script setup>
import { ref } from 'vue'
import BaseInput from './BaseInput.vue'
import { useStudentsStore } from '../stores/students'
import { useFormValidation } from '../composables/useFormValidation'
import { studentRules } from '../utils/validators'

const emit = defineEmits(['added', 'error'])
const store = useStudentsStore()
const submitting = ref(false)
const { values, errors, validateField, validate, reset } = useFormValidation(
  { name: '', id: '', phone: '', zip: '' },
  studentRules,
)

async function onSubmit() {
  if (!validate()) return
  submitting.value = true
  try {
    const student = await store.addStudent({
      name: values.name.trim(),
      id: values.id.trim(),
      phone: values.phone.trim(),
      zip: values.zip.trim(),
    })
    reset()
    emit('added', student)
  } catch (error) {
    if (error.status === 409) errors.id = error.message // duplicate student ID
    else emit('error', error.message)
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <form class="card" novalidate @submit.prevent="onSubmit">
    <h2>Add a Student</h2>
    <BaseInput v-model="values.name" label="Name" :error="errors.name" @blur="validateField('name')" />
    <BaseInput v-model="values.id" label="Student ID" :error="errors.id" @blur="validateField('id')" />
    <BaseInput v-model="values.phone" label="Phone" :error="errors.phone" @blur="validateField('phone')" />
    <BaseInput v-model="values.zip" label="ZIP Code" :error="errors.zip" @blur="validateField('zip')" />
    <button type="submit" :disabled="submitting">{{ submitting ? 'Adding...' : 'Add Student' }}</button>
  </form>
</template>
