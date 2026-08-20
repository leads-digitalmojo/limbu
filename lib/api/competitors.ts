/* Client-side calls for Competitor Analysis.
   Owner: Abiram. Backs app/competitors.tsx. */
import { apiFetch } from './client';
import type { Audit, GridPoint } from '../../store/types';

export const competitorsApi = {
  runAudit: (body: { keyword: string; city: string; businessName: string; gridSize: 1 | 3 | 5; bizId: string }) =>
    apiFetch<{ audit: Audit }>('/api/competitors/audit', { method: 'POST', body: JSON.stringify(body) }),

  /** relative URL for an <Image> — never build the raw Google Static Maps
      URL client-side, it would put the billed API key in the page source */
  mapImageUrl: (points: GridPoint[]) => {
    const q = points.map((p) => `${p.lat},${p.lng},${p.rank ?? ''}`).join(';');
    return `/api/competitors/staticmap?points=${encodeURIComponent(q)}`;
  },
};
