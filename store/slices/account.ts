/* User, credit wallet, social connections, settings, notifications.
   OWNER: Anshita — note that `spend` is called from every AI feature in the app,
   so treat its signature as public API. */
import { daysAgo, rand, seedTx, uid } from '../../lib/mock';
import type { Notification, Settings, Tx, User } from '../types';
import type { Slice } from './shared';

export type AccountState = {
  user: User;
  transactions: Tx[];
  social: Record<string, boolean>;
  settings: Settings;
  notifications: Notification[];
};

export const initialAccount = (): AccountState => ({
  user: {
    name: 'Rajesh Kumar', email: 'rajesh@sunrisedental.in', phone: '+91 98200 41120',
    plan: 'Professional', verified: true, memberSince: '12 Jan 2025', renews: '12 Sep 2026',
    credits: 4820, creditCap: 7500,
  },
  transactions: seedTx(),
  social: { google: true, facebook: true, instagram: true, linkedin: false, youtube: false, pinterest: false, whatsapp: true },
  settings: {
    autoReply: true, autoPost: true, passkey: false, adminApproval: true,
    lang: 'en', notifyEmail: true, notifyWhatsapp: true,
  },
  notifications: [
    { id: uid('n'), icon: 'star', title: '3 new Google reviews', desc: '2 are waiting for a reply', at: daysAgo(0) },
    { id: uid('n'), icon: 'send', title: 'Post published to Google', desc: '"Painless root canals…" is live', at: daysAgo(0) },
    { id: uid('n'), icon: 'inbox', title: '2 new website leads', desc: 'From sunrisedental.limbu.site', at: daysAgo(1) },
    { id: uid('n'), icon: 'coin', title: 'Credits running low', desc: 'You have 4,820 credits left', at: daysAgo(2) },
  ],
});

export type AccountActions = {
  /** returns false when the wallet cannot cover the cost */
  spend: (n: number, label: string) => boolean;
  topup: (amount: number, bonus: number, label?: string) => void;
  setSocial: (k: string, v: boolean) => void;
  setSetting: <K extends keyof Settings>(k: K, v: Settings[K]) => void;
  clearNotifications: () => void;
};

export const createAccount: Slice<AccountActions> = (set, get) => ({
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

  setSocial: (k, v) => set({ social: { ...get().social, [k]: v } }),
  setSetting: (k, v) => set({ settings: { ...get().settings, [k]: v } }),
  clearNotifications: () => set({ notifications: [] }),
});
