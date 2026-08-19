/* POST /api/gmb/disconnect — clears the session cookie. Does not revoke the
   Google grant server-side; that is a follow-up (call Google's /revoke
   endpoint with the stored access token) once this carries real users. */
import { sessionCookieHeader } from '../../../lib/server/session';

export async function POST() {
  const res = Response.json({ ok: true });
  res.headers.append('Set-Cookie', sessionCookieHeader(null));
  return res;
}
