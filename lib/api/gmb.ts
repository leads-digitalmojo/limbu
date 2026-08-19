/* Client-side calls for the Google Business Profile connection.
   Owner: Abiram. Backs app/gmb-connect.tsx, app/gmb-insights.tsx and
   app/gmb-health.tsx. */
import { apiFetch } from './client';
import type { GmbLocation } from '../../app/api/gmb/locations+api';
import type { InsightsSeries } from '../../app/api/gmb/insights+api';
import type { GmbProfile } from '../../app/api/gmb/profile+api';

export type GmbStatus = { connected: boolean; email: string | null };
export type { GmbLocation, InsightsSeries, GmbProfile };

export const gmbApi = {
  status: () => apiFetch<GmbStatus>('/api/gmb/status'),

  /** navigates the browser away — there is no JSON response to await */
  startConnect: () => { window.location.href = '/api/gmb/oauth/start'; },

  disconnect: () => apiFetch<{ ok: true }>('/api/gmb/disconnect', { method: 'POST' }),

  listLocations: () => apiFetch<{ locations: GmbLocation[] }>('/api/gmb/locations'),

  getInsights: (locationId: string, days: number) =>
    apiFetch<InsightsSeries>(`/api/gmb/insights?locationId=${encodeURIComponent(locationId)}&days=${days}`),

  getProfile: (locationId: string) =>
    apiFetch<GmbProfile>(`/api/gmb/profile?locationId=${encodeURIComponent(locationId)}`),
};
