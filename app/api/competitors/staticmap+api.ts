/* GET /api/competitors/staticmap?points=lat,lng,rank;lat,lng,rank;...
   Fetches a real Static Maps API image server-side (using the real,
   billed API key) and streams the bytes straight back — the key never
   appears in a client-visible URL this way. rank is "" for null (not in
   top 20). Backs the map view on Competitor Analysis. */
import { staticMapUrl, type MapPoint } from '../../../lib/server/googleMaps';

function parsePoints(raw: string): MapPoint[] {
  return raw.split(';').filter(Boolean).map((entry) => {
    const [lat, lng, rank] = entry.split(',');
    return { lat: Number(lat), lng: Number(lng), rank: rank ? Number(rank) : null };
  }).filter((p) => Number.isFinite(p.lat) && Number.isFinite(p.lng));
}

export async function GET(request: Request) {
  const raw = new URL(request.url).searchParams.get('points') ?? '';
  const points = parsePoints(raw);
  if (points.length === 0) return Response.json({ error: 'missing_points' }, { status: 400 });

  const res = await fetch(staticMapUrl(points));
  if (!res.ok) return Response.json({ error: 'google_maps_error', detail: await res.text() }, { status: 502 });

  return new Response(res.body, { headers: { 'Content-Type': res.headers.get('Content-Type') ?? 'image/png' } });
}
