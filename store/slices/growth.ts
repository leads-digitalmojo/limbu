/* Website builder and lead inbox.
   OWNER: Anshita */
import { daysAgo, seedLeads, uid } from '../../lib/mock';
import type { Lead, Website } from '../types';
import type { Slice } from './shared';

export type GrowthState = {
  leads: Lead[];
  websites: Website[];
};

export const initialGrowth = (): GrowthState => ({
  leads: seedLeads(),
  websites: [{
    id: uid('site'), name: 'Sunrise Dental Care', template: 'Medical Pro',
    domain: 'sunrisedental.limbu.site', status: 'live', pages: 6, leads: 34, createdAt: daysAgo(21),
  }],
});

export type GrowthActions = {
  updateLead: (id: string, p: Partial<Lead>) => void;
};

export const createGrowth: Slice<GrowthActions> = (set, get) => ({
  updateLead: (id, p) => set({ leads: get().leads.map((l) => (l.id === id ? { ...l, ...p } : l)) }),
});
