/* Google Business Profile: locations, connection, reviews, Magic QR.
   OWNER: Abiram */
import { BUSINESSES, seedReviews } from '../../lib/mock';
import type { Business, Qr, Review } from '../types';
import type { Slice } from './shared';

export type GmbState = {
  businesses: Business[];
  gmbConnected: boolean;
  reviews: Review[];
  qr: Qr;
};

export const initialGmb = (): GmbState => ({
  businesses: BUSINESSES,
  gmbConnected: true,
  reviews: seedReviews(),
  qr: { slug: 'sunrise-dental', scans: 412, reviewsCollected: 96, threshold: 4 },
});

export type GmbActions = {
  setReviewReply: (id: string, reply: string | null, auto?: boolean) => void;
  setQr: (p: Partial<Qr>) => void;
};

export const createGmb: Slice<GmbActions> = (set, get) => ({
  setReviewReply: (id, reply, auto = false) =>
    set({ reviews: get().reviews.map((r) => (r.id === id ? { ...r, reply, replyAuto: auto } : r)) }),

  setQr: (p) => set({ qr: { ...get().qr, ...p } }),
});
