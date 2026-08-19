# Working in parallel

Two people, two branches. Branches alone do **not** prevent conflicts — conflicts
happen at merge time on files both people edited. What prevents them is file
ownership. Stay inside your column below and merges stay trivial.

## Ownership

| Area | Person A — `feat/gmb-seo` | Person B — `feat/content-growth` |
|---|---|---|
| Screens | `app/dashboard.tsx`, `gmb-connect`, `gmb-health`, `gmb-insights`, `reviews`, `review-reply`, `magic-qr`, `keywords`, `competitors` | `app/posts/index`, `app/posts/new`, `assets`, `social`, `website`, `leads`, `profile`, `wallet`, `pricing`, `settings` |
| Components | `components/ReviewsScreen.tsx`, `components/QrCode.tsx` | `components/PostCreative.tsx` |
| Store slices | `store/slices/gmb.ts`, `store/slices/seo.ts` | `store/slices/content.ts`, `store/slices/growth.ts`, `store/slices/account.ts` |
| Types | `store/types/gmb.ts`, `store/types/seo.ts` | `store/types/content.ts`, `store/types/growth.ts`, `store/types/account.ts` |
| Backends | Google OAuth + Business Profile API, review sync, Maps rank scrape, keyword volume | Image generation, platform publishing, social OAuth, Razorpay, site generation |

`app/dashboard.tsx` reads from every domain, so it has exactly one owner (A) on
purpose. If B needs something surfaced there, ask A rather than editing it.

## Shared core — frozen

Nobody edits these on a feature branch:

```
components/ui.tsx      components/Shell.tsx    components/Icon.tsx
components/charts.tsx  theme/tokens.ts         theme/ThemeProvider.tsx
lib/nav.ts             lib/format.ts           lib/mock.ts
app/_layout.tsx        store/useStore.ts       store/slices/shared.ts
store/slices/core.ts   store/types/index.ts    package.json
```

Need a change there? Small `chore/…` branch off `main`, merge it to `main` the
same day, tell the other person, both rebase. Never bundle a shared-core change
inside a feature branch — that is the one thing guaranteed to conflict.

## Rules

1. Rebase on `main` at the start of every working day: `git pull --rebase origin main`.
2. Merge your own work to `main` in small slices — one feature at a time, not one
   giant branch at the end.
3. Run `npm run typecheck` before every push. It is the only gate you have.
4. Adding state: put it in the slice you own and it composes automatically. Do not
   add fields to `store/useStore.ts`.
5. `package.json` is shared. Announce any dependency you add before you add it.
