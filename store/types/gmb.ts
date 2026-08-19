/* Google Business Profile domain — owner: Person A */

export type Business = {
  id: string; name: string; cat: string; loc: string; city: string;
  rating: number; reviews: number; phone: string; site: string; verified: boolean; hours: string;
};

export type Review = {
  id: string; author: string; rating: number; text: string; bizId: string;
  createdAt: string; reply: string | null; replyAuto: boolean;
};

export type Qr = { slug: string; scans: number; reviewsCollected: number; threshold: number };
