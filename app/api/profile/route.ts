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

  try {
    // Parse JSON request body
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

    // Check if we have an image with data as array
    if (payload.image && payload.image.data && Array.isArray(payload.image.data)) {
      // Convert image data array back to Buffer
      const uint8Array = new Uint8Array(payload.image.data);
      const blob = new Blob([uint8Array], { type: payload.image.contentType || 'image/png' });

      // Create FormData for multipart request
      const formData = new FormData();
      
      // Add text fields
      if (payload.firstName) formData.append('firstName', payload.firstName);
      if (payload.lastName) formData.append('lastName', payload.lastName);
      if (payload.email) formData.append('email', payload.email);
      if (payload.phoneNumber) formData.append('phoneNumber', payload.phoneNumber);
      if (payload.deleteCurrentImage !== undefined) {
        formData.append('deleteCurrentImage', String(payload.deleteCurrentImage));
      }
      
      // Add image as file
      formData.append('image', blob, payload.image.fileName || 'image.png');

      // Send FormData to backend
      const response = await fetch(`${API_BASE}/api/v1/identity/profile`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json',
          tenant,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        const errorMessage = parseApiError(response, errorText);
        return NextResponse.json(
          { message: 'Failed to update profile', details: errorMessage },
          { status: response.status }
        );
      }

      return NextResponse.json({ ok: true });
    }

    // Send as JSON to backend (no image)
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

    if (!response.ok) {
      const errorText = await response.text();
      const errorMessage = parseApiError(response, errorText);
      return NextResponse.json(
        { message: 'Failed to update profile', details: errorMessage },
        { status: response.status }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { message: 'Backend connection error', details: message },
      { status: 502 }
    );
  }
}
