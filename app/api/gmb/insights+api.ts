/* GET /api/gmb/insights?locationId=locations/123&days=30 — daily performance
   metrics for a connected location, via the Business Profile Performance API.
   Backs app/gmb-insights.tsx.

   Google exposes daily metrics only for: impressions (split desktop/mobile x
   maps/search), calls, direction requests, website clicks and a few others —
   there is no "search impressions" breakdown, no branded/discovery/direct
   query classification, and no peak-day/peak-time endpoint at all. Those
   stay simulated in the screen; this route only returns what Google
   actually reports. */
import { readAccessToken } from '../../../lib/server/session';

const METRICS = [
  'BUSINESS_IMPRESSIONS_DESKTOP_MAPS', 'BUSINESS_IMPRESSIONS_DESKTOP_SEARCH',
  'BUSINESS_IMPRESSIONS_MOBILE_MAPS', 'BUSINESS_IMPRESSIONS_MOBILE_SEARCH',
  'CALL_CLICKS', 'BUSINESS_DIRECTION_REQUESTS', 'WEBSITE_CLICKS',
] as const;

type GDate = { year: number; month: number; day: number };
type DatedValue = { date: GDate; value?: string };
type MetricSeries = { dailyMetric: string; timeSeries?: { datedValues?: DatedValue[] } };
type GoogleResponse = { multiDailyMetricTimeSeries?: { dailyMetricTimeSeries?: MetricSeries[] }[] };

export type InsightsSeries = {
  labels: string[];
  views: number[];
  mapsViews: number[];
  searchViews: number[];
  calls: number[];
  directions: number[];
  websiteClicks: number[];
};

const dateKey = (d: GDate) => `${d.year}-${String(d.month).padStart(2, '0')}-${String(d.day).padStart(2, '0')}`;

export async function GET(request: Request) {
  const accessToken = readAccessToken(request);
  if (!accessToken) return Response.json({ error: 'not_connected' }, { status: 401 });

  const url = new URL(request.url);
  const locationId = url.searchParams.get('locationId');
  if (!locationId) return Response.json({ error: 'missing_location' }, { status: 400 });
  const days = Math.min(90, Math.max(1, Number(url.searchParams.get('days') ?? 30)));

  const end = new Date();
  const start = new Date(end);
  start.setDate(start.getDate() - (days - 1));

  const gUrl = new URL(`https://businessprofileperformance.googleapis.com/v1/${locationId}:fetchMultiDailyMetricsTimeSeries`);
  METRICS.forEach((m) => gUrl.searchParams.append('dailyMetrics', m));
  gUrl.searchParams.set('dailyRange.start_date.year', String(start.getFullYear()));
  gUrl.searchParams.set('dailyRange.start_date.month', String(start.getMonth() + 1));
  gUrl.searchParams.set('dailyRange.start_date.day', String(start.getDate()));
  gUrl.searchParams.set('dailyRange.end_date.year', String(end.getFullYear()));
  gUrl.searchParams.set('dailyRange.end_date.month', String(end.getMonth() + 1));
  gUrl.searchParams.set('dailyRange.end_date.day', String(end.getDate()));

  const res = await fetch(gUrl.toString(), { headers: { Authorization: `Bearer ${accessToken}` } });
  if (!res.ok) return Response.json({ error: 'google_error', detail: await res.text() }, { status: 502 });
  const data = (await res.json()) as GoogleResponse;

  const byDate = new Map<string, Record<string, number>>();
  const series = data.multiDailyMetricTimeSeries?.[0]?.dailyMetricTimeSeries ?? [];
  for (const s of series) {
    for (const dv of s.timeSeries?.datedValues ?? []) {
      const key = dateKey(dv.date);
      const bucket = byDate.get(key) ?? {};
      bucket[s.dailyMetric] = Number(dv.value ?? 0);
      byDate.set(key, bucket);
    }
  }

  const labels: string[] = [];
  const mapsViews: number[] = [];
  const searchViews: number[] = [];
  const calls: number[] = [];
  const directions: number[] = [];
  const websiteClicks: number[] = [];

  for (let i = 0; i < days; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    const key = dateKey({ year: d.getFullYear(), month: d.getMonth() + 1, day: d.getDate() });
    const b = byDate.get(key) ?? {};
    labels.push(key);
    mapsViews.push((b.BUSINESS_IMPRESSIONS_DESKTOP_MAPS ?? 0) + (b.BUSINESS_IMPRESSIONS_MOBILE_MAPS ?? 0));
    searchViews.push((b.BUSINESS_IMPRESSIONS_DESKTOP_SEARCH ?? 0) + (b.BUSINESS_IMPRESSIONS_MOBILE_SEARCH ?? 0));
    calls.push(b.CALL_CLICKS ?? 0);
    directions.push(b.BUSINESS_DIRECTION_REQUESTS ?? 0);
    websiteClicks.push(b.WEBSITE_CLICKS ?? 0);
  }

  const views = mapsViews.map((v, i) => v + searchViews[i]);

  const payload: InsightsSeries = { labels, views, mapsViews, searchViews, calls, directions, websiteClicks };
  return Response.json(payload);
}
