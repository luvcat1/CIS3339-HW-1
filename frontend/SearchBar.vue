<script setup>
import BaseInput from './BaseInput.vue'

defineProps({ label: { type: String, default: 'Search' } })
const model = defineModel({ type: String, default: '' })
const emit = defineEmits(['search', 'clear'])
</script>

<template>
  <form class="inline-form" novalidate @submit.prevent="emit('search')">
    <BaseInput v-model="model" :label="label" />
    <button type="submit">Search</button>
    <button type="button" class="secondary" @click="emit('clear')">Clear</button>
  </form>
</template>
