/**
 * Profile Validation Schemas
 */

import { VALIDATION, VALIDATION_MESSAGES } from '@/lib/constants/validation';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^\d{3}\s\d{3}\s\d{4}$/;

export const profileValidators = {
  email: (email: string): string | null => {
    if (!email) return null;
    if (!EMAIL_REGEX.test(email)) {
      return VALIDATION_MESSAGES.profile.email.invalid;
    }
    return null;
  },

  firstName: (value: string): string | null => {
    if (!value) return VALIDATION_MESSAGES.profile.firstName.required;
    if (value.length > VALIDATION.profile.maxFieldLength) {
      return VALIDATION_MESSAGES.profile.firstName.maxLength;
    }
    return null;
  },

  lastName: (value: string): string | null => {
    if (!value) return VALIDATION_MESSAGES.profile.lastName.required;
    if (value.length > VALIDATION.profile.maxFieldLength) {
      return VALIDATION_MESSAGES.profile.lastName.maxLength;
    }
    return null;
  },

  phoneNumber: (value: string): string | null => {
    if (!value) return null;
    if (!PHONE_REGEX.test(value)) {
      return VALIDATION_MESSAGES.profile.phoneNumber.invalid;
    }
    return null;
  },

  currentPassword: (value: string): string | null => {
    if (!value) return VALIDATION_MESSAGES.password.required;
    return null;
  },

  newPassword: (value: string): string | null => {
    if (!value) return VALIDATION_MESSAGES.password.required;
    if (value.length < VALIDATION.password.minLength) {
      return VALIDATION_MESSAGES.password.minLength;
    }
    return null;
  },

  confirmPassword: (newPassword: string, confirmPassword: string): string | null => {
    if (!confirmPassword) return 'Confirme la nueva contraseña';
    if (newPassword !== confirmPassword) {
      return VALIDATION_MESSAGES.password.mismatch;
    }
    return null;
  },

  passwordsMatch: (password: string, newPassword: string): string | null => {
    if (password === newPassword) {
      return VALIDATION_MESSAGES.password.sameAsOld;
    }
    return null;
  },

  imageFile: (file: File | null): string | null => {
    if (!file) return null;

    if (file.size > VALIDATION.image.maxSizeBytes) {
      return VALIDATION_MESSAGES.image.sizeTooLarge;
    }
    if (!VALIDATION.image.allowedTypes.includes(file.type as any)) {
      return VALIDATION_MESSAGES.image.invalidType;
    }
    return null;
  },
};

/**
 * Validate all profile fields
 */
export function validateProfileForm(data: {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  imageFile?: File | null;
  deleteImage?: boolean;
}): Record<string, string> {
  const errors: Record<string, string> = {};

  const firstNameError = profileValidators.firstName(data.firstName);
  if (firstNameError) errors.firstName = firstNameError;

  const lastNameError = profileValidators.lastName(data.lastName);
  if (lastNameError) errors.lastName = lastNameError;

  const emailError = profileValidators.email(data.email);
  if (emailError) errors.email = emailError;

  const phoneError = profileValidators.phoneNumber(data.phoneNumber);
  if (phoneError) errors.phoneNumber = phoneError;

  if (data.imageFile) {
    const imageError = profileValidators.imageFile(data.imageFile);
    if (imageError) errors.image = imageError;
  }

  if (data.deleteImage && data.imageFile) {
    errors.image = VALIDATION_MESSAGES.image.cannotUploadAndDelete;
  }

  return errors;
}

/**
 * Validate password change form
 */
export function validatePasswordForm(data: {
  password: string;
  newPassword: string;
  confirmNewPassword: string;
}): Record<string, string> {
  const errors: Record<string, string> = {};

  const currentError = profileValidators.currentPassword(data.password);
  if (currentError) errors.password = currentError;

  const newPassError = profileValidators.newPassword(data.newPassword);
  if (newPassError) errors.newPassword = newPassError;

  const matchError = profileValidators.passwordsMatch(data.password, data.newPassword);
  if (matchError) errors.newPassword = matchError;

  const confirmError = profileValidators.confirmPassword(data.newPassword, data.confirmNewPassword);
  if (confirmError) errors.confirmNewPassword = confirmError;

  return errors;
}
