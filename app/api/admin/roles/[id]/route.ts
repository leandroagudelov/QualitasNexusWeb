import { NextRequest, NextResponse } from 'next/server';
import { apiConfig } from '@/lib/config/api';

const API_BASE = apiConfig.baseUrl;
const DEFAULT_TENANT = apiConfig.defaultTenant;

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const accessToken = req.cookies.get('access_token')?.value;
  const tenant = req.cookies.get('tenant')?.value || DEFAULT_TENANT;

  if (!accessToken) {
    return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
  }

  try {
    const { id } = params;

    const response = await fetch(`${API_BASE}/api/v1/identity/roles/${id}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
        tenant,
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch role: ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const accessToken = req.cookies.get('access_token')?.value;
  const tenant = req.cookies.get('tenant')?.value || DEFAULT_TENANT;

  if (!accessToken) {
    return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
  }

  try {
    const { id } = params;

    const response = await fetch(`${API_BASE}/api/v1/identity/roles/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
        tenant,
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to delete role: ${response.statusText}` },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true }, { status: 204 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
