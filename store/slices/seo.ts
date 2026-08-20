/* Local SEO: keyword planner and Maps rank audits.
   OWNER: Abiram */
import type { Audit, Keyword } from '../types';
import type { Slice } from './shared';

export type SeoState = {
  keywords: Keyword[];
  audits: Audit[];
};

export const initialSeo = (): SeoState => ({
  keywords: [],
  audits: [],
});

export type SeoActions = {
  addKeyword: (k: Keyword) => void;
  removeKeyword: (id: string) => void;
  addAudit: (a: Audit) => void;
  removeAudit: (id: string) => void;
};

export const createSeo: Slice<SeoActions> = (set, get) => ({
  addKeyword: (k) => set({ keywords: [...get().keywords, k] }),
  removeKeyword: (id) => set({ keywords: get().keywords.filter((k) => k.id !== id) }),

  addAudit: (a) => set({ audits: [a, ...get().audits] }),
  removeAudit: (id) => set({ audits: get().audits.filter((a) => a.id !== id) }),
});
