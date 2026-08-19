/* Website & leads domain — owner: Anshita */

export type LeadStatus = 'new' | 'contacted' | 'converted' | 'spam';

export type Lead = {
  id: string; name: string; phone: string; email: string; service: string;
  status: LeadStatus; source: string; message: string; createdAt: string;
};

export type Website = {
  id: string; name: string; template: string; domain: string;
  status: 'live' | 'draft'; pages: number; leads: number; createdAt: string;
};
