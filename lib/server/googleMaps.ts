/* Server-only Google Maps Platform access: Geocoding API (turn a typed
   city/address into coordinates), Places API Text Search (New) (rank a
   keyword search biased to a specific point), Places API Autocomplete
   (New) (city-name suggestions as the user types) and Static Maps API (a
   real map image with the grid plotted on it). All billed per request
   against the API key's project — every call here costs real money,
   unlike the OAuth-based GMB/Ads integrations. Callers: see
   app/api/competitors/{audit,staticmap}+api.ts and
   app/api/places/autocomplete+api.ts. */
import { env } from './env';

export type LatLng = { lat: number; lng: number };

export async function geocode(address: string): Promise<LatLng | null> {
  const url = new URL('https://maps.googleapis.com/maps/api/geocode/json');
  url.searchParams.set('address', address);
  url.searchParams.set('key', env.googleMapsApiKey());

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`Geocoding API error (${res.status}): ${await res.text()}`);
  const data = (await res.json()) as { status: string; results?: { geometry: { location: LatLng } }[] };

  if (data.status !== 'OK' || !data.results?.length) return null;
  return data.results[0].geometry.location;
}

export type PlaceResult = { id: string; name: string; rating: number | null; userRatingCount: number | null };

/** Text Search (New), biased to a point — the closest real equivalent to
    "what ranks for this keyword around here". Returns up to 20 results;
    Google doesn't return anything beyond that without extra paginated
    requests, which this doesn't do — a business absent from these 20 is
    treated as "not in the top 20", matching the existing "20+" UI copy. */
export async function searchNearby(center: LatLng, query: string, radiusMeters = 1500): Promise<PlaceResult[]> {
  const res = await fetch('https://places.googleapis.com/v1/places:searchText', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': env.googleMapsApiKey(),
      'X-Goog-FieldMask': 'places.id,places.displayName,places.rating,places.userRatingCount',
    },
    body: JSON.stringify({
      textQuery: query,
      locationBias: { circle: { center: { latitude: center.lat, longitude: center.lng }, radius: radiusMeters } },
      maxResultCount: 20,
    }),
  });
  if (!res.ok) throw new Error(`Places API error (${res.status}): ${await res.text()}`);
  const data = (await res.json()) as {
    places?: { id: string; displayName?: { text?: string }; rating?: number; userRatingCount?: number }[];
  };

  return (data.places ?? []).map((p) => ({
    id: p.id,
    name: p.displayName?.text ?? 'Unknown',
    rating: p.rating ?? null,
    userRatingCount: p.userRatingCount ?? null,
  }));
}

export type CitySuggestion = { placeId: string; text: string };

/** Places Autocomplete (New), restricted to cities/localities/regions —
    real suggestions as the user types, not a fixed list of a few dozen
    metros. Same billing/auth as the rest of this file. */
export async function autocompleteCities(input: string): Promise<CitySuggestion[]> {
  const res = await fetch('https://places.googleapis.com/v1/places:autocomplete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Goog-Api-Key': env.googleMapsApiKey() },
    body: JSON.stringify({
      input,
      includedPrimaryTypes: ['locality', 'administrative_area_level_3'],
    }),
  });
  if (!res.ok) throw new Error(`Places Autocomplete error (${res.status}): ${await res.text()}`);
  const data = (await res.json()) as {
    suggestions?: { placePrediction?: { placeId: string; text?: { text?: string } } }[];
  };

  return (data.suggestions ?? [])
    .map((s) => s.placePrediction)
    .filter((p): p is { placeId: string; text?: { text?: string } } => !!p)
    .map((p) => ({ placeId: p.placeId, text: p.text?.text ?? '' }))
    .filter((s) => s.text);
}

export type MapPoint = { lat: number; lng: number; rank: number | null };

// Same rank -> color buckets as competitors.tsx's RANK_COLORS, kept in sync
// by hand since one lives in the client UI and this one needs hex-with-0x
// for the Static Maps API's marker syntax rather than a CSS string.
const RANK_MARKER_COLORS = ['0x059669', '0x22C55E', '0xEAB308', '0xF97316', '0xDC2626', '0x475569'];
function rankMarkerColor(r: number | null): string {
  if (r == null) return RANK_MARKER_COLORS[5];
  if (r <= 1) return RANK_MARKER_COLORS[0];
  if (r <= 3) return RANK_MARKER_COLORS[1];
  if (r <= 7) return RANK_MARKER_COLORS[2];
  if (r <= 12) return RANK_MARKER_COLORS[3];
  return RANK_MARKER_COLORS[4];
}

/** Builds the real Static Maps API URL, key included — never return this
    string to the client as-is. app/api/competitors/staticmap+api.ts fetches
    it server-side and streams back the image bytes instead, so the key
    never appears in a browser-visible URL. */
export function staticMapUrl(points: MapPoint[], size = '640x400', scale = 2): string {
  const url = new URL('https://maps.googleapis.com/maps/api/staticmap');
  url.searchParams.set('size', size);
  url.searchParams.set('scale', String(scale));
  url.searchParams.set('maptype', 'roadmap');
  url.searchParams.set('key', env.googleMapsApiKey());
  for (const p of points) url.searchParams.append('markers', `color:${rankMarkerColor(p.rank)}|${p.lat},${p.lng}`);
  return url.toString();
}
