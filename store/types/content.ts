/* AI content & brand assets domain — owner: Person B */

export type PostStatus = 'pending' | 'approved' | 'rejected' | 'scheduled' | 'posted';
export type Platform = 'google' | 'facebook' | 'instagram' | 'pinterest' | 'linkedin' | 'youtube';

export type Post = {
  id: string; caption: string; status: PostStatus; platforms: string[];
  type: 'image' | 'video'; ratio: string; theme: string; keywords: string[];
  mode: 'auto' | 'manual'; bizId: string; createdAt: string;
  stats: { views: number; likes: number; clicks: number };
};

export type Product = { id: string; name: string; price: string; imgs: number };

export type Brand = {
  theme: string; custom: string; ratio: string; style: string;
  images: { logo: number; character: number; uniform: number; background: number };
  products: Product[];
};
