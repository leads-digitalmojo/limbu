export type Business = {
  id: string; name: string; cat: string; loc: string; city: string;
  rating: number; reviews: number; phone: string; site: string; verified: boolean; hours: string;
};

export type PostStatus = 'pending' | 'approved' | 'rejected' | 'scheduled' | 'posted';
export type Platform = 'google' | 'facebook' | 'instagram' | 'pinterest' | 'linkedin' | 'youtube';

export type Post = {
  id: string; caption: string; status: PostStatus; platforms: string[];
  type: 'image' | 'video'; ratio: string; theme: string; keywords: string[];
  mode: 'auto' | 'manual'; bizId: string; createdAt: string;
  stats: { views: number; likes: number; clicks: number };
};

export type Review = {
  id: string; author: string; rating: number; text: string; bizId: string;
  createdAt: string; reply: string | null; replyAuto: boolean;
};

export type LeadStatus = 'new' | 'contacted' | 'converted' | 'spam';
export type Lead = {
  id: string; name: string; phone: string; email: string; service: string;
  status: LeadStatus; source: string; message: string; createdAt: string;
};

export type Keyword = { id: string; kw: string; vol: number; diff: number; cpc: string };

export type Tx = { id: string; type: 'credit' | 'debit'; label: string; amount: number; at: string; ref: string };

export type GridPoint = { x: number; y: number; rank: number | null; competitor: string };
export type Audit = {
  id: string; kw: string; city: string; bizId: string; n: number; pts: GridPoint[];
  avg: string; top3: number; coverage: number; visibility: number; best: number;
  comps: { name: string; freq: number; avg: string; rating: string; reviews: number }[];
  at: string;
};

export type Website = {
  id: string; name: string; template: string; domain: string;
  status: 'live' | 'draft'; pages: number; leads: number; createdAt: string;
};

export type Product = { id: string; name: string; price: string; imgs: number };

export type Brand = {
  theme: string; custom: string; ratio: string; style: string;
  images: { logo: number; character: number; uniform: number; background: number };
  products: Product[];
};

export type Settings = {
  autoReply: boolean; autoPost: boolean; passkey: boolean; adminApproval: boolean;
  lang: string; notifyEmail: boolean; notifyWhatsapp: boolean;
};

export type User = {
  name: string; email: string; phone: string; plan: string; verified: boolean;
  memberSince: string; renews: string; credits: number; creditCap: number;
};

export type Notification = { id: string; icon: string; title: string; desc: string; at: string };
