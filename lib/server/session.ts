/* Server-only session cookie: HMAC-signed, not encrypted. Good enough to prove
   the OAuth pipe end-to-end; swap for a real session store (Redis, a DB row)
   before this holds a live user's refresh token. */
import { createHmac, timingSafeEqual } from 'crypto';
import { env } from './env';

const COOKIE = 'limbu_session';

function sign(payload: string): string {
  return createHmac('sha256', env.sessionSecret()).update(payload).digest('base64url');
}

export function serializeSession(data: Record<string, unknown>): string {
  const payload = Buffer.from(JSON.stringify(data)).toString('base64url');
  return `${payload}.${sign(payload)}`;
}

export function readSession<T = Record<string, unknown>>(req: Request): T | null {
  const cookie = req.headers.get('cookie') ?? '';
  const match = cookie.match(new RegExp(`${COOKIE}=([^;]+)`));
  if (!match) return null;

  const [payload, sig] = match[1].split('.');
  if (!payload || !sig) return null;

  const expected = sign(payload);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  try {
    return JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as T;
  } catch {
    return null;
  }
}

export function sessionCookieHeader(value: string | null, maxAgeSeconds = 60 * 60 * 24 * 30): string {
  if (value === null) {
    return `${COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
  }
  return `${COOKIE}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAgeSeconds}`;
}
