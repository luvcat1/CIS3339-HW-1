<script setup>
import { useId } from 'vue'
defineProps({ label: String, placeholder: String, options: { type: Array, default: () => [] }, error: { type: String, default: '' } })
const model = defineModel({ type: String, default: '' })
const id = useId()
</script>
<template><div class="field" :class="{ 'has-error': error }"><label :for="id">{{ label }}</label><select :id="id" v-model="model" :aria-invalid="!!error" :aria-describedby="error ? `${id}-error` : undefined"><option value="">{{ placeholder }}</option><option v-for="option in options" :key="option.value" :value="option.value">{{ option.label }}</option></select><p v-if="error" :id="`${id}-error`" class="error-text">{{ error }}</p></div></template>
