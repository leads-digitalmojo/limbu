/* GET /api/places/autocomplete?input=Mum — real city-name suggestions
   from Google Places Autocomplete (New). Backs the City field on
   Keyword Planner and Competitor Analysis. */
import { autocompleteCities } from '../../../lib/server/googleMaps';

export async function GET(request: Request) {
  const input = new URL(request.url).searchParams.get('input')?.trim();
  if (!input || input.length < 2) return Response.json({ suggestions: [] });

  try {
    const suggestions = await autocompleteCities(input);
    return Response.json({ suggestions });
  } catch (e) {
    return Response.json({ error: 'google_maps_error', detail: e instanceof Error ? e.message : String(e) }, { status: 502 });
  }
}
