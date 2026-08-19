/* POST /api/competitors/audit — a real geo-grid rank check: geocodes the
   typed city, fans out one Places Text Search per grid point (biased to
   that point, 1.2km spacing to match the "~X km from clinic" copy already
   in competitors.tsx), and finds where the target business lands in each
   point's ranked results. Bills real money per call — see .env.example.

   Costs 1 geocode + n*n Places calls. A 5x5 audit is 25 Places calls. */
import { geocode, searchNearby, type LatLng, type PlaceResult } from '../../../lib/server/googleMaps';
import type { Audit, GridPoint } from '../../../store/types';

const STEP_KM = 1.2;
const KM_PER_LAT_DEGREE = 110.574;

function offsetPoint(center: LatLng, dxKm: number, dyKm: number): LatLng {
  const kmPerLngDegree = 111.320 * Math.cos((center.lat * Math.PI) / 180);
  return { lat: center.lat + dyKm / KM_PER_LAT_DEGREE, lng: center.lng + dxKm / kmPerLngDegree };
}

function namesMatch(a: string, b: string): boolean {
  const norm = (s: string) => s.toLowerCase().trim().replace(/\s+/g, ' ');
  const [na, nb] = [norm(a), norm(b)];
  return na === nb || na.includes(nb) || nb.includes(na);
}

type Body = { keyword?: string; city?: string; businessName?: string; gridSize?: number; bizId?: string };

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as Body;
  const { keyword, city, businessName, bizId } = body;
  const n = body.gridSize;

  if (!keyword || !city || !businessName || !bizId) return Response.json({ error: 'missing_fields' }, { status: 400 });
  if (n !== 1 && n !== 3 && n !== 5) return Response.json({ error: 'invalid_grid_size' }, { status: 400 });

  let center: LatLng | null;
  try {
    center = await geocode(city);
  } catch (e) {
    return Response.json({ error: 'google_maps_error', detail: e instanceof Error ? e.message : String(e) }, { status: 502 });
  }
  if (!center) return Response.json({ error: 'city_not_found' }, { status: 400 });

  const pts: GridPoint[] = [];
  const leaderboard = new Map<string, { freq: number; rankSum: number; rating: number | null; reviews: number | null }>();

  try {
    for (let y = 0; y < n; y++) {
      for (let x = 0; x < n; x++) {
        const point = offsetPoint(center, (x - (n - 1) / 2) * STEP_KM, (y - (n - 1) / 2) * STEP_KM);
        const results: PlaceResult[] = await searchNearby(point, keyword);

        const ownIndex = results.findIndex((r) => namesMatch(r.name, businessName));
        const rank = ownIndex === -1 ? null : ownIndex + 1;

        const topOther = results.find((r) => !namesMatch(r.name, businessName));
        pts.push({ x, y, rank, competitor: topOther?.name ?? '' });

        results.forEach((r, i) => {
          if (namesMatch(r.name, businessName)) return;
          const entry = leaderboard.get(r.name) ?? { freq: 0, rankSum: 0, rating: null, reviews: null };
          entry.freq += 1;
          entry.rankSum += i + 1;
          entry.rating = r.rating ?? entry.rating;
          entry.reviews = r.userRatingCount ?? entry.reviews;
          leaderboard.set(r.name, entry);
        });
      }
    }
  } catch (e) {
    return Response.json({ error: 'google_maps_error', detail: e instanceof Error ? e.message : String(e) }, { status: 502 });
  }

  const ranked = pts.filter((p): p is GridPoint & { rank: number } => p.rank != null);
  const top3 = pts.filter((p) => p.rank != null && p.rank <= 3).length;

  const comps = [...leaderboard.entries()]
    .map(([name, s]) => ({
      name, freq: s.freq, avg: (s.rankSum / s.freq).toFixed(1),
      rating: (s.rating ?? 0).toFixed(1), reviews: s.reviews ?? 0,
    }))
    .sort((a, b) => Number(a.avg) - Number(b.avg))
    .slice(0, 8);

  const audit: Audit = {
    id: crypto.randomUUID(), kw: keyword, city, bizId, n, pts,
    avg: ranked.length ? (ranked.reduce((a, p) => a + p.rank, 0) / ranked.length).toFixed(1) : '20+',
    top3,
    coverage: Math.round((ranked.length / pts.length) * 100),
    visibility: Math.round((top3 / pts.length) * 100),
    best: ranked.length ? Math.min(...ranked.map((p) => p.rank)) : 21,
    comps, at: new Date().toISOString(),
  };

  return Response.json({ audit });
}
