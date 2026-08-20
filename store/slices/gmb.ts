/* Google Business Profile: locations, connection, reviews, Magic QR.
   OWNER: Abiram */
import { uid } from '../../lib/mock';
import type { Business, Qr, Review } from '../types';
import type { Slice } from './shared';

export type GmbState = {
  businesses: Business[];
  gmbConnected: boolean;
  /** the Google account email behind gmbConnected, from the real OAuth session — null until synced */
  gmbEmail: string | null;
  reviews: Review[];
  qr: Qr;
};

export const initialGmb = (): GmbState => ({
  businesses: [],
  gmbConnected: false,
  gmbEmail: null,
  reviews: [],
  qr: { slug: '', scans: 0, reviewsCollected: 0, threshold: 4 },
});

export type GmbActions = {
  setReviewReply: (id: string, reply: string | null, auto?: boolean) => void;
  setQr: (p: Partial<Qr>) => void;
  setGmbConnection: (connected: boolean, email?: string | null) => void;
  /** adds a real Google location picked in "Connect location". Rating, review
      count and hours are unknown until their own sync lands (Places API,
      Business Calendar API) — 0/false/'' means "not yet synced", not "none". */
  addBusiness: (l: { googleLocationId: string; name: string; category: string | null; address: string | null; phone: string | null }) => string;
  /** replaces this business's reviews with a fresh sync from Google —
      reviews belonging to other businesses are left untouched. */
  syncReviews: (bizId: string, reviews: { googleReviewId: string; author: string; rating: number; text: string; createdAt: string; reply: string | null }[]) => void;
};

export const createGmb: Slice<GmbActions> = (set, get) => ({
  setReviewReply: (id, reply, auto = false) =>
    set({ reviews: get().reviews.map((r) => (r.id === id ? { ...r, reply, replyAuto: auto } : r)) }),

  setQr: (p) => set({ qr: { ...get().qr, ...p } }),

  setGmbConnection: (gmbConnected, gmbEmail = null) => set({ gmbConnected, gmbEmail }),

  addBusiness: (l) => {
    const existing = get().businesses.find((b) => b.googleLocationId === l.googleLocationId);
    if (existing) return existing.id;

    const id = uid('b');
    const business: Business = {
      id, name: l.name, cat: l.category ?? 'Uncategorized', loc: l.address ?? '', city: '',
      rating: 0, reviews: 0, phone: l.phone ?? '', site: '', verified: false, hours: '',
      googleLocationId: l.googleLocationId,
    };
    set({ businesses: [...get().businesses, business] });
    return id;
  },

  syncReviews: (bizId, reviews) => {
    const others = get().reviews.filter((r) => r.bizId !== bizId);
    const synced: Review[] = reviews.map((r) => ({
      id: uid('rev'), bizId, googleReviewId: r.googleReviewId,
      author: r.author, rating: r.rating, text: r.text, createdAt: r.createdAt,
      reply: r.reply, replyAuto: false,
    }));
    set({ reviews: [...others, ...synced] });
  },
});
