<script setup>
import { useId } from 'vue'

defineProps({
  label: { type: String, required: true },
  type: { type: String, default: 'text' },
  error: { type: String, default: '' },
})
const model = defineModel({ type: [String, Number], default: '' })
const emit = defineEmits(['blur'])
const id = useId()
</script>

<template>
  <div class="field" :class="{ 'has-error': error }">
    <label :for="id">{{ label }}</label>
    <input
      :id="id"
      v-model="model"
      :type="type"
      :aria-invalid="!!error"
      :aria-describedby="error ? `${id}-error` : undefined"
      @blur="emit('blur')"
    />
    <p v-if="error" :id="`${id}-error`" class="error-text">{{ error }}</p>
  </div>
</template>
