# Limbu AI

A working front-end build of the Limbu AI SaaS product — all 19 features from the
feature spec, organised as the 7 product systems.

The UI/UX, colour system and typography are taken from **limbu.ai**:

| Token | Value | Source |
|---|---|---|
| Lemon (primary) | `#FACC15` | `--lemon-glow` |
| Lemon hover | `#EAB308` | `--lemon-hover` |
| Lemon ink | `#A16207` | `--lemon-ink` |
| Ink / dark surface | `#0F172B` | slate ink used across the site |
| Surfaces | `#FFFFFF` / `#F8FAFC` | `--deep-charcoal`, page bg |
| Border | `#E2E8F0` | card + section borders |
| Accents | `#3B82F6` `#EC4899` `#10B981` `#6366F1` | feature cards |
| Headings | Montserrat 700/800 | `--font-heading` |
| Body | Inter 400–600 | `--font-sans` |

Dark mode is included (topbar toggle or Settings → Appearance).

## Run

No build step, no dependencies. Open `index.html` in a browser, or:

```sh
python3 -m http.server 8080   # then visit http://localhost:8080
```

## Structure

```
index.html            app shell — sidebar, topbar, command palette, modal, toasts
css/app.css           design system: tokens, components, dark mode, responsive
js/icons.js           ~80 inline stroke icons
js/store.js           state, seeded demo data, localStorage persistence, credit ledger
js/ui.js              toasts, modals, SVG charts (line/bar/donut/sparkline), formatters
js/app.js             hash router, sidebar nav, ⌘K palette, theme, notifications
js/views/*.js         one module per feature area
```

State persists to `localStorage` under `limbu.ai.state.v1`.
Reset it from **Settings → Data → Reset demo data**.

## Feature coverage

| # | Feature | Route | Notes |
|---|---|---|---|
| 1 | Dashboard | `#/dashboard` | Business connection, Quick Launch (8 tools), Live Dashboard, Magic Post onboarding, growth chart, attention queue |
| 2 | Post Management | `#/posts`, `#/posts/new` | AI Auto Post (prompt, EN/हिन्दी, voice, keywords, brand assets, theme, ratio), Manual Post, 6 platforms, live AI preview, status tabs (all/pending/approved/rejected/scheduled/posted/videos) |
| 3 | Review Management | `#/reviews` | Location filter, search, without-reply filter, refresh, force sync, rating breakdown |
| 4 | Website Leads | `#/leads` | Inbox, pipeline (new/contacted/converted/spam), search by name/phone/email/service, CSV export |
| 5 | Magic QR | `#/magic-qr` | QR generation, rating threshold routing (Google vs private feedback), scan stats, print poster |
| 6 | Assets Management | `#/assets` | Brand style, colour theme + custom colour, image ratio, logo/character/uniform/background, product gallery, copy settings, force sync |
| 7 | Keyword Planner | `#/keywords` | Search, volume, difficulty, CPC, save/remove, Excel import, PDF + WhatsApp report, shared with Post Management |
| 8 | Competitor Analysis | `#/competitors` | 1×1/3×3/5×5 Google Maps grid, coverage, avg position, visibility %, competitor table, AI recommendations, grid-point detail, save audit, PDF |
| 9 | GMB Health | `#/gmb-health` | Weighted 10-signal audit, health score, missing information, ordered optimisation plan |
| 10 | GMB Insights | `#/gmb-insights` | Views, searches, calls, direction requests, date range, query breakdown |
| 11 | Website Builder | `#/website` | GMB data import, 6 templates, section picker, live preview, publish to a domain |
| 12 | Review Reply | `#/review-reply` | AI reply generation (rating-aware), editing, approval, auto-reply, bulk reply |
| 13 | Social Connections | `#/social` | Google, Facebook, Instagram, LinkedIn (page/profile), YouTube, Pinterest, WhatsApp |
| 14 | My Profile | `#/profile` | Profile, verification, credits, membership, activity stats, asset stats, transactions, AI images, daily activity |
| 15 | Wallet | `#/wallet` | ₹200–₹50,000 packs, bonus credits, custom amount, GST, order summary, Razorpay, transaction history |
| 16 | User Settings | `#/settings` | Automation, notifications, language, passkey, admin approval, theme, data controls |
| 17 | Global Search | ⌘K / Ctrl+K | Feature + action search, live filtering, keyboard navigation |
| 18 | GMB Connection | `#/gmb-connect` | Google OAuth flow, `business.manage` permissions, business + location selection |
| 19 | Subscription | `#/pricing` | Basic / Professional / Premium, monthly-yearly toggle, add-on services, old-way comparison |

## Credit economy

Actions debit the wallet and write to the transaction ledger:
AI post generation 30 · publish per platform 20 · AI review reply 5 ·
rank audit 5×5 350 (3×3 180, 1×1 60) · website generation 500.
