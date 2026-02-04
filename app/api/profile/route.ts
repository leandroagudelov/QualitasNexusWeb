import { NextRequest, NextResponse } from 'next/server';
import { parseApiError } from '@/lib/api/profile';

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_API_BASE_URL || 'http://localhost:5030';
const DEFAULT_TENANT = process.env.NEXT_PUBLIC_BACKEND_TENANT || 'root';

/**
 * PUT /api/profile
 * Proxy to backend to update current user profile
 */
export async function PUT(req: NextRequest) {
  const accessToken = req.cookies.get('access_token')?.value;
  const tenant = req.cookies.get('tenant')?.value || DEFAULT_TENANT;

  // Validate authentication
  if (!accessToken) {
    return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
  }

  // Parse request body
  let payload: any;
  try {
    payload = await req.json();
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid JSON';
    return NextResponse.json(
      { message: 'Invalid request body', details: message },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(`${API_BASE}/api/v1/identity/profile`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
        tenant,
      },
      body: JSON.stringify(payload),
    });

    // Handle non-ok responses
    if (!response.ok) {
      const errorText = await response.text();
      const errorMessage = parseApiError(response, errorText);
      return NextResponse.json(
        { message: 'Failed to update profile', details: errorMessage },
        { status: response.status }
      );
    }

    // Backend returns empty response on success
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { message: 'Backend connection error', details: message },
      { status: 502 }
    );
  }
}
