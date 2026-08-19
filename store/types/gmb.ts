/* Google Business Profile domain — owner: Abiram */

export type Business = {
  id: string; name: string; cat: string; loc: string; city: string;
  rating: number; reviews: number; phone: string; site: string; verified: boolean; hours: string;
  /** the real Google resource name (e.g. "locations/12345"), once connected via OAuth — null for demo data */
  googleLocationId?: string | null;
};

export type Review = {
  id: string; author: string; rating: number; text: string; bizId: string;
  createdAt: string; reply: string | null; replyAuto: boolean;
};

export type Qr = { slug: string; scans: number; reviewsCollected: number; threshold: number };
