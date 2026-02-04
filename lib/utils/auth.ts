import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

/**
 * Logout user and redirect to login page
 * Handles cookie cleanup and navigation
 */
export async function logoutAndRedirect(router: AppRouterInstance): Promise<void> {
  try {
    await fetch('/api/auth/logout', { method: 'POST' });
  } catch {
    // Ignore logout errors, still redirect
  }
  router.push('/auth/login');
}

/**
 * Cookie utilities for client-side cookie handling
 */

/**
 * Get cookie value by name
 * Safe handling for special characters in cookie names
 */
export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;

  try {
    // Escape special regex characters in cookie name
    const escapedName = name.replace(/([.$?*|{}()\[\]\\/+^])/g, '\\$1');
    const match = document.cookie.match(
      new RegExp('(^|; )' + escapedName + '=([^;]*)')
    );
    return match ? decodeURIComponent(match[2]) : null;
  } catch {
    return null;
  }
}

/**
 * Get all cookies as object
 */
export function getAllCookies(): Record<string, string> {
  if (typeof document === 'undefined') return {};

  const cookies: Record<string, string> = {};
  document.cookie.split('; ').forEach((cookie) => {
    const [name, value] = cookie.split('=');
    if (name && value) {
      cookies[decodeURIComponent(name)] = decodeURIComponent(value);
    }
  });
  return cookies;
}

/**
 * Set cookie with options
 */
export interface CookieOptions {
  maxAge?: number; // seconds
  path?: string;
  domain?: string;
  secure?: boolean;
  sameSite?: 'Strict' | 'Lax' | 'None';
}

export function setCookie(
  name: string,
  value: string,
  options: CookieOptions = {}
): void {
  if (typeof document === 'undefined') return;

  const {
    maxAge,
    path = '/',
    domain,
    secure = false,
    sameSite = 'Lax',
  } = options;

  let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;

  if (maxAge !== undefined) {
    cookieString += `; max-age=${maxAge}`;
  }

  if (path) {
    cookieString += `; path=${path}`;
  }

  if (domain) {
    cookieString += `; domain=${domain}`;
  }

  if (secure) {
    cookieString += '; secure';
  }

  cookieString += `; samesite=${sameSite}`;

  document.cookie = cookieString;
}

/**
 * Delete cookie by name
 */
export function deleteCookie(name: string): void {
  setCookie(name, '', { maxAge: 0 });
}
