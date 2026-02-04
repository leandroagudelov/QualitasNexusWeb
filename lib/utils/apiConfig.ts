/**
 * API Configuration Utilities
 * Helpers for managing API interactions with backend
 */

/**
 * Get tenant from localStorage or session
 */
export function getTenant(): string {
  if (typeof window === 'undefined') {
    return 'root';
  }
  return localStorage.getItem('tenant') || sessionStorage.getItem('tenant') || 'root';
}

/**
 * Set tenant in localStorage
 */
export function setTenant(tenant: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('tenant', tenant);
  }
}

/**
 * Get cookie by name
 */
export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') {
    return null;
  }

  const match = document.cookie.match(new RegExp(`(^|;\\s*)${name}=([^;]*)`));
  return match ? decodeURIComponent(match[2]) : null;
}

/**
 * Set HTTP-only cookie (note: HttpOnly cookies can only be set from server)
 * This sets regular cookies for demonstration - in production, server should set HttpOnly
 */
export function setCookie(
  name: string,
  value: string,
  options?: {
    days?: number;
    path?: string;
    secure?: boolean;
    sameSite?: 'Strict' | 'Lax' | 'None';
  }
): void {
  if (typeof document === 'undefined') {
    return;
  }

  const {
    days = 7,
    path = '/',
    secure = typeof window !== 'undefined' && window.location.protocol === 'https:',
    sameSite = 'Lax',
  } = options || {};

  let cookieString = `${name}=${encodeURIComponent(value)}`;
  cookieString += `; path=${path}`;
  cookieString += `; SameSite=${sameSite}`;

  if (days) {
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    cookieString += `; expires=${expires.toUTCString()}`;
  }

  if (secure) {
    cookieString += '; Secure';
  }

  document.cookie = cookieString;
}

/**
 * Delete cookie
 */
export function deleteCookie(name: string): void {
  setCookie(name, '', { days: -1 });
}

/**
 * Get all auth tokens from cookies
 */
export interface AuthTokens {
  accessToken: string | null;
  refreshToken: string | null;
  accessTokenExpiresAt: string | null;
  refreshTokenExpiresAt: string | null;
}

export function getAuthTokens(): AuthTokens {
  return {
    accessToken: getCookie('access_token'),
    refreshToken: getCookie('refresh_token'),
    accessTokenExpiresAt: getCookie('access_expires_at'),
    refreshTokenExpiresAt: getCookie('refresh_expires_at'),
  };
}

/**
 * Save auth tokens to cookies
 */
export function saveAuthTokens(tokens: {
  accessToken?: string;
  refreshToken?: string;
  accessTokenExpiresAt?: string;
  refreshTokenExpiresAt?: string;
}): void {
  if (tokens.accessToken) {
    setCookie('access_token', tokens.accessToken, { days: 1 });
  }
  if (tokens.refreshToken) {
    setCookie('refresh_token', tokens.refreshToken, { days: 7 });
  }
  if (tokens.accessTokenExpiresAt) {
    setCookie('access_expires_at', tokens.accessTokenExpiresAt);
  }
  if (tokens.refreshTokenExpiresAt) {
    setCookie('refresh_expires_at', tokens.refreshTokenExpiresAt);
  }
}

/**
 * Clear all auth tokens
 */
export function clearAuthTokens(): void {
  deleteCookie('access_token');
  deleteCookie('refresh_token');
  deleteCookie('access_expires_at');
  deleteCookie('refresh_expires_at');
}

/**
 * Check if access token is expired
 */
export function isAccessTokenExpired(): boolean {
  const expiresAt = getCookie('access_expires_at');
  if (!expiresAt) {
    return true;
  }

  try {
    const expireDate = new Date(expiresAt);
    return new Date() > expireDate;
  } catch {
    return true;
  }
}

/**
 * Check if tokens exist and are valid
 */
export function hasValidTokens(): boolean {
  const { accessToken, refreshToken } = getAuthTokens();
  return !!(accessToken && refreshToken && !isAccessTokenExpired());
}
