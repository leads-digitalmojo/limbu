/* Limbu AI — global state: zustand + AsyncStorage persistence.

   SHARED FILE. State and actions live in ./slices, one file per domain with a
   single owner. Add fields and actions to the slice you own; only touch this
   file (and ./slices/shared.ts) when you are adding a whole new slice, and
   agree that with the other owner first. */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { createAccount, initialAccount } from './slices/account';
import { createContent, initialContent } from './slices/content';
import { createCore, initialCore } from './slices/core';
import { createGmb, initialGmb } from './slices/gmb';
import { createGrowth, initialGrowth } from './slices/growth';
import { createSeo, initialSeo } from './slices/seo';
import type { Store, StoreActions, StoreState } from './slices/shared';

export type { Store, StoreActions, StoreState } from './slices/shared';

/** kept as the historical names so existing imports keep working */
export type State = StoreState;
export type Actions = StoreActions;

const initial = (): StoreState => ({
  ...initialCore(),
  ...initialGmb(),
  ...initialSeo(),
  ...initialContent(),
  ...initialGrowth(),
  ...initialAccount(),
});

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      ...initial(),
      ...createCore(initial)(set, get),
      ...createGmb(set, get),
      ...createSeo(set, get),
      ...createContent(set, get),
      ...createGrowth(set, get),
      ...createAccount(set, get),
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
