/* Client-side calls for the Keyword Planner.
   Owner: Abiram. Backs app/keywords.tsx. */
import { apiFetch } from './client';
import type { KeywordIdea } from '../../app/api/keywords/ideas+api';

export type { KeywordIdea };

export const keywordsApi = {
  getIdeas: (q: string) => apiFetch<{ ideas: KeywordIdea[] }>(`/api/keywords/ideas?q=${encodeURIComponent(q)}`),
};
