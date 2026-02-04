/**
 * Profile API Client
 * Handles all profile-related API calls with centralized error handling
 */

import { apiEndpoints } from '@/lib/config/api';
import { UserDto, UpdateProfileRequest, ChangePasswordRequest } from '@/types/profile';

/**
 * Parse API error response from backend
 * Handles both JSON and plain text responses
 */
export function parseApiError(response: Response, text: string): string {
  try {
    const json = JSON.parse(text);
    return json.message || json.details || text;
  } catch {
    return text || `Error: ${response.status} ${response.statusText}`;
  }
}

/**
 * Fetch current user profile
 */
export async function fetchCurrentProfile(): Promise<UserDto> {
  try {
    const response = await fetch(apiEndpoints.me, {
      cache: 'no-store',
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(parseApiError(response, text));
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`No se pudo cargar el perfil: ${error.message}`);
    }
    throw new Error('No se pudo cargar el perfil');
  }
}

/**
 * Update user profile
 */
export async function updateProfile(data: UpdateProfileRequest): Promise<void> {
  try {
    const response = await fetch(apiEndpoints.updateProfile, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(parseApiError(response, text));
    }
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`No se pudo actualizar el perfil: ${error.message}`);
    }
    throw new Error('No se pudo actualizar el perfil');
  }
}

/**
 * Change user password
 */
export async function changePassword(data: ChangePasswordRequest): Promise<void> {
  try {
    const response = await fetch(apiEndpoints.changePasswordProxy, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(parseApiError(response, text));
    }
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`No se pudo cambiar la contraseña: ${error.message}`);
    }
    throw new Error('No se pudo cambiar la contraseña');
  }
}
