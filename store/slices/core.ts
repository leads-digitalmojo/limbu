/* Theme, active location, hydration. SHARED FILE — both owners must agree on changes. */
import type { Slice, StoreState } from './shared';

export type CoreState = {
  theme: 'light' | 'dark';
  activeBiz: string;
  hydrated: boolean;
};

export const initialCore = (): CoreState => ({
  theme: 'light',
  activeBiz: 'b1',
  hydrated: false,
});

export type CoreActions = {
  setTheme: (t: 'light' | 'dark') => void;
  toggleTheme: () => void;
  setActiveBiz: (id: string) => void;
  patch: (p: Partial<StoreState>) => void;
  resetDemo: () => void;
};

export const createCore =
  (initialAll: () => StoreState): Slice<CoreActions> =>
  (set, get) => ({
    setTheme: (theme) => set({ theme }),
    toggleTheme: () => set({ theme: get().theme === 'dark' ? 'light' : 'dark' }),
    setActiveBiz: (activeBiz) => set({ activeBiz }),
    patch: (p) => set(p),
    resetDemo: () => set({ ...initialAll(), hydrated: true }),
  });
