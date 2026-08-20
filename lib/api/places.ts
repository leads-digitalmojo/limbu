/* Client-side calls for city autocomplete.
   Owner: Abiram. Backs the City field on Keyword Planner and Competitor Analysis. */
import { apiFetch } from './client';
import type { CitySuggestion } from '../../lib/server/googleMaps';

export type { CitySuggestion };

export const placesApi = {
  autocomplete: (input: string) => apiFetch<{ suggestions: CitySuggestion[] }>(`/api/places/autocomplete?input=${encodeURIComponent(input)}`),
};
