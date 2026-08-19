/* Client-side calls for the Google Business Profile connection.
   Owner: Abiram. Backs app/gmb-connect.tsx. */
import { apiFetch } from './client';

export type GmbStatus = { connected: boolean; email: string | null };

export const gmbApi = {
  status: () => apiFetch<GmbStatus>('/api/gmb/status'),

  /** navigates the browser away — there is no JSON response to await */
  startConnect: () => { window.location.href = '/api/gmb/oauth/start'; },

  disconnect: () => apiFetch<{ ok: true }>('/api/gmb/disconnect', { method: 'POST' }),
};
