/* Local SEO domain — owner: Abiram */

export type Keyword = { id: string; kw: string; vol: number; diff: number; cpc: string };

export type GridPoint = { x: number; y: number; lat: number; lng: number; rank: number | null; competitor: string };

export type Audit = {
  id: string; kw: string; city: string; bizId: string; n: number; pts: GridPoint[];
  avg: string; top3: number; coverage: number; visibility: number; best: number;
  comps: { name: string; freq: number; avg: string; rating: string; reviews: number }[];
  at: string;
};
