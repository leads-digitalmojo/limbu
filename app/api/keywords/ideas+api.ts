/* GET /api/keywords/ideas?q=dental+clinic — real search volume, competition
   and CPC from the Google Ads API's KeywordPlanIdeaService, using the
   agency's own manager-account credentials (see lib/server/googleAds.ts —
   this is not a per-business connection, every search goes through the
   same Ads account regardless of which client is asking).

   Not wired up yet: city-level geo-targeting. GenerateKeywordIdeasRequest
   accepts a geoTargetConstants field, but resolving a typed city name to
   one means a second, differently-scoped API call
   (GeoTargetConstantService.SuggestGeoTargetConstants, which is NOT under
   /customers/{id} the way this one is) that I have not verified against a
   live account. Shipping that alongside a first, unverified integration
   risked getting two contracts wrong instead of one — this returns
   nationally-scoped ideas for the seed term until that's built. */
import { googleAdsRequest } from '../../../lib/server/googleAds';

export type KeywordIdea = { kw: string; vol: number; diff: number; cpc: string };

type IdeaResult = {
  text?: string;
  keywordIdeaMetrics?: {
    avgMonthlySearches?: string;
    competitionIndex?: string;
    competition?: 'UNSPECIFIED' | 'UNKNOWN' | 'LOW' | 'MEDIUM' | 'HIGH';
    lowTopOfPageBidMicros?: string;
    highTopOfPageBidMicros?: string;
  };
};
type GenerateKeywordIdeasResponse = { results?: IdeaResult[] };

const COMPETITION_FALLBACK: Record<string, number> = { LOW: 25, MEDIUM: 55, HIGH: 85, UNKNOWN: 50, UNSPECIFIED: 50 };

export async function GET(request: Request) {
  const url = new URL(request.url);
  const q = url.searchParams.get('q')?.trim();
  if (!q) return Response.json({ error: 'missing_query' }, { status: 400 });

  let data: GenerateKeywordIdeasResponse;
  try {
    data = await googleAdsRequest<GenerateKeywordIdeasResponse>(':generateKeywordIdeas', {
      keywordSeed: { keywords: [q] },
      keywordPlanNetwork: 'GOOGLE_SEARCH',
      includeAdultKeywords: false,
      language: 'languageConstants/1000', // English — fixed for now, no language picker on this screen
    });
  } catch (e) {
    return Response.json({ error: 'google_ads_error', detail: e instanceof Error ? e.message : String(e) }, { status: 502 });
  }

  const ideas: KeywordIdea[] = (data.results ?? [])
    .filter((r) => !!r.text)
    .map((r) => {
      const m = r.keywordIdeaMetrics ?? {};
      const vol = Number(m.avgMonthlySearches ?? 0);
      const diff = m.competitionIndex != null ? Number(m.competitionIndex) : COMPETITION_FALLBACK[m.competition ?? 'UNKNOWN'];
      const lowBid = Number(m.lowTopOfPageBidMicros ?? 0) / 1_000_000;
      const highBid = Number(m.highTopOfPageBidMicros ?? 0) / 1_000_000;
      const cpc = ((lowBid + highBid) / 2 || 0).toFixed(2);
      return { kw: r.text as string, vol, diff, cpc };
    })
    .sort((a, b) => b.vol - a.vol)
    .slice(0, 40);

  return Response.json({ ideas });
}
