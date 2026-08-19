# Limbu AI

Limbu AI as an **Expo / React Native** app — one codebase that runs in the browser
(via `react-native-web`) and as real iOS and Android apps. All 19 features from the
feature spec, organised as the 7 product systems.

## Run

```sh
npm install
npm run dev        # browser  → http://localhost:8081
npm run dev:native # QR code for Expo Go; press i / a for simulators
npm run ios        # straight to the iOS simulator
npm run android    # straight to the Android emulator
npm run typecheck  # tsc --noEmit
```

`npm run dev` is the everyday loop: Metro with hot reload in the browser.
Pass Expo flags through after `--`, e.g. `npm run dev -- --port 3000` or
`npm run dev -- --clear` to reset the Metro cache.

## Design system

Ported from **limbu.ai** — the values below were read out of the live site's CSS,
not eyeballed:

| Token | Value | Origin |
|---|---|---|
| Lemon (primary) | `#FACC15` | `--lemon-glow` |
| Lemon hover | `#EAB308` | `--lemon-hover` |
| Lemon ink | `#A16207` | `--lemon-ink` |
| Ink / dark surface | `#0F172B` | slate ink used across the site |
| Surfaces | `#FFFFFF` / `#F8FAFC` | page + section backgrounds |
| Border | `#E2E8F0` | card borders |
| Accents | `#3B82F6` `#EC4899` `#10B981` `#6366F1` | feature cards |
| Headings | Montserrat 700/800 | `--font-heading` |
| Body | Inter 400–600 | `--font-sans` |

Light and dark palettes both live in [theme/tokens.ts](theme/tokens.ts) and are read
through `useTheme()`. Montserrat/Inter load from Google Fonts on web; native falls
back to the system face (swap in `expo-font` if you want the exact faces on device).

## Structure

```
app/                  expo-router file routes — one file per feature screen
  _layout.tsx         theme provider, font loading, Shell, hydration gate
  posts/index.tsx     post management
  posts/new.tsx       Magic Post composer
components/
  Shell.tsx           sidebar, topbar, ⌘K palette, modal + toast hosts
  ui.tsx              Card, Button, Badge, Chip, Tabs, Input, Select, Grid, Cols…
  charts.tsx          Line, Bar, Donut, Sparkline — react-native-svg, no chart lib
  Icon.tsx            88 lucide-style icons as SVG paths
  PostCreative.tsx    the AI post creative canvas
  QrCode.tsx          deterministic Magic QR rendering
  ReviewsScreen.tsx   shared body behind /reviews and /review-reply
store/
  useStore.ts         zustand + AsyncStorage persistence, credit ledger
  ui.ts               toasts, modal stack, palette, drawer
lib/                  format helpers, seeded demo data, nav config, credit prices
legacy/               the original vanilla HTML/CSS/JS prototype (reference only —
                      safe to delete once you are happy with this build)
```

State persists through `AsyncStorage` (localStorage on web) under `limbu.ai.state.v1`.
Reset it from **Settings → Data → Reset demo data**.

## Responsive behaviour

One layout adapts across three widths: a persistent sidebar at ≥1024px, a slide-in
drawer below that, and single-column grids below 760px. `Grid` and `Cols` collapse on
measured width rather than CSS media queries, so the same components work on device.

## Feature coverage

| # | Feature | Route | Notes |
|---|---|---|---|
| 1 | Dashboard | `/dashboard` | Business connection, Quick Launch, Live Dashboard, Magic Post onboarding, growth chart, attention queue |
| 2 | Post Management | `/posts`, `/posts/new` | AI Auto Post (prompt, EN/हिन्दी, voice, keywords, brand assets, theme, ratio), Manual Post, 6 platforms, live preview, status tabs |
| 3 | Review Management | `/reviews` | Location filter, search, without-reply filter, refresh, force sync, rating breakdown |
| 4 | Website Leads | `/leads` | Inbox, pipeline, search by name/phone/email/service, CSV export |
| 5 | Magic QR | `/magic-qr` | QR generation, rating-threshold routing, scan stats, print poster |
| 6 | Assets Management | `/assets` | Brand style, colour theme, image ratio, logo/character/uniform/background, product gallery, copy settings, force sync |
| 7 | Keyword Planner | `/keywords` | Search, volume, difficulty, CPC, save/remove, Excel import, PDF + WhatsApp report |
| 8 | Competitor Analysis | `/competitors` | 1×1/3×3/5×5 Maps grid, coverage, avg position, visibility, competitor table, AI recommendations, grid-point detail, save audit, PDF |
| 9 | GMB Health | `/gmb-health` | Weighted 10-signal audit, health score, missing information, optimisation plan |
| 10 | GMB Insights | `/gmb-insights` | Views, searches, calls, directions, date range, query breakdown |
| 11 | Website Builder | `/website` | GMB import, 6 templates, section picker, live preview, publish |
| 12 | Review Reply | `/review-reply` | Rating-aware AI replies, editing, approval, auto-reply, bulk reply |
| 13 | Social Connections | `/social` | Google, Facebook, Instagram, LinkedIn (page/profile), YouTube, Pinterest, WhatsApp |
| 14 | My Profile | `/profile` | Profile, verification, credits, membership, activity, asset stats, transactions |
| 15 | Wallet | `/wallet` | ₹200–₹50,000 packs, bonus credits, custom amount, GST, Razorpay, history |
| 16 | User Settings | `/settings` | Automation, notifications, language, passkey, admin approval, theme, data |
| 17 | Global Search | ⌘K / Ctrl+K | Feature + action search, live filtering, keyboard navigation |
| 18 | GMB Connection | `/gmb-connect` | Google OAuth flow, `business.manage` scopes, business + location selection |
| 19 | Subscription | `/pricing` | Basic / Professional / Premium, monthly-yearly toggle, add-on services, comparison |

## Credit economy

Every AI action debits the wallet and writes to the transaction ledger
(prices in [lib/nav.ts](lib/nav.ts)):
AI post generation 30 · publish per platform 20 · AI review reply 5 ·
rank audit 5×5 350 (3×3 180, 1×1 60) · website generation 500.

## Backend seams

The UI is fully wired; every backend call is simulated in `store/useStore.ts` and the
screens' `useWork()` timers. The integrations to build first are Google OAuth +
Business Profile API, the Maps rank scrape, image generation, and Razorpay.
