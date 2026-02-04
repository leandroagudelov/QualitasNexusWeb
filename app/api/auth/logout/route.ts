import { NextResponse } from 'next/server';

export async function POST() {
  const secure = process.env.NODE_ENV === 'production';
  const res = NextResponse.json({ ok: true });
  const past = new Date(0);
  res.cookies.set('access_token', '', { httpOnly: true, secure, sameSite: 'lax', path: '/', expires: past });
  res.cookies.set('refresh_token', '', { httpOnly: true, secure, sameSite: 'lax', path: '/', expires: past });
  res.cookies.set('access_expires_at', '', { httpOnly: false, secure, sameSite: 'lax', path: '/', expires: past });
  res.cookies.set('refresh_expires_at', '', { httpOnly: false, secure, sameSite: 'lax', path: '/', expires: past });
  return res;
}
