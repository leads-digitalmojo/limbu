/* GET /api/gmb/profile?locationId=locations/123 — the subset of a location's
   Business Information the public API actually exposes, used to compute the
   GMB Health checks that can be verified for real: name/category, secondary
   categories, hours, description, website.

   Deliberately NOT here: photo count (the Business Profile Photos/Media API
   was sunset for third-party apps in 2022), post frequency (Local Posts API
   has been invite-only since 2022), services/pricing and attributes (both
   need a per-category metadata lookup to score meaningfully — not built yet,
   see app/gmb-health.tsx). Those checks stay simulated in the screen. */
import { readAccessToken } from '../../../lib/server/session';

export type GmbProfile = {
  title: string | null;
  primaryCategory: string | null;
  additionalCategories: string[];
  hasHours: boolean;
  description: string | null;
  websiteUri: string | null;
};

type GoogleLocation = {
  title?: string;
  categories?: { primaryCategory?: { displayName?: string }; additionalCategories?: { displayName?: string }[] };
  regularHours?: { periods?: unknown[] };
  profile?: { description?: string };
  websiteUri?: string;
};

export async function GET(request: Request) {
  const accessToken = readAccessToken(request);
  if (!accessToken) return Response.json({ error: 'not_connected' }, { status: 401 });

  const url = new URL(request.url);
  const locationId = url.searchParams.get('locationId');
  if (!locationId) return Response.json({ error: 'missing_location' }, { status: 400 });

  const readMask = 'title,categories,regularHours,profile,websiteUri';
  const res = await fetch(
    `https://mybusinessbusinessinformation.googleapis.com/v1/${locationId}?readMask=${readMask}`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );
  if (!res.ok) return Response.json({ error: 'google_error', detail: await res.text() }, { status: 502 });
  const l = (await res.json()) as GoogleLocation;

  const profile: GmbProfile = {
    title: l.title ?? null,
    primaryCategory: l.categories?.primaryCategory?.displayName ?? null,
    additionalCategories: (l.categories?.additionalCategories ?? []).map((c) => c.displayName ?? '').filter(Boolean),
    hasHours: !!l.regularHours?.periods?.length,
    description: l.profile?.description ?? null,
    websiteUri: l.websiteUri ?? null,
  };

  return Response.json(profile);
}
