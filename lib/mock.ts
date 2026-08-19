/* Limbu AI — seeded demo data */
import type { Business, Lead, Post, Review, Keyword, Tx } from '../store/types';

export const rand = (a: number, b: number) => Math.floor(Math.random() * (b - a + 1)) + a;
export const pick = <T,>(a: T[]): T => a[Math.floor(Math.random() * a.length)];
export const uid = (p = 'id') => `${p}_${Math.random().toString(36).slice(2, 9)}`;
export const daysAgo = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
};

export const BUSINESSES: Business[] = [
  { id: 'b1', name: 'Sunrise Dental Care', cat: 'Dental clinic', loc: 'Andheri West, Mumbai', city: 'Mumbai',
    rating: 4.6, reviews: 284, phone: '+91 98200 41120', site: 'sunrisedental.in', verified: true, hours: 'Mon–Sat 09:00–20:00' },
  { id: 'b2', name: 'Sunrise Dental — Bandra', cat: 'Dental clinic', loc: 'Bandra West, Mumbai', city: 'Mumbai',
    rating: 4.4, reviews: 151, phone: '+91 98200 41121', site: 'sunrisedental.in', verified: true, hours: 'Mon–Sat 10:00–21:00' },
  { id: 'b3', name: 'Sunrise Smile Studio', cat: 'Cosmetic dentist', loc: 'Powai, Mumbai', city: 'Mumbai',
    rating: 4.8, reviews: 96, phone: '+91 98200 41122', site: 'sunrisedental.in', verified: false, hours: 'Tue–Sun 11:00–20:00' },
];

export const CAPTIONS = [
  'Painless root canals, done in a single sitting ✨ Book your slot today.',
  'Your smile deserves the best care in Mumbai. Walk in this week for a free consult.',
  'Invisible aligners now at Sunrise Dental — straighten teeth without anyone noticing.',
  'Kids dental check-ups every Saturday. Gentle, fun and completely painless.',
  'Teeth whitening in 60 minutes. Real results, no sensitivity.',
  'Monsoon offer: full dental check-up + cleaning at ₹499 only.',
];

const REVIEW_TEXT: [string, number][] = [
  ['Dr. Mehta was incredibly gentle. Root canal done in one sitting, zero pain.', 5],
  ['Clean clinic, on-time appointments and transparent pricing. Highly recommend.', 5],
  ['Good treatment but the waiting time was almost 40 minutes on a weekday.', 3],
  ['Best dental experience in Andheri. Staff explained everything before starting.', 5],
  ['Charges felt a bit on the higher side, though the work quality is very good.', 4],
  ['Booked for whitening, results were visible the same day. Very happy!', 5],
  ['Reception did not pick up calls twice. Treatment itself was fine.', 2],
  ['My kid actually enjoyed the visit. That says everything.', 5],
  ['Great hygiene standards, modern equipment and friendly doctors.', 5],
  ['Appointment got rescheduled last minute without informing me.', 2],
];

export const NAMES = ['Rahul Sharma','Priya Nair','Aditya Kulkarni','Sneha Patil','Vikram Shetty','Meera Iyer',
  'Arjun Desai','Fatima Shaikh','Rohit Gupta','Ananya Rao','Karan Malhotra','Divya Menon'];

export const SERVICES = ['Root Canal','Teeth Whitening','Invisible Aligners','Dental Implants','Kids Dentistry','Full Check-up'];

export const KEYWORD_SEEDS: [string, number, number][] = [
  ['dentist near me', 18100, 68], ['dental clinic in andheri', 3600, 42], ['root canal cost mumbai', 2900, 55],
  ['best dentist mumbai', 5400, 74], ['teeth whitening andheri', 880, 31], ['invisible aligners india', 1900, 61],
  ['dental implants cost', 4400, 66], ['emergency dentist mumbai', 1300, 38], ['kids dentist near me', 2400, 44],
  ['painless root canal', 720, 26], ['orthodontist andheri west', 590, 29], ['smile makeover mumbai', 480, 47],
  ['24 hour dental clinic', 390, 33], ['dental checkup offer', 260, 19], ['braces cost in mumbai', 3300, 58],
];

export const COMPETITORS = ['Perfect Smile Dental','City Dental Hub','Dr. Kapoor Dental','Bright Teeth Clinic','Elite Dental Studio','Smile Zone Mumbai'];

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
    keywords: [pick(KEYWORD_SEEDS)[0], pick(KEYWORD_SEEDS)[0]],
    mode: i % 3 === 0 ? ('manual' as const) : ('auto' as const),
    bizId: pick(['b1','b1','b2','b3']),
    createdAt: daysAgo(rand(0, 30)),
    stats: { views: rand(120, 4200), likes: rand(8, 320), clicks: rand(3, 180) },
  }));
}

export function seedReviews(): Review[] {
  return Array.from({ length: 16 }, (_, i) => {
    const [text, rating] = REVIEW_TEXT[i % REVIEW_TEXT.length];
    const replied = Math.random() > 0.45;
    return {
      id: uid('rev'), author: NAMES[i % NAMES.length], rating, text,
      bizId: pick(['b1','b1','b2','b3']), createdAt: daysAgo(rand(0, 60)),
      reply: replied ? 'Thank you so much for your kind words! We look forward to seeing you again at Sunrise Dental. 🦷' : null,
      replyAuto: replied && Math.random() > 0.5,
    };
  });
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

export function seedKeywords(): Keyword[] {
  return KEYWORD_SEEDS.slice(0, 6).map(([kw, vol, diff]) => ({
    id: uid('kw'), kw, vol, diff, cpc: (Math.random() * 3 + 0.4).toFixed(2),
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
