import { apiFetch } from './client';

export const postsApi = {
  generateCaption: (body: {
    businessName: string; city?: string; phone?: string; address?: string;
    prompt: string; lang?: 'en' | 'hi'; keywords?: string[];
  }) => apiFetch<{ caption: string }>('/api/posts/generate-caption', { method: 'POST', body: JSON.stringify(body) }),
};
