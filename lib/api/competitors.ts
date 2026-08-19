/* Client-side calls for Competitor Analysis.
   Owner: Abiram. Backs app/competitors.tsx. */
import { apiFetch } from './client';
import type { Audit } from '../../store/types';

export const competitorsApi = {
  runAudit: (body: { keyword: string; city: string; businessName: string; gridSize: 1 | 3 | 5; bizId: string }) =>
    apiFetch<{ audit: Audit }>('/api/competitors/audit', { method: 'POST', body: JSON.stringify(body) }),
};
