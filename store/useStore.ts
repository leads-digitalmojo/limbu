/* Limbu AI — global state: zustand + AsyncStorage persistence */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import {
  BUSINESSES, daysAgo, rand, seedKeywords, seedLeads, seedPosts, seedReviews, seedTx, uid,
} from '../lib/mock';
import type {
  Audit, Brand, Business, Keyword, Lead, Notification, Post, Review, Settings, Tx, User, Website,
} from './types';

export type State = {
  user: User;
  theme: 'light' | 'dark';
  activeBiz: string;
  businesses: Business[];
  gmbConnected: boolean;
  posts: Post[];
  reviews: Review[];
  leads: Lead[];
  keywords: Keyword[];
  audits: Audit[];
  transactions: Tx[];
  websites: Website[];
  social: Record<string, boolean>;
  brand: Brand;
  settings: Settings;
  qr: { slug: string; scans: number; reviewsCollected: number; threshold: number };
  notifications: Notification[];
  hydrated: boolean;
};

export type Actions = {
  setTheme: (t: 'light' | 'dark') => void;
  toggleTheme: () => void;
  setActiveBiz: (id: string) => void;
  patch: (p: Partial<State>) => void;
  /** returns false when the wallet cannot cover the cost */
  spend: (n: number, label: string) => boolean;
  topup: (amount: number, bonus: number, label?: string) => void;
  addPost: (p: Post) => void;
  updatePost: (id: string, p: Partial<Post>) => void;
  removePost: (id: string) => void;
  setReviewReply: (id: string, reply: string | null, auto?: boolean) => void;
  updateLead: (id: string, p: Partial<Lead>) => void;
  addKeyword: (k: Keyword) => void;
  removeKeyword: (id: string) => void;
  addAudit: (a: Audit) => void;
  removeAudit: (id: string) => void;
  setBrand: (p: Partial<Brand>) => void;
  setSetting: <K extends keyof Settings>(k: K, v: Settings[K]) => void;
  setSocial: (k: string, v: boolean) => void;
  setQr: (p: Partial<State['qr']>) => void;
  clearNotifications: () => void;
  resetDemo: () => void;
};

const initial = (): State => ({
  user: {
    name: 'Rajesh Kumar', email: 'rajesh@sunrisedental.in', phone: '+91 98200 41120',
    plan: 'Professional', verified: true, memberSince: '12 Jan 2025', renews: '12 Sep 2026',
    credits: 4820, creditCap: 7500,
  },
  theme: 'light',
  activeBiz: 'b1',
  businesses: BUSINESSES,
  gmbConnected: true,
  posts: seedPosts(),
  reviews: seedReviews(),
  leads: seedLeads(),
  keywords: seedKeywords(),
  audits: [],
  transactions: seedTx(),
  websites: [{ id: uid('site'), name: 'Sunrise Dental Care', template: 'Medical Pro',
    domain: 'sunrisedental.limbu.site', status: 'live', pages: 6, leads: 34, createdAt: daysAgo(21) }],
  social: { google: true, facebook: true, instagram: true, linkedin: false, youtube: false, pinterest: false, whatsapp: true },
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
  settings: { autoReply: true, autoPost: true, passkey: false, adminApproval: true,
    lang: 'en', notifyEmail: true, notifyWhatsapp: true },
  qr: { slug: 'sunrise-dental', scans: 412, reviewsCollected: 96, threshold: 4 },
  notifications: [
    { id: uid('n'), icon: 'star', title: '3 new Google reviews', desc: '2 are waiting for a reply', at: daysAgo(0) },
    { id: uid('n'), icon: 'send', title: 'Post published to Google', desc: '"Painless root canals…" is live', at: daysAgo(0) },
    { id: uid('n'), icon: 'inbox', title: '2 new website leads', desc: 'From sunrisedental.limbu.site', at: daysAgo(1) },
    { id: uid('n'), icon: 'coin', title: 'Credits running low', desc: 'You have 4,820 credits left', at: daysAgo(2) },
  ],
  hydrated: false,
});

export const useStore = create<State & Actions>()(
  persist(
    (set, get) => ({
      ...initial(),

      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set({ theme: get().theme === 'dark' ? 'light' : 'dark' }),
      setActiveBiz: (activeBiz) => set({ activeBiz }),
      patch: (p) => set(p as any),

      spend: (n, label) => {
        const { user, transactions } = get();
        if (user.credits < n) return false;
        set({
          user: { ...user, credits: user.credits - n },
          transactions: [
            { id: uid('tx'), type: 'debit', label, amount: -n, at: new Date().toISOString(), ref: `LMB${rand(100000, 999999)}` },
            ...transactions,
          ],
        });
        return true;
      },

      topup: (amount, bonus, label = 'Wallet recharge — Razorpay') => {
        const { user, transactions } = get();
        set({
          user: { ...user, credits: user.credits + amount + bonus },
          transactions: [
            { id: uid('tx'), type: 'credit', label, amount: amount + bonus, at: new Date().toISOString(), ref: `LMB${rand(100000, 999999)}` },
            ...transactions,
          ],
        });
      },

      addPost: (p) => set({ posts: [p, ...get().posts] }),
      updatePost: (id, p) => set({ posts: get().posts.map((x) => (x.id === id ? { ...x, ...p } : x)) }),
      removePost: (id) => set({ posts: get().posts.filter((x) => x.id !== id) }),

      setReviewReply: (id, reply, auto = false) =>
        set({ reviews: get().reviews.map((r) => (r.id === id ? { ...r, reply, replyAuto: auto } : r)) }),

      updateLead: (id, p) => set({ leads: get().leads.map((l) => (l.id === id ? { ...l, ...p } : l)) }),

      addKeyword: (k) => set({ keywords: [...get().keywords, k] }),
      removeKeyword: (id) => set({ keywords: get().keywords.filter((k) => k.id !== id) }),

      addAudit: (a) => set({ audits: [a, ...get().audits] }),
      removeAudit: (id) => set({ audits: get().audits.filter((a) => a.id !== id) }),

      setBrand: (p) => set({ brand: { ...get().brand, ...p } }),
      setSetting: (k, v) => set({ settings: { ...get().settings, [k]: v } }),
      setSocial: (k, v) => set({ social: { ...get().social, [k]: v } }),
      setQr: (p) => set({ qr: { ...get().qr, ...p } }),
      clearNotifications: () => set({ notifications: [] }),
      resetDemo: () => set({ ...initial(), hydrated: true }),
    }),
    {
      name: 'limbu.ai.state.v1',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({ hydrated, ...rest }) => rest as any,
      onRehydrateStorage: () => (s) => s?.patch({ hydrated: true }),
    },
  ),
);

/** the currently selected Business Profile location */
export const useBiz = () =>
  useStore((s) => s.businesses.find((b) => b.id === s.activeBiz) ?? s.businesses[0]);
