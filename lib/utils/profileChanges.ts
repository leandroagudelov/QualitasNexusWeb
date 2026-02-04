/**
 * Profile Changes Detector
 * Detects what fields have changed in user profile
 */

import { UserDto } from '@/types/profile';

export interface ProfileChanges {
  hasChanges: boolean;
  changedFields: string[];
  changes: {
    firstName?: boolean;
    lastName?: boolean;
    phoneNumber?: boolean;
    image?: boolean;
    deleteImage?: boolean;
  };
}

/**
 * Detect if profile has any changes
 */
export function detectProfileChanges(
  originalUser: UserDto | null,
  currentValues: {
    firstName: string;
    lastName: string;
    phoneNumber: string;
    imageFile: File | null;
    deleteCurrentImage: boolean;
  }
): ProfileChanges {
  const changes: ProfileChanges['changes'] = {};
  const changedFields: string[] = [];

  if (!originalUser) {
    return { hasChanges: false, changedFields: [], changes };
  }

  // Check firstName
  if (currentValues.firstName !== originalUser.firstName) {
    changes.firstName = true;
    changedFields.push('firstName');
  }

  // Check lastName
  if (currentValues.lastName !== originalUser.lastName) {
    changes.lastName = true;
    changedFields.push('lastName');
  }

  // Check phoneNumber
  if (currentValues.phoneNumber !== (originalUser.phoneNumber || '')) {
    changes.phoneNumber = true;
    changedFields.push('phoneNumber');
  }

  // Check image file
  if (currentValues.imageFile !== null) {
    changes.image = true;
    changedFields.push('image');
  }

  // Check delete image
  if (currentValues.deleteCurrentImage && originalUser.imageUrl) {
    changes.deleteImage = true;
    changedFields.push('deleteImage');
  }

  return {
    hasChanges: changedFields.length > 0,
    changedFields,
    changes,
  };
}

/**
 * Get human-readable description of changes
 */
export function getChangesSummary(changes: ProfileChanges): string {
  if (!changes.hasChanges) {
    return 'Sin cambios';
  }

  const descriptions: Record<string, string> = {
    firstName: 'nombre',
    lastName: 'apellido',
    phoneNumber: 'teléfono',
    image: 'foto de perfil',
    deleteImage: 'eliminación de foto',
  };

  const labels = changes.changedFields
    .map(field => descriptions[field] || field)
    .join(', ');

  return `Cambios: ${labels}`;
}
