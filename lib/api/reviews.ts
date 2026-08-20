/* Client-side calls for Reviews / Review Reply.
   Owner: Abiram. Backs components/ReviewsScreen.tsx. */
import { apiFetch } from './client';
import type { GmbReview } from '../../app/api/gmb/reviews+api';

export type { GmbReview };

export const reviewsApi = {
  sync: (locationId: string) =>
    apiFetch<{ reviews: GmbReview[] }>(`/api/gmb/reviews?locationId=${encodeURIComponent(locationId)}`),

  postReply: (locationId: string, googleReviewId: string, comment: string) =>
    apiFetch<{ ok: true }>('/api/gmb/reviews/reply', {
      method: 'POST', body: JSON.stringify({ locationId, googleReviewId, comment }),
    }),

  removeReply: (locationId: string, googleReviewId: string) =>
    apiFetch<{ ok: true }>(
      `/api/gmb/reviews/reply?locationId=${encodeURIComponent(locationId)}&googleReviewId=${encodeURIComponent(googleReviewId)}`,
      { method: 'DELETE' },
    ),

  generateReply: (businessName: string, rating: number, reviewText: string) =>
    apiFetch<{ reply: string }>('/api/reviews/generate-reply', {
      method: 'POST', body: JSON.stringify({ businessName, rating, reviewText }),
    }),
};
