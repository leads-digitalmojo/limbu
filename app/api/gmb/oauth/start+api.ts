/* GET /api/gmb/oauth/start — kicks off the Google OAuth consent flow.
   Redirects to Google; Google redirects back to oauth/callback. */
import { randomBytes } from 'crypto';
import { env } from '../../../../lib/server/env';

const SCOPES = [
  'https://www.googleapis.com/auth/business.manage',
  'email',
];

export async function GET() {
  const state = randomBytes(16).toString('base64url');

  const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  url.searchParams.set('client_id', env.googleClientId());
  url.searchParams.set('redirect_uri', env.googleRedirectUri());
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('access_type', 'offline');
  url.searchParams.set('prompt', 'consent');
  url.searchParams.set('scope', SCOPES.join(' '));
  url.searchParams.set('state', state);

  // Response.redirect() returns headers that are immutable per the Fetch spec,
  // so a cookie can't be appended to it — build the redirect by hand instead.
  return new Response(null, {
    status: 302,
    headers: {
      Location: url.toString(),
      // short-lived, checked against the state Google echoes back to /callback
      'Set-Cookie': `limbu_oauth_state=${state}; Path=/; HttpOnly; SameSite=Lax; Max-Age=600`,
    },
  });
}
