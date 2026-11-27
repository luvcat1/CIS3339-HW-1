// Each validator returns an error message, or '' when the value is valid.
const text = (v) => String(v ?? '').trim()

export const required = (label) => (v) => (text(v) ? '' : `${label} is required`)
export const requiredChoice = (label) => (v) => (text(v) ? '' : `Please select a ${label}`)

export const studentRules = {
  name: required('Name'),
  id: required('Student ID'),
  phone: required('Phone'),
  zip: required('ZIP code'),
}

export const courseRules = {
  courseId: required('Course ID'),
  title: required('Course name'), // stored as "title" by the backend
}

export const enrollmentRules = {
  studentId: requiredChoice('student'),
  courseId: requiredChoice('course'),
}
