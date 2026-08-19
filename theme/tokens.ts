/* Limbu AI — design tokens, ported from limbu.ai */

export const palette = {
  lemon: '#FACC15',
  lemonHover: '#EAB308',
  lemonInk: '#A16207',
  ink: '#0F172B',
  blue: '#3B82F6',
  indigo: '#6366F1',
  pink: '#EC4899',
  emerald: '#10B981',
  orange: '#F97316',
  red: '#EF4444',
  sky: '#0EA5E9',
};

export type Scheme = 'light' | 'dark';

const light = {
  ...palette,
  lemonSoft: '#FEF9C3',
  onLemon: '#0F172B',
  text: '#0F172B',
  text2: '#475569',
  text3: '#64748B',
  muted: '#94A3B8',
  bg: '#F6F8FB',
  surface: '#FFFFFF',
  surface2: '#F8FAFC',
  surface3: '#F1F5F9',
  line: '#E2E8F0',
  line2: '#EDF2F7',
  greenSoft: '#ECFDF5',
  blueSoft: '#EFF6FF',
  pinkSoft: '#FDF2F8',
  indigoSoft: '#EEF2FF',
  orangeSoft: '#FFF7ED',
  redSoft: '#FEF2F2',
  amberSoft: '#FFFBEB',
  greenText: '#059669',
  blueText: '#2563EB',
  pinkText: '#DB2777',
  indigoText: '#4F46E5',
  orangeText: '#EA580C',
  redText: '#DC2626',
  amberText: '#B45309',
  scrim: 'rgba(15,23,43,0.45)',
};

const dark: typeof light = {
  ...light,
  ink: '#F8FAFC',
  onLemon: '#0F172B',
  text: '#F1F5F9',
  text2: '#CBD5E1',
  text3: '#94A3B8',
  muted: '#64748B',
  bg: '#0B1220',
  surface: '#111A2C',
  surface2: '#0F1728',
  surface3: '#1A2540',
  line: '#22304C',
  line2: '#1B2740',
  lemonSoft: '#3B2F05',
  greenSoft: '#0C2F26',
  blueSoft: '#132A4E',
  pinkSoft: '#3B1230',
  indigoSoft: '#1E1F4B',
  orangeSoft: '#3A210C',
  redSoft: '#3B1518',
  amberSoft: '#3B2F05',
  greenText: '#34D399',
  blueText: '#60A5FA',
  pinkText: '#F472B6',
  indigoText: '#818CF8',
  orangeText: '#FB923C',
  redText: '#F87171',
  amberText: '#FCD34D',
  scrim: 'rgba(2,6,20,0.66)',
};

export const colorsFor = (s: Scheme) => (s === 'dark' ? dark : light);
export type Colors = typeof light;

export const radius = { sm: 8, md: 12, lg: 16, xl: 22, pill: 999 };
export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 26 };

/* Montserrat/Inter are web-font-loaded on web; native falls back to the system face */
export const fonts = {
  heading: 'Montserrat, Inter, system-ui, -apple-system, sans-serif',
  body: 'Inter, system-ui, -apple-system, sans-serif',
};

export const SIDEBAR_W = 264;
export const TOPBAR_H = 66;
/* below this width the sidebar becomes a drawer and grids collapse */
export const BREAK_MD = 1024;
export const BREAK_SM = 760;
