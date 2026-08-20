/* Limbu AI — seeded demo data */
import type { Lead, Post, Tx } from '../store/types';

export const rand = (a: number, b: number) => Math.floor(Math.random() * (b - a + 1)) + a;
export const pick = <T,>(a: T[]): T => a[Math.floor(Math.random() * a.length)];
export const uid = (p = 'id') => `${p}_${Math.random().toString(36).slice(2, 9)}`;
export const daysAgo = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
};

export const CAPTIONS = [
  'Painless root canals, done in a single sitting ✨ Book your slot today.',
  'Your smile deserves the best care in Mumbai. Walk in this week for a free consult.',
  'Invisible aligners now at Sunrise Dental — straighten teeth without anyone noticing.',
  'Kids dental check-ups every Saturday. Gentle, fun and completely painless.',
  'Teeth whitening in 60 minutes. Real results, no sensitivity.',
  'Monsoon offer: full dental check-up + cleaning at ₹499 only.',
];

export const NAMES = ['Rahul Sharma','Priya Nair','Aditya Kulkarni','Sneha Patil','Vikram Shetty','Meera Iyer',
  'Arjun Desai','Fatima Shaikh','Rohit Gupta','Ananya Rao','Karan Malhotra','Divya Menon'];

export const SERVICES = ['Root Canal','Teeth Whitening','Invisible Aligners','Dental Implants','Kids Dentistry','Full Check-up'];

export function seedPosts(): Post[] {
  const st: Post['status'][] = ['posted','posted','scheduled','pending','approved','rejected','posted','pending'];
  const pl = [['google'],['google','facebook'],['instagram'],['facebook','instagram'],
    ['google','instagram','facebook'],['linkedin'],['youtube'],['pinterest']];
  return Array.from({ length: 14 }, (_, i) => ({
    id: uid('post'),
    caption: pick(CAPTIONS),
    status: pick(st),
    platforms: pick(pl),
    type: i % 7 === 0 ? ('video' as const) : ('image' as const),
    ratio: pick(['1:1','4:5','16:9','9:16']),
    theme: pick(['lemon','ocean','sunset','forest','mono']),
    keywords: [],
    mode: i % 3 === 0 ? ('manual' as const) : ('auto' as const),
    bizId: pick(['b1','b1','b2','b3']),
    createdAt: daysAgo(rand(0, 30)),
    stats: { views: rand(120, 4200), likes: rand(8, 320), clicks: rand(3, 180) },
  }));
}

export function seedLeads(): Lead[] {
  const st: Lead['status'][] = ['new','new','contacted','converted','spam','contacted','converted','new'];
  return Array.from({ length: 18 }, (_, i) => ({
    id: uid('lead'), name: NAMES[i % NAMES.length],
    phone: `+91 9${rand(100000000, 999999999)}`,
    email: `${NAMES[i % NAMES.length].split(' ')[0].toLowerCase()}${rand(10, 99)}@gmail.com`,
    service: pick(SERVICES), status: pick(st),
    source: pick(['Website form','Magic QR','Google post','WhatsApp']),
    message: pick(['Need an appointment this weekend.','What is the cost of aligners?','Do you accept insurance?','Please call me back after 6pm.']),
    createdAt: daysAgo(rand(0, 25)),
  }));
}

export function seedTx(): Tx[] {
  const items: [Tx['type'], string, number][] = [
    ['credit','Wallet recharge — Razorpay',5000], ['debit','AI image generation ×12',-240],
    ['debit','Auto post publishing ×8',-160], ['credit','Bonus credits — Professional plan',750],
    ['debit','Competitor rank audit 5×5',-350], ['debit','AI review replies ×22',-110],
    ['credit','Wallet recharge — Razorpay',2000], ['debit','Website builder generation',-500],
  ];
  return items.map(([type, label, amount], i) => ({
    id: uid('tx'), type, label, amount, at: daysAgo(i * 3 + 1), ref: `LMB${rand(100000, 999999)}`,
  }));
}

/** deterministic-ish random walk used for demo charts */
export function series(n: number, base: number, jitter: number) {
  let v = base;
  return Array.from({ length: n }, () => {
    v = Math.max(2, v + (Math.random() - 0.42) * jitter);
    return Math.round(v);
  });
}

export function lastDays(n: number) {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (n - 1 - i));
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  });
}
