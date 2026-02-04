import { NextRequest, NextResponse } from 'next/server';

// Fallback to local dev backend if env var missing
const API_BASE = process.env.BACKEND_API_BASE_URL || 'http://localhost:5030';
const DEFAULT_TENANT = process.env.BACKEND_TENANT || 'root';

export async function POST(req: NextRequest) {

  const { email, password, tenant } = await req.json().catch(() => ({} as any));
  if (!email || !password) {
    return NextResponse.json({ message: 'Email and password are required' }, { status: 400 });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const res = await fetch(`${API_BASE}/api/v1/identity/token/issue`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': '*/*',
        tenant: tenant || DEFAULT_TENANT,
      },
      body: JSON.stringify({ email, password }),
      signal: controller.signal,
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json({ message: 'Invalid credentials', details: text }, { status: 401 });
    }

    const data = (await res.json()) as {
      accessToken: string; // casing may differ; normalize below
      refreshToken: string;
      refreshTokenExpiresAt: string | Date;
      accessTokenExpiresAt: string | Date;
      AccessToken?: string;
      RefreshToken?: string;
      RefreshTokenExpiresAt?: string | Date;
      AccessTokenExpiresAt?: string | Date;
    };

    // Handle record casing from C# (by default it serializes as camelCase in ASP.NET by default)
    const accessToken = (data as any).accessToken || (data as any).AccessToken;
    const refreshToken = (data as any).refreshToken || (data as any).RefreshToken;
    const accessExpRaw = (data as any).accessTokenExpiresAt || (data as any).AccessTokenExpiresAt;
    const refreshExpRaw = (data as any).refreshTokenExpiresAt || (data as any).RefreshTokenExpiresAt;

    if (!accessToken || !refreshToken) {
      return NextResponse.json({ message: 'Token response missing' }, { status: 502 });
    }

    const accessExp = new Date(accessExpRaw);
    const refreshExp = new Date(refreshExpRaw);

    const resNext = NextResponse.json({ ok: true });
    const secure = process.env.NODE_ENV === 'production';
    // HttpOnly cookies for security
    resNext.cookies.set('access_token', accessToken, {
      httpOnly: true,
      secure,
      sameSite: 'lax',
      path: '/',
      expires: accessExp,
    });
    resNext.cookies.set('refresh_token', refreshToken, {
      httpOnly: true,
      secure,
      sameSite: 'lax',
      path: '/',
      expires: refreshExp,
    });
    // also store expiry helpers (non-HttpOnly ok) if needed client-side
    resNext.cookies.set('access_expires_at', accessExp.toISOString(), { httpOnly: false, secure, sameSite: 'lax', path: '/', expires: accessExp });
    resNext.cookies.set('refresh_expires_at', refreshExp.toISOString(), { httpOnly: false, secure, sameSite: 'lax', path: '/', expires: refreshExp });
    // persist selected tenant for subsequent refresh/profile calls
    const tenantValue = tenant || DEFAULT_TENANT;
    resNext.cookies.set('tenant', tenantValue, { httpOnly: false, secure, sameSite: 'lax', path: '/', expires: refreshExp });
    return resNext;
  } catch (e: any) {
    if (e?.name === 'AbortError') {
      return NextResponse.json({ message: 'Auth request timed out' }, { status: 504 });
    }
    // Provide clearer diagnostics for connection issues
    const hint = `Check BACKEND_API_BASE_URL (${API_BASE}) and backend availability.`;
    return NextResponse.json({ message: 'Auth error', error: String(e), hint }, { status: 502 });
  } finally {
    clearTimeout(timeout);
  }
}
