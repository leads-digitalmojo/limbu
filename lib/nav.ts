import type { IconName } from '../components/Icon';

export type NavItem = {
  id: string;          // route path, without the leading slash
  label: string;
  icon: IconName;
  desc: string;
  tag?: string;
  countKey?: 'reviews' | 'leads' | 'posts';
};

export const NAV: { group: string; items: NavItem[] }[] = [
  { group: 'Overview', items: [
    { id: 'dashboard', label: 'Dashboard', icon: 'grid', desc: 'Business overview & quick launch' },
  ]},
  { group: 'Google Business Profile', items: [
    { id: 'gmb-connect',  label: 'GMB Connection', icon: 'google',      desc: 'Connect your Google Business Profile' },
    { id: 'gmb-health',   label: 'GMB Health',     icon: 'stethoscope', desc: 'Audit and optimise your profile' },
    { id: 'gmb-insights', label: 'GMB Insights',   icon: 'chart',       desc: 'Views, searches, calls, directions' },
    { id: 'reviews',      label: 'Reviews',        icon: 'star',        desc: 'Manage Google reviews', countKey: 'reviews' },
    { id: 'review-reply', label: 'Review Reply',   icon: 'reply',       desc: 'AI replies, approval & auto-reply' },
    { id: 'magic-qr',     label: 'Magic QR',       icon: 'qr',          desc: 'Collect reviews with a QR code' },
  ]},
  { group: 'AI Content', items: [
    { id: 'posts',  label: 'Post Management', icon: 'send',    desc: 'Auto post, manual post, scheduling', tag: 'AI', countKey: 'posts' },
    { id: 'assets', label: 'Assets Manager',  icon: 'palette', desc: 'Brand style, images & product gallery' },
  ]},
  { group: 'Local SEO', items: [
    { id: 'keywords',    label: 'Keyword Planner',     icon: 'key', desc: 'Search volume, difficulty, saved keywords' },
    { id: 'competitors', label: 'Competitor Analysis', icon: 'map', desc: 'Google Maps grid rank tracking', tag: 'PRO' },
  ]},
  { group: 'Website & Leads', items: [
    { id: 'website', label: 'Website Builder', icon: 'monitor', desc: 'Generate a site from your GMB data' },
    { id: 'leads',   label: 'Website Leads',   icon: 'inbox',   desc: 'Lead inbox and pipeline', countKey: 'leads' },
  ]},
  { group: 'Account', items: [
    { id: 'social',   label: 'Social Connections', icon: 'share',    desc: 'Facebook, Instagram, LinkedIn, YouTube…' },
    { id: 'profile',  label: 'My Profile',         icon: 'user',     desc: 'Account, activity and usage' },
    { id: 'wallet',   label: 'Wallet',             icon: 'wallet',   desc: 'Credits, recharge and transactions' },
    { id: 'pricing',  label: 'Subscription',       icon: 'crown',    desc: 'Plans, services and packages' },
    { id: 'settings', label: 'Settings',           icon: 'settings', desc: 'Account & application settings' },
  ]},
];

export const FLAT = NAV.flatMap((g) => g.items.map((i) => ({ ...i, group: g.group })));

/** extra entries that appear only in the ⌘K palette */
export const PALETTE_ACTIONS = [
  { id: 'posts/new',   label: 'Create a Magic Post', icon: 'wand'   as IconName, desc: 'AI generates caption + image', group: 'Actions' },
  { id: 'keywords',    label: 'Research keywords',   icon: 'search' as IconName, desc: 'Find what customers search for', group: 'Actions' },
  { id: 'competitors', label: 'Run a rank audit',    icon: 'target' as IconName, desc: '5×5 Google Maps grid', group: 'Actions' },
  { id: 'review-reply',label: 'Reply to reviews',    icon: 'reply'  as IconName, desc: 'Reviews without a reply', group: 'Actions' },
  { id: 'wallet',      label: 'Recharge wallet',     icon: 'coin'   as IconName, desc: 'Add credits via Razorpay', group: 'Actions' },
  { id: 'magic-qr',    label: 'Download Magic QR',   icon: 'qr'     as IconName, desc: 'Print-ready review QR', group: 'Actions' },
];

export const PLATFORMS = [
  { k: 'google',    name: 'Google',    icon: 'google'    as IconName, color: '#4285F4' },
  { k: 'facebook',  name: 'Facebook',  icon: 'facebook'  as IconName, color: '#1877F2' },
  { k: 'instagram', name: 'Instagram', icon: 'instagram' as IconName, color: '#E1306C' },
  { k: 'pinterest', name: 'Pinterest', icon: 'pinterest' as IconName, color: '#E60023' },
  { k: 'linkedin',  name: 'LinkedIn',  icon: 'linkedin'  as IconName, color: '#0A66C2' },
  { k: 'youtube',   name: 'YouTube',   icon: 'youtube'   as IconName, color: '#FF0000' },
];

/** post creative colour themes: [from, to] */
export const POST_THEMES: Record<string, [string, string]> = {
  lemon:  ['#FACC15', '#EAB308'],
  ocean:  ['#0EA5E9', '#2563EB'],
  sunset: ['#F97316', '#EC4899'],
  forest: ['#10B981', '#059669'],
  mono:   ['#94A3B8', '#475569'],
};

export const RATIOS = ['1:1', '4:5', '16:9', '9:16'];
export const ratioValue = (r: string) => {
  const [a, b] = r.split(':').map(Number);
  return a / b;
};

/** credit price list, mirrored in the Wallet screen */
export const COSTS = {
  generate: 30,
  publishPerPlatform: 20,
  reviewReply: 5,
  audit: { 1: 60, 3: 180, 5: 350 } as Record<number, number>,
  website: 500,
};
