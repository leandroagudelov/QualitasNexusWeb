/**
 * Validation Constants
 * Centralized configuration for form validation rules
 */

export const VALIDATION = {
  // Password constraints
  password: {
    minLength: 8,
  },

  // Profile field lengths
  profile: {
    maxFieldLength: 50,
    firstNameMinLength: 1,
    lastNameMinLength: 1,
  },

  // Image upload constraints
  image: {
    maxSizeMB: 2,
    maxSizeBytes: 2 * 1024 * 1024,
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp', '.gif'],
  },

  // API request timeouts (in milliseconds)
  apiTimeouts: {
    auth: 15000, // 15 seconds for auth operations
    default: 10000, // 10 seconds for other operations
  },

  // Token expiry times (in seconds)
  tokenExpiry: {
    accessToken: 14 * 60, // 14 minutes
    refreshToken: 7 * 24 * 60 * 60, // 7 days
  },

  // Refresh schedule (in milliseconds)
  refreshSchedule: {
    checkInterval: 60 * 1000, // Check every 60 seconds
    scheduleOffset: 500, // Schedule refresh 500ms before expiry
    minRefreshTime: 60 * 1000, // Wait at least 60 seconds between refreshes
  },
} as const;

/**
 * Get human-readable error messages for validation
 */
export const VALIDATION_MESSAGES = {
  password: {
    required: 'La contraseña es requerida',
    minLength: `Mínimo ${VALIDATION.password.minLength} caracteres`,
    mismatch: 'Las contraseñas no coinciden',
    sameAsOld: 'La nueva contraseña debe ser diferente a la actual',
  },

  profile: {
    firstName: {
      required: 'El nombre es requerido',
      maxLength: `El nombre no puede exceder ${VALIDATION.profile.maxFieldLength} caracteres`,
    },
    lastName: {
      required: 'El apellido es requerido',
      maxLength: `El apellido no puede exceder ${VALIDATION.profile.maxFieldLength} caracteres`,
    },
    email: {
      invalid: 'Email inválido. Use formato: ejemplo@dominio.com',
      protected: 'El email no se puede cambiar por seguridad',
    },
    phoneNumber: {
      invalid: 'Formato: 000 000 0000',
    },
  },

  image: {
    required: 'Selecciona una imagen',
    sizeTooLarge: `La imagen no puede exceder ${VALIDATION.image.maxSizeMB}MB`,
    invalidType: `Formatos permitidos: ${VALIDATION.image.allowedTypes.join(', ')}`,
    cannotUploadAndDelete: 'No puede eliminar y subir imagen al mismo tiempo',
  },
} as const;
