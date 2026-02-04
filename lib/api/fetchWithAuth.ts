/**
 * Fetch wrapper with automatic token refresh
 * Handles 401 responses by attempting to refresh the token and retrying the request
 * Automatically adds tenant header to all requests
 */

import {
  logTokenRefresh,
  logTokenExpired,
  logSessionExpired,
} from '@/lib/utils/securityLogger';
import {
  getTenant,
  getCookie,
  saveAuthTokens,
} from '@/lib/utils/apiConfig';

interface FetchWithAuthOptions extends RequestInit {
  skipAuthRefresh?: boolean;
}

/**
 * Add default headers to request (tenant, Content-Type if needed)
 */
function addDefaultHeaders(headers?: HeadersInit): Headers {
  const newHeaders = new Headers(headers || {});

  // Add tenant if not already present
  if (!newHeaders.has('tenant')) {
    newHeaders.set('tenant', getTenant());
  }

  // Add Content-Type for JSON if not FormData and no Content-Type set
  if (!newHeaders.has('Content-Type')) {
    newHeaders.set('Content-Type', 'application/json');
  }

  return newHeaders;
}

/**
 * Refresh tokens from backend
 */
async function refreshTokens(signal?: AbortSignal | null): Promise<boolean> {
  try {
    const accessToken = getCookie('access_token') || '';
    const refreshToken = getCookie('refresh_token') || '';

    const headers = addDefaultHeaders({
      'Content-Type': 'application/json',
    });

    const fetchOptions: RequestInit = {
      method: 'POST',
      headers,
      body: JSON.stringify({
        token: accessToken,
        refreshToken: refreshToken,
      }),
    };

    if (signal) {
      fetchOptions.signal = signal;
    }

    const refreshResponse = await fetch('/api/auth/refresh', fetchOptions);

    if (refreshResponse.ok) {
      const data = await refreshResponse.json();
      logTokenRefresh(true);

      // Save new tokens
      // Backend returns: { token, refreshToken, refreshTokenExpiryTime }
      // Frontend expects: { accessToken, refreshToken, accessTokenExpiresAt }
      saveAuthTokens({
        accessToken: data.token,
        refreshToken: data.refreshToken,
        accessTokenExpiresAt: data.refreshTokenExpiryTime,
        refreshTokenExpiresAt: data.refreshTokenExpiryTime,
      });

      return true;
    } else {
      logTokenRefresh(false, 'Token refresh failed');
      return false;
    }
  } catch (error) {
    logTokenRefresh(false, error instanceof Error ? error.message : 'Unknown error');
    return false;
  }
}

/**
 * Fetch wrapper that automatically refreshes tokens on 401 responses
 * Adds tenant header to all requests
 * @param url - The URL to fetch
 * @param options - Fetch options, including skipAuthRefresh to bypass token refresh logic
 * @returns Promise<Response>
 */
export async function fetchWithAuth(
  url: string,
  options: FetchWithAuthOptions = {}
): Promise<Response> {
  const { skipAuthRefresh = false, ...fetchOptions } = options;

  try {
    // Add default headers
    const headers = addDefaultHeaders(fetchOptions.headers);

    let response = await fetch(url, {
      ...fetchOptions,
      headers,
    });

    // If 401 and auth refresh is not disabled, attempt to refresh token
    if (response.status === 401 && !skipAuthRefresh) {
      logTokenExpired();

      const refreshSuccess = await refreshTokens(fetchOptions.signal);

      if (refreshSuccess) {
        // Retry the original request with new headers
        const retryHeaders = addDefaultHeaders(fetchOptions.headers);
        response = await fetch(url, {
          ...fetchOptions,
          headers: retryHeaders,
        });
      } else {
        logSessionExpired();

        // Redirect to login on failed refresh
        // Use setTimeout to allow current operations to complete
        if (typeof window !== 'undefined') {
          setTimeout(() => {
            window.location.href = '/auth/login?expired=true';
          }, 100);
        }
      }
    }

    return response;
  } catch (error) {
    // Re-throw to let caller handle network errors, etc.
    throw error;
  }
}

/**
 * Wrapper for fetchWithAuth that handles common response patterns
 * @param url - The URL to fetch
 * @param options - Fetch options
 * @returns Promise<T>
 */
export async function fetchWithAuthJSON<T = any>(
  url: string,
  options: FetchWithAuthOptions = {}
): Promise<T> {
  const response = await fetchWithAuth(url, options);

  if (!response.ok) {
    const text = await response.text();
    let errorMessage = `Error: ${response.status} ${response.statusText}`;

    try {
      const json = JSON.parse(text);
      errorMessage = json.message || json.details || errorMessage;
    } catch {
      errorMessage = text || errorMessage;
    }

    throw new Error(errorMessage);
  }

  return response.json();
}
