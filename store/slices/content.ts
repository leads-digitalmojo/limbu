/* AI content: posts and brand assets.
   OWNER: Person B */
import { seedPosts, uid } from '../../lib/mock';
import type { Brand, Post } from '../types';
import type { Slice } from './shared';

export type ContentState = {
  posts: Post[];
  brand: Brand;
};

export const initialContent = (): ContentState => ({
  posts: seedPosts(),
  brand: {
    theme: 'lemon', custom: '#FACC15', ratio: '1:1',
    style: 'Modern, clean, trustworthy healthcare tone',
    images: { logo: 1, character: 2, uniform: 1, background: 3 },
    products: [
      { id: uid('p'), name: 'Invisible Aligners', price: '₹65,000', imgs: 3 },
      { id: uid('p'), name: 'Zoom Teeth Whitening', price: '₹8,999', imgs: 2 },
      { id: uid('p'), name: 'Single Sitting RCT', price: '₹4,500', imgs: 1 },
    ],
  },
});

export type ContentActions = {
  addPost: (p: Post) => void;
  updatePost: (id: string, p: Partial<Post>) => void;
  removePost: (id: string) => void;
  setBrand: (p: Partial<Brand>) => void;
};

export const createContent: Slice<ContentActions> = (set, get) => ({
  addPost: (p) => set({ posts: [p, ...get().posts] }),
  updatePost: (id, p) => set({ posts: get().posts.map((x) => (x.id === id ? { ...x, ...p } : x)) }),
  removePost: (id) => set({ posts: get().posts.filter((x) => x.id !== id) }),

  setBrand: (p) => set({ brand: { ...get().brand, ...p } }),
});
