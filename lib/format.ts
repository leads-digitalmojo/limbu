export const n = (v: number) => (v || 0).toLocaleString('en-IN');
export const inr = (v: number) => `₹${(v || 0).toLocaleString('en-IN')}`;

export const compact = (v: number) => {
  v = v || 0;
  if (v >= 1e7) return `${(v / 1e7).toFixed(1)}Cr`;
  if (v >= 1e5) return `${(v / 1e5).toFixed(1)}L`;
  if (v >= 1000) return `${(v / 1000).toFixed(1)}k`;
  return String(v);
};

export const date = (iso: string) =>
  new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

export const ago = (iso: string) => {
  const s = (Date.now() - new Date(iso).getTime()) / 1000;
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  if (s < 604800) return `${Math.floor(s / 86400)}d ago`;
  return date(iso);
};

export const initials = (s: string) =>
  String(s || '?').split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();

export const fmt = { n, inr, compact, date, ago, initials };
