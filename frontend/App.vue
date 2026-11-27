<script setup>
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <header class="app-header">
    <h1>Student Enrollment</h1>
    <nav aria-label="Main">
      <RouterLink to="/students">Students</RouterLink>
      <RouterLink to="/courses">Courses</RouterLink>
      <RouterLink to="/enrollments">Enrollments</RouterLink>
      <RouterLink to="/roster">Course Roster</RouterLink>
    </nav>
  </header>
  <main class="container">
    <RouterView />
  </main>
</template>
