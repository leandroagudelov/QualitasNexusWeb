import { NextRequest, NextResponse } from 'next/server';

// Fallback to local dev backend if env var missing
const API_BASE = process.env.BACKEND_API_BASE_URL || 'http://localhost:5030';
const DEFAULT_TENANT = process.env.BACKEND_TENANT || 'root';

export async function POST(req: NextRequest) {

  const cookiesStore = req.cookies;
  const accessToken = cookiesStore.get('access_token')?.value;
  const refreshToken = cookiesStore.get('refresh_token')?.value;
  const tenant = cookiesStore.get('tenant')?.value || DEFAULT_TENANT;

  if (!accessToken || !refreshToken) {
    return NextResponse.json({ message: 'No tokens present' }, { status: 401 });
  }

  try {
    const res = await fetch(`${API_BASE}/api/v1/identity/token/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': '*/*',
        tenant,
      },
      body: JSON.stringify({ token: accessToken, refreshToken }),
      cache: 'no-store',
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json({ message: 'Refresh failed', details: text }, { status: 401 });
    }

    const data = (await res.json()) as {
      token: string;
      refreshToken: string;
      refreshTokenExpiryTime: string | Date;
      Token?: string;
      RefreshToken?: string;
      RefreshTokenExpiryTime?: string | Date;
    };

    const newAccessToken = (data as any).token || (data as any).Token;
    const newRefreshToken = (data as any).refreshToken || (data as any).RefreshToken;
    const refreshExpRaw = (data as any).refreshTokenExpiryTime || (data as any).RefreshTokenExpiryTime;
    const accessExp = new Date(Date.now() + 1000 * 60 * 14); // assume ~14m lifespan unless provided
    const refreshExp = new Date(refreshExpRaw);

    const resNext = NextResponse.json({ ok: true });
    const secure = process.env.NODE_ENV === 'production';
    resNext.cookies.set('access_token', newAccessToken, { httpOnly: true, secure, sameSite: 'lax', path: '/', expires: accessExp });
    resNext.cookies.set('refresh_token', newRefreshToken, { httpOnly: true, secure, sameSite: 'lax', path: '/', expires: refreshExp });
    resNext.cookies.set('access_expires_at', accessExp.toISOString(), { httpOnly: false, secure, sameSite: 'lax', path: '/', expires: accessExp });
    resNext.cookies.set('refresh_expires_at', refreshExp.toISOString(), { httpOnly: false, secure, sameSite: 'lax', path: '/', expires: refreshExp });
    return resNext;
  } catch (e: any) {
    const hint = `Check BACKEND_API_BASE_URL (${API_BASE}) and backend availability.`;
    return NextResponse.json({ message: 'Refresh error', error: String(e), hint }, { status: 502 });
  }
}
