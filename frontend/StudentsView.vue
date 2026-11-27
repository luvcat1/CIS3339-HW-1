<script setup>
import { computed, onMounted, ref } from 'vue'
import DataTable from '../components/DataTable.vue'
import AlertMessage from '../components/AlertMessage.vue'
import SearchBar from '../components/SearchBar.vue'
import StudentForm from '../components/StudentForm.vue'
import { useStudentsStore } from '../stores/students'

const store = useStudentsStore()
const message = ref(null)
const searchName = ref('')
const searchResult = ref(null) // null = show every student

const columns = [
  { key: 'name', label: 'Name' },
  { key: 'id', label: 'Student ID' },
  { key: 'phone', label: 'Phone' },
  { key: 'zip', label: 'ZIP Code' },
]
const rows = computed(() => (searchResult.value ? [searchResult.value] : store.students))

const notify = (type, text) => (message.value = { type, text })

onMounted(async () => {
  try {
    await store.fetchStudents()
  } catch (error) {
    notify('error', error.message)
  }
})

async function search() {
  const name = searchName.value.trim()
  if (!name) return notify('error', 'Enter a student name to search.')
  try {
    searchResult.value = await store.findStudentByName(name)
    message.value = null
  } catch (error) {
    searchResult.value = null
    notify('error', error.status === 404 ? 'Cannot find the student.' : error.message)
  }
}

function clearSearch() {
  searchName.value = ''
  searchResult.value = null
  message.value = null
}

async function remove(student) {
  if (!confirm(`Delete student ${student.name}? Their enrollments will also be removed.`)) return
  try {
    await store.deleteStudent(student.id)
    if (searchResult.value?.id === student.id) searchResult.value = null
    notify('success', `Deleted ${student.name}.`)
  } catch (error) {
    notify('error', error.message)
  }
}
</script>

<template>
  <section>
    <h1>Students</h1>
    <AlertMessage v-if="message" :type="message.type">{{ message.text }}</AlertMessage>

    <div class="grid">
      <div class="card">
        <h2>Search for a Student</h2>
        <SearchBar v-model="searchName" label="Student Name" @search="search" @clear="clearSearch" />
      </div>
      <StudentForm @added="(s) => notify('success', `Added ${s.name}.`)" @error="(m) => notify('error', m)" />
    </div>

    <h2>{{ searchResult ? 'Search Result' : 'All Students' }}</h2>
    <DataTable :columns="columns" :rows="rows" row-key="id" :loading="store.loading" empty-text="No students yet.">
      <template #actions="{ row }">
        <button type="button" class="danger" @click="remove(row)">Delete</button>
      </template>
    </DataTable>
  </section>
</template>
