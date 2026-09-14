/**
 * PRISM Authentication Validation Utilities
 */

export interface ValidationResult {
  isValid: boolean
  errors: Record<string, string>
}

export function validateEmail(email: string): string | null {
  if (!email || !email.trim()) {
    return 'Email is required'
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email.trim())) {
    return 'Please enter a valid email address'
  }
  return null
}

export function validatePassword(password: string): string | null {
  if (!password) {
    return 'Password is required'
  }
  if (password.length < 6) {
    return 'Password must be at least 6 characters long'
  }
  return null
}

export function validateSignupInput(data: {
  name: string
  email: string
  password: string
  confirmPassword: string
}): ValidationResult {
  const errors: Record<string, string> = {}

  if (!data.name || !data.name.trim()) {
    errors.name = 'Full name is required'
  }

  const emailError = validateEmail(data.email)
  if (emailError) {
    errors.email = emailError
  }

  const passwordError = validatePassword(data.password)
  if (passwordError) {
    errors.password = passwordError
  }

  if (data.password !== data.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}

export function validateLoginInput(data: { email: string; password: string }): ValidationResult {
  const errors: Record<string, string> = {}

  const emailError = validateEmail(data.email)
  if (emailError) {
    errors.email = emailError
  }

  if (!data.password) {
    errors.password = 'Password is required'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}
