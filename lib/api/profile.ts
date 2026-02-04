/**
 * Profile API Client
 * Handles all profile-related API calls with centralized error handling
 */

import { apiEndpoints } from '@/lib/config/api';
import { UserDto, UpdateProfileRequest, ChangePasswordRequest } from '@/types/profile';
import { fetchWithAuth } from '@/lib/api/fetchWithAuth';

/**
 * Parse API error response from backend
 * Handles both JSON and plain text responses with user-friendly messages
 */
export function parseApiError(response: Response, text: string): string {
  // Try to parse JSON error response
  try {
    const json = JSON.parse(text);
    return json.message || json.details || text;
  } catch {
    // Fallback to plain text or status
  }

  // Map status codes to user-friendly messages
  const statusMessages: Record<number, string> = {
    400: 'Datos inválidos. Por favor verifica tu información.',
    401: 'No autorizado. Tu sesión puede haber expirado.',
    403: 'No tienes permiso para realizar esta acción.',
    404: 'El recurso no fue encontrado.',
    409: 'Conflicto. Quizás alguien más editó esto recientemente.',
    500: 'Error del servidor. Por favor intenta más tarde.',
    503: 'El servicio no está disponible. Intenta más tarde.',
  };

  const statusMessage = statusMessages[response.status];
  if (statusMessage) {
    return statusMessage;
  }

  // Fallback to text or generic message
  return text || `Error: ${response.status} ${response.statusText}`;
}

/**
 * Fetch current user profile
 */
export async function fetchCurrentProfile(): Promise<UserDto> {
  try {
    // Add cache-busting timestamp and headers to ensure fresh data
    const timestamp = Date.now();
    const url = `${apiEndpoints.me}?t=${timestamp}`;

    console.log('[PROFILE] Fetching current profile from:', url);

    const response = await fetchWithAuth(url, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
      },
    });

    if (!response.ok) {
      const text = await response.text();
      console.error('[PROFILE] Response not OK:', response.status, text.substring(0, 200));
      throw new Error(parseApiError(response, text));
    }

    const user = await response.json();
    console.log('[PROFILE] Fetched user data:', {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      imageUrl: user.imageUrl ? 'present' : 'missing',
    });

    // Validate that we have required fields
    if (!user.id || !user.email) {
      console.warn('[PROFILE] Warning: User data missing critical fields', { id: user.id, email: user.email });
    }

    // Add cache-busting parameter to image URL to force fresh image load
    if (user.imageUrl) {
      const separator = user.imageUrl.includes('?') ? '&' : '?';
      user.imageUrl = `${user.imageUrl}${separator}t=${Date.now()}`;
    }

    return user;
  } catch (error) {
    if (error instanceof Error) {
      console.error('[PROFILE] Error loading profile:', error.message);
      throw new Error(`No se pudo cargar el perfil: ${error.message}`);
    }
    throw new Error('No se pudo cargar el perfil');
  }
}

/**
 * Update user profile
 * Sends image as JSON with byte array (not FormData)
 */
export async function updateProfile(data: UpdateProfileRequest): Promise<void> {
  try {
    const payload: any = {
      firstName: data.firstName,
      lastName: data.lastName,
      phoneNumber: data.phoneNumber,
      deleteCurrentImage: data.deleteCurrentImage,
      // Note: email is not sent to backend (read-only/managed separately)
    };

    // Convert image to bytes if it's a File object
    if (data.image instanceof File) {
      const arrayBuffer = await data.image.arrayBuffer();
      const uint8 = new Uint8Array(arrayBuffer);

      payload.image = {
        fileName: data.image.name,
        contentType: data.image.type || 'application/octet-stream',
        data: Array.from(uint8),  // Convert to array of numbers
      };
    } else if (data.image && typeof data.image === 'object' && 'fileName' in data.image) {
      // Already FileUploadRequest, use as-is
      payload.image = data.image;
    }
    // Note: DO NOT include image field at all when no image provided
    // (backend tries to access image.Data without null-check)

    const response = await fetchWithAuth(apiEndpoints.updateProfile, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
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
    const response = await fetchWithAuth(apiEndpoints.changePasswordProxy, {
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
