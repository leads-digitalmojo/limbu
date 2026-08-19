/* Server-only env access. Never import this from app/ or components/ —
   it throws if a required var is missing, which is only safe to hit at
   request time on the server. */

function required(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var: ${name}`);
  return v;
}

export const env = {
  googleClientId: () => required('GOOGLE_CLIENT_ID'),
  googleClientSecret: () => required('GOOGLE_CLIENT_SECRET'),
  googleRedirectUri: () => required('GOOGLE_REDIRECT_URI'),
  sessionSecret: () => required('SESSION_SECRET'),

  // Google Ads API — a single agency-level credential, not a per-user OAuth
  // session like the GMB flow. See lib/server/googleAds.ts.
  googleAdsDeveloperToken: () => required('GOOGLE_DEVELOPER_TOKEN'),
  googleAdsRefreshToken: () => required('GOOGLE_REFRESH_TOKEN'),
  googleAdsLoginCustomerId: () => required('GOOGLE_MCC_ID'), // manager account ID — "MCC" is Google's older name for it
  googleAdsCustomerId: () => required('GOOGLE_CUSTOMER_ID'),

  // Google Maps Platform — Places API (New) + Geocoding API, for Competitor
  // Analysis's geo-grid rank checker. A plain API key, billed per request —
  // see lib/server/googleMaps.ts.
  googleMapsApiKey: () => required('GOOGLE_MAPS_API_KEY'),
};
