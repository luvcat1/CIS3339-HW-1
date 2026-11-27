import { reactive } from 'vue'
export function useFormValidation(initial, rules) {
  const values = reactive({ ...initial }), errors = reactive({})
  function validateField(key) { errors[key] = rules[key](values[key]); return !errors[key] }
  function validate() { return Object.keys(rules).map(validateField).every(Boolean) }
  function reset() { Object.assign(values, initial); Object.keys(errors).forEach(key => delete errors[key]) }
  return { values, errors, validateField, validate, reset }
}
