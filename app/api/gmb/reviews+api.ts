/* GET /api/gmb/reviews?locationId=locations/12345 — real reviews for a
   connected location, via the (legacy but still the only one that exists)
   My Business API v4 reviews endpoint. Neither Account Management nor
   Business Information API expose reviews — this is a genuinely separate
   Google API product with its own enablement and quota, on top of the two
   already required for locations/insights/health. */
import { readAccessToken } from '../../../lib/server/session';

export type GmbReview = {
  googleReviewId: string;
  author: string;
  rating: number;
  text: string;
  createdAt: string;
  reply: string | null;
};

type GoogleAccount = { name: string };
type GoogleReview = {
  reviewId: string;
  reviewer?: { displayName?: string };
  starRating?: 'STAR_RATING_UNSPECIFIED' | 'ONE' | 'TWO' | 'THREE' | 'FOUR' | 'FIVE';
  comment?: string;
  createTime: string;
  reviewReply?: { comment?: string };
};

const STAR_RATING: Record<string, number> = { ONE: 1, TWO: 2, THREE: 3, FOUR: 4, FIVE: 5, STAR_RATING_UNSPECIFIED: 0 };

export async function GET(request: Request) {
  const accessToken = readAccessToken(request);
  if (!accessToken) return Response.json({ error: 'not_connected' }, { status: 401 });

  const locationId = new URL(request.url).searchParams.get('locationId');
  if (!locationId) return Response.json({ error: 'missing_location' }, { status: 400 });

  const auth = { Authorization: `Bearer ${accessToken}` };

  const accountsRes = await fetch('https://mybusinessaccountmanagement.googleapis.com/v1/accounts', { headers: auth });
  if (!accountsRes.ok) return Response.json({ error: 'google_error', detail: await accountsRes.text() }, { status: 502 });
  const { accounts } = (await accountsRes.json()) as { accounts?: GoogleAccount[] };
  const account = accounts?.[0];
  if (!account) return Response.json({ reviews: [] as GmbReview[] });

  const numericLocationId = locationId.replace(/^locations\//, '');
  const reviewsRes = await fetch(
    `https://mybusiness.googleapis.com/v4/${account.name}/locations/${numericLocationId}/reviews`,
    { headers: auth },
  );
  if (!reviewsRes.ok) return Response.json({ error: 'google_error', detail: await reviewsRes.text() }, { status: 502 });
  const { reviews: raw } = (await reviewsRes.json()) as { reviews?: GoogleReview[] };

  const reviews: GmbReview[] = (raw ?? []).map((r) => ({
    googleReviewId: r.reviewId,
    author: r.reviewer?.displayName ?? 'Anonymous',
    rating: STAR_RATING[r.starRating ?? 'STAR_RATING_UNSPECIFIED'],
    text: r.comment ?? '',
    createdAt: r.createTime,
    reply: r.reviewReply?.comment ?? null,
  }));

  return Response.json({ reviews });
}
