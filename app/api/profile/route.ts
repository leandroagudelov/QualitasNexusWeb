import { NextRequest, NextResponse } from 'next/server';
import { parseApiError } from '@/lib/api/profile';
import { apiConfig } from '@/lib/config/api';

const API_BASE = apiConfig.baseUrl;
const DEFAULT_TENANT = apiConfig.defaultTenant;

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

  try {
    // Parse JSON request body
    let payload: any;
    try {
      payload = await req.json();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Invalid JSON';
      console.error('[PUT /api/profile] JSON parse error:', message);
      return NextResponse.json(
        { message: 'Invalid request body', details: message },
        { status: 400 }
      );
    }

    console.log('[PUT /api/profile] Payload:', JSON.stringify(payload).substring(0, 200));
    console.log('[PUT /api/profile] Backend URL:', `${API_BASE}/api/v1/identity/profile`);
    console.log('[PUT /api/profile] Tenant:', tenant);

    // Send JSON directly to backend
    // Backend expects: { firstName, lastName, email, phoneNumber, deleteCurrentImage, image? }
    // where image = { fileName, contentType, data: number[] }
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

    console.log('[PUT /api/profile] Backend response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[PUT /api/profile] Backend error:', errorText.substring(0, 200));
      const errorMessage = parseApiError(response, errorText);
      return NextResponse.json(
        { message: 'Failed to update profile', details: errorMessage },
        { status: response.status }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    const stack = error instanceof Error ? error.stack : '';
    console.error('[PUT /api/profile] Catch error:', message);
    console.error('[PUT /api/profile] Stack:', stack);
    return NextResponse.json(
      { message: 'Backend connection error', details: message },
      { status: 502 }
    );
  }
}
