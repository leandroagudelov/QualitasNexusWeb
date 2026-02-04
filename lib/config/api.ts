/**
 * Centralized API Configuration
 */

export const apiConfig = {
  baseUrl: process.env.NEXT_PUBLIC_BACKEND_API_BASE_URL || 'http://localhost:5030',
  defaultTenant: process.env.NEXT_PUBLIC_BACKEND_TENANT || 'root',
};

export const apiEndpoints = {
  // Identity
  profile: '/api/v1/identity/profile',
  changePassword: '/api/v1/identity/change-password',

  // Internal Next.js proxies
  me: '/api/me',
  updateProfile: '/api/profile',
  changePasswordProxy: '/api/auth/change-password',
};
