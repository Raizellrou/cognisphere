/**
 * validation.js
 * ─────────────────────────────────────────────────────────────────────────────
 * WHY THIS EXISTS:
 *   Validation logic duplicated across LoginPage and RegisterPage means any
 *   rule change must be made in two places. One source of truth prevents drift.
 *   Also makes validation independently testable.
 *
 * PATTERN: Pure functions — no side effects, easy to unit test.
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ─── FIELD VALIDATORS ──────────────────────────────────────────────────────

/** Returns an error string if invalid, or null if valid. */
export function validateEmail(email) {
  if (!email.trim()) return 'Email is required.';
  // RFC 5322-ish — simple but catches the most common mistakes
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!re.test(email)) return 'Please enter a valid email address.';
  return null;
}

export function validatePassword(password) {
  if (!password) return 'Password is required.';
  if (password.length < 6) return 'Password must be at least 6 characters.';
  return null;
}

export function validatePasswordStrong(password) {
  const base = validatePassword(password);
  if (base) return base;
  if (password.length < 8) return 'Use at least 8 characters for a stronger password.';
  if (!/[A-Z]/.test(password)) return 'Include at least one uppercase letter.';
  if (!/[0-9]/.test(password)) return 'Include at least one number.';
  return null;
}

export function validateName(name) {
  if (!name.trim()) return 'Full name is required.';
  if (name.trim().length < 2) return 'Name must be at least 2 characters.';
  return null;
}

export function validateConfirmPassword(password, confirmPassword) {
  if (!confirmPassword) return 'Please confirm your password.';
  if (password !== confirmPassword) return 'Passwords do not match.';
  return null;
}

// ─── FORM-LEVEL VALIDATORS ──────────────────────────────────────────────────

/**
 * Validates the entire login form.
 * Returns an object: { email: string|null, password: string|null }
 * where non-null values are error messages.
 *
 * WHY object return (not array): Errors map 1:1 to fields,
 * making it trivial to show the right error under the right input.
 */
export function validateLoginForm({ email, password }) {
  return {
    email:    validateEmail(email),
    password: validatePassword(password),
  };
}

/**
 * Validates the entire registration form.
 * Returns { name, email, password, confirmPassword } errors object.
 */
export function validateRegisterForm({ name, email, password, confirmPassword }) {
  return {
    name:            validateName(name),
    email:           validateEmail(email),
    password:        validatePasswordStrong(password),
    confirmPassword: validateConfirmPassword(password, confirmPassword),
  };
}

/**
 * Returns true if an errors object has ANY non-null value.
 * Use this to check if a form is valid before submitting.
 *
 * Usage: if (hasErrors(errors)) return;
 */
export function hasErrors(errors) {
  return Object.values(errors).some(Boolean);
}

// ─── PASSWORD STRENGTH METER ────────────────────────────────────────────────

/**
 * Returns a strength score 0-4 and a label for the password strength indicator.
 * Shown on the registration form to guide users toward stronger passwords.
 */
export function getPasswordStrength(password) {
  if (!password) return { score: 0, label: '', color: '' };

  let score = 0;
  if (password.length >= 6)  score++;
  if (password.length >= 10) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const levels = [
    { label: '',          color: '' },
    { label: 'Weak',      color: '#ef4444' },
    { label: 'Fair',      color: '#f97316' },
    { label: 'Good',      color: '#eab308' },
    { label: 'Strong',    color: '#22c55e' },
    { label: 'Very strong', color: '#10b981' },
  ];

  return { score, ...levels[score] };
}