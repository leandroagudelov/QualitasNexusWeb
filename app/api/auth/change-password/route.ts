import { NextRequest, NextResponse } from 'next/server';
import { parseApiError } from '@/lib/api/profile';
import { apiConfig } from '@/lib/config/api';

const API_BASE = apiConfig.baseUrl;
const DEFAULT_TENANT = apiConfig.defaultTenant;

/**
 * POST /api/auth/change-password
 * Proxy to backend to change user password
 */
export async function POST(req: NextRequest) {
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
    const response = await fetch(`${API_BASE}/api/v1/identity/change-password`, {
      method: 'POST',
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
        { message: 'Failed to change password', details: errorMessage },
        { status: response.status }
      );
    }

    // Parse response (could be JSON or plain text)
    const responseText = await response.text();
    let result: any;
    try {
      result = JSON.parse(responseText);
    } catch {
      result = { message: responseText };
    }

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { message: 'Backend connection error', details: message },
      { status: 502 }
    );
  }
}
