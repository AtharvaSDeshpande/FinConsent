import bcrypt from 'bcryptjs';

export async function hashPassword(plainText) {
  return bcrypt.hash(plainText, 10);
}

export async function comparePassword(plainText, hash) {
  return bcrypt.compare(plainText, hash);
}

/**
 * Enterprise Password Complexity Policy Enforcement
 * Mandates:
 * - Minimum 8 characters in length
 * - At least one uppercase letter (A-Z)
 * - At least one lowercase letter (a-z)
 * - At least one numerical digit (0-9)
 * - At least one special symbol (!@#$%^&*...)
 */
export function validatePasswordStrength(password) {
  if (!password || typeof password !== 'string') {
    return { valid: false, error: 'Password is required' };
  }

  if (password.length < 8) {
    return {
      valid: false,
      error: 'Password must be at least 8 characters long',
    };
  }

  if (!/[A-Z]/.test(password)) {
    return {
      valid: false,
      error: 'Password must contain at least one uppercase letter (A-Z)',
    };
  }

  if (!/[a-z]/.test(password)) {
    return {
      valid: false,
      error: 'Password must contain at least one lowercase letter (a-z)',
    };
  }

  if (!/[0-9]/.test(password)) {
    return {
      valid: false,
      error: 'Password must contain at least one numeric digit (0-9)',
    };
  }

  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
    return {
      valid: false,
      error: 'Password must contain at least one special character (!@#$%^&* etc.)',
    };
  }

  return { valid: true };
}
