/* Server-only Google Ads API access. A single agency-level credential set
   (developer token + refresh token for the manager account), not a per-user
   session — every keyword search goes through the same account regardless
   of which client/business is asking. See app/api/keywords/ideas+api.ts.

   The refresh token isn't minted by this app (there's no UI flow for it,
   unlike GMB's OAuth) — generate one once via Google's OAuth 2.0 Playground
   (https://developers.google.com/oauthplayground) using this app's
   GOOGLE_CLIENT_ID/SECRET and the https://www.googleapis.com/auth/adwords
   scope, then put it in GOOGLE_ADS_REFRESH_TOKEN. See .env.example. */
import { env } from './env';

const API_VERSION = 'v17';

let cached: { accessToken: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
  if (cached && cached.expiresAt > Date.now() + 30_000) return cached.accessToken;

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: env.googleClientId(),
      client_secret: env.googleClientSecret(),
      refresh_token: env.googleAdsRefreshToken(),
      grant_type: 'refresh_token',
    }),
  });
  if (!res.ok) throw new Error(`Google Ads token refresh failed: ${await res.text()}`);
  const data = (await res.json()) as { access_token: string; expires_in: number };

  cached = { accessToken: data.access_token, expiresAt: Date.now() + data.expires_in * 1000 };
  return cached.accessToken;
}

/** POSTs to the Google Ads REST API under the configured customer account. Throws on a non-2xx response — callers turn that into a clean error response rather than leaking Ads-internal errors to the client. */
export async function googleAdsRequest<T>(path: string, body: unknown): Promise<T> {
  const accessToken = await getAccessToken();
  const customerId = env.googleAdsCustomerId();

  const res = await fetch(`https://googleads.googleapis.com/${API_VERSION}/customers/${customerId}${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'developer-token': env.googleAdsDeveloperToken(),
      'login-customer-id': env.googleAdsLoginCustomerId(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) throw new Error(`Google Ads API error (${res.status}): ${await res.text()}`);
  return (await res.json()) as T;
}
