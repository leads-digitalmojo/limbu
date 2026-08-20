/* POST/DELETE /api/gmb/reviews/reply — post or remove a reply on a real
   Google review, via the same v4 API family as reviews+api.ts. Body/query:
   { locationId, googleReviewId, comment? } — comment only on POST. */
import { readAccessToken } from '../../../../lib/server/session';

type GoogleAccount = { name: string };

async function findAccountName(accessToken: string): Promise<string | null> {
  const res = await fetch('https://mybusinessaccountmanagement.googleapis.com/v1/accounts', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error(await res.text());
  const { accounts } = (await res.json()) as { accounts?: GoogleAccount[] };
  return accounts?.[0]?.name ?? null;
}

function replyUrl(accountName: string, locationId: string, reviewId: string): string {
  const numericLocationId = locationId.replace(/^locations\//, '');
  return `https://mybusiness.googleapis.com/v4/${accountName}/locations/${numericLocationId}/reviews/${reviewId}/reply`;
}

export async function POST(request: Request) {
  const accessToken = readAccessToken(request);
  if (!accessToken) return Response.json({ error: 'not_connected' }, { status: 401 });

  const body = (await request.json().catch(() => ({}))) as { locationId?: string; googleReviewId?: string; comment?: string };
  const { locationId, googleReviewId, comment } = body;
  if (!locationId || !googleReviewId || !comment) return Response.json({ error: 'missing_fields' }, { status: 400 });

  try {
    const accountName = await findAccountName(accessToken);
    if (!accountName) return Response.json({ error: 'no_account' }, { status: 502 });

    const res = await fetch(replyUrl(accountName, locationId, googleReviewId), {
      method: 'PUT',
      headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ comment }),
    });
    if (!res.ok) return Response.json({ error: 'google_error', detail: await res.text() }, { status: 502 });
    return Response.json({ ok: true });
  } catch (e) {
    return Response.json({ error: 'google_error', detail: e instanceof Error ? e.message : String(e) }, { status: 502 });
  }
}

export async function DELETE(request: Request) {
  const accessToken = readAccessToken(request);
  if (!accessToken) return Response.json({ error: 'not_connected' }, { status: 401 });

  const url = new URL(request.url);
  const locationId = url.searchParams.get('locationId');
  const googleReviewId = url.searchParams.get('googleReviewId');
  if (!locationId || !googleReviewId) return Response.json({ error: 'missing_fields' }, { status: 400 });

  try {
    const accountName = await findAccountName(accessToken);
    if (!accountName) return Response.json({ error: 'no_account' }, { status: 502 });

    const res = await fetch(replyUrl(accountName, locationId, googleReviewId), {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) return Response.json({ error: 'google_error', detail: await res.text() }, { status: 502 });
    return Response.json({ ok: true });
  } catch (e) {
    return Response.json({ error: 'google_error', detail: e instanceof Error ? e.message : String(e) }, { status: 502 });
  }
}
