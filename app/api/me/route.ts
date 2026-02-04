import { NextRequest, NextResponse } from 'next/server';
import { parseApiError } from '@/lib/api/profile';

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_API_BASE_URL || 'http://localhost:5030';
const DEFAULT_TENANT = process.env.NEXT_PUBLIC_BACKEND_TENANT || 'root';

/**
 * GET /api/me
 * Proxy to backend to fetch current user profile
 */
export async function GET(req: NextRequest) {
  const accessToken = req.cookies.get('access_token')?.value;
  const tenant = req.cookies.get('tenant')?.value || DEFAULT_TENANT;

  // Validate authentication
  if (!accessToken) {
    return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
  }

  try {
    const response = await fetch(`${API_BASE}/api/v1/identity/profile`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
        tenant,
      },
      cache: 'no-store',
    });

    // Handle non-ok responses
    if (!response.ok) {
      const errorText = await response.text();
      const errorMessage = parseApiError(response, errorText);
      return NextResponse.json(
        { message: 'Failed to fetch profile', details: errorMessage },
        { status: response.status }
      );
    }

    // Return user data
    const user = await response.json();
    return NextResponse.json(user);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { message: 'Backend connection error', details: message },
      { status: 502 }
    );
  }
}
