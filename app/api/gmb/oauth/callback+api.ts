/* GET /api/gmb/oauth/callback — Google lands here with ?code&state.
   Exchanges the code for tokens, stores them in the session cookie, and
   bounces the browser back to the GMB Connection screen. */
import { env } from '../../../../lib/server/env';
import { sessionCookieHeader, serializeSession } from '../../../../lib/server/session';

type TokenResponse = {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
  scope: string;
};

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const error = url.searchParams.get('error');

  const cookie = request.headers.get('cookie') ?? '';
  const expectedState = cookie.match(/limbu_oauth_state=([^;]+)/)?.[1];

  const fail = (reason: string) =>
    Response.redirect(new URL(`/gmb-connect?error=${encodeURIComponent(reason)}`, url.origin).toString(), 302);

  if (error) return fail(error);
  if (!code || !state || state !== expectedState) return fail('invalid_state');

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: env.googleClientId(),
      client_secret: env.googleClientSecret(),
      redirect_uri: env.googleRedirectUri(),
      grant_type: 'authorization_code',
    }),
  });

  if (!tokenRes.ok) return fail('token_exchange_failed');
  const tokens = (await tokenRes.json()) as TokenResponse;

  const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  });
  const userInfo = userInfoRes.ok ? ((await userInfoRes.json()) as { email?: string }) : {};

  const session = serializeSession({
    email: userInfo.email ?? null,
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token ?? null,
    expiresAt: Date.now() + tokens.expires_in * 1000,
  });

  // Response.redirect() headers are immutable per the Fetch spec, and this
  // needs two Set-Cookie values — build the redirect by hand instead.
  const headers = new Headers({ Location: new URL('/gmb-connect?connected=1', url.origin).toString() });
  headers.append('Set-Cookie', sessionCookieHeader(session));
  headers.append('Set-Cookie', 'limbu_oauth_state=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0');
  return new Response(null, { status: 302, headers });
}
