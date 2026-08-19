# Anshita — start here

Everything you need for your first hour. Read this once, then work from
[TEAM.md](TEAM.md) day to day.

Your branch is **`feat/content-growth`**. Abiram is on `feat/gmb-seo`. Neither of
us pushes to `main` except through a pull request.

---

## 1. Setup — run this once

```sh
git clone https://github.com/leads-digitalmojo/limbu.git
cd limbu
git checkout feat/content-growth
npm install
```

**Set your commit identity before your first commit.** We both push through the
same `leads-digitalmojo` GitHub account, so GitHub cannot tell us apart on its
own — without this, every commit you make will look like it came from me.
Push access and commit authorship are separate: the shared account does the
push, this config decides whose name lands in `git log`.

```sh
git config --local user.name  "Anshita"
git config --local user.email "anshita@limbu.local"
```

`--local` means it applies to this clone only, so it will not disturb git
settings on the rest of your machine.

If you would rather your commits link to your own GitHub profile, use your real
GitHub email instead of the `.local` one. Your call.

Confirm the baseline is clean before you write anything:

```sh
npm run typecheck   # must exit 0
npm run dev         # opens http://localhost:8081
```

If either fails on a fresh clone, tell me before you start — that is a problem
with the baseline, not with you.

---

## 2. What you own

Ten screens, about 1,840 lines. The UI is already built and wired to a fake
backend; your job is to make each one real.

| Screen | File | What is there now | What to build |
|---|---|---|---|
| Post Management | [app/posts/index.tsx](app/posts/index.tsx) | Status tabs, 6 platforms, list | Real publish pipeline, scheduling |
| Magic Post composer | [app/posts/new.tsx](app/posts/new.tsx) | Prompt, EN/हिन्दी, voice, keywords, ratio, live preview | Image generation, caption generation |
| Assets Manager | [app/assets.tsx](app/assets.tsx) | Brand style, colours, logo/character/uniform/background, product gallery | Real uploads + storage |
| Social Connections | [app/social.tsx](app/social.tsx) | Toggles for 7 platforms | OAuth for Facebook, Instagram, LinkedIn, YouTube, Pinterest, WhatsApp |
| Website Builder | [app/website.tsx](app/website.tsx) | 6 templates, section picker, preview, publish | Actual site generation + hosting |
| Website Leads | [app/leads.tsx](app/leads.tsx) | Inbox, pipeline, search, CSV export | Real lead capture from published sites |
| My Profile | [app/profile.tsx](app/profile.tsx) | Profile, verification, credits, activity | Wire to real account data |
| Wallet | [app/wallet.tsx](app/wallet.tsx) | ₹200–₹50,000 packs, bonus credits, GST, history | **Razorpay integration** |
| Subscription | [app/pricing.tsx](app/pricing.tsx) | Basic/Professional/Premium, monthly-yearly, add-ons | Real plan purchase |
| Settings | [app/settings.tsx](app/settings.tsx) | Automation, notifications, language, passkey, theme | Persist to backend |

Plus [components/PostCreative.tsx](components/PostCreative.tsx) — the AI post
creative canvas.

**Your state** lives in three slices. Add fields and actions here, never to
`store/useStore.ts`:

```
store/slices/content.ts   posts, brand
store/slices/growth.ts    leads, websites
store/slices/account.ts   user, transactions, social, settings, notifications
store/types/content.ts    store/types/growth.ts    store/types/account.ts
```

Anything you add to a slice composes into the store automatically. That is the
whole reason the store was split — so we can both add state all day without
touching the same file.

---

## 3. Where the fake backend is

Two places simulate the real thing:

- **`useWork()`** in [components/ui.tsx:196](components/ui.tsx#L196) — a
  `setTimeout` that fakes latency. Every screen uses it for its loading states.
  Replace the timer with your real async call; keep the `busy` / `isBusy` shape
  so the existing spinners keep working.
- **Seed data** in [lib/mock.ts](lib/mock.ts) — the demo posts, leads and
  transactions. Swap for real fetches as you go.

Credit costs are in [lib/nav.ts](lib/nav.ts). The ones in your area:
AI post generation **30**, publish per platform **20**, website generation **500**.

---

## 4. What you must not touch

Editing any of these on your branch is the one thing guaranteed to conflict with
my work:

```
components/ui.tsx      components/Shell.tsx    components/Icon.tsx
components/charts.tsx  theme/tokens.ts         theme/ThemeProvider.tsx
lib/nav.ts             lib/format.ts           lib/mock.ts
app/_layout.tsx        store/useStore.ts       store/slices/shared.ts
store/slices/core.ts   store/types/index.ts    package.json
```

Also **`app/dashboard.tsx` is mine** — it reads from every domain, so it has one
owner on purpose. If you need something surfaced there, ask me.

Need a change in a shared file? Do not put it in `feat/content-growth`. Instead:

```sh
git checkout main && git pull
git checkout -b chore/whatever-it-is
# make the change, small and focused
git push -u origin chore/whatever-it-is
gh pr create --base main
```

Merge it the same day and tell me, so I can rebase.

**`spend()` is in your `account.ts` slice, but I call it from every AI feature
on my side.** Treat its signature as a public API — if it needs to change, tell
me first.

---

## 5. The daily loop

```sh
# every morning — pick up whatever I merged
git pull --rebase origin main

# work, then
npm run typecheck            # must pass — it is the only gate we have
git add -A
git commit -m "Wallet: wire Razorpay order creation"
git push origin feat/content-growth

# when a screen is finished
gh pr create --base main --head feat/content-growth
```

**Step 3 is the one people skip.** Aim for one PR per finished screen — about
ten small merges over the project — not one enormous merge at the end. Your
branch is long-lived: it is not deleted after a PR, you keep working on it.

Two rules that keep this painless:

1. Never push to `main` directly.
2. Announce any new dependency before adding it — `package.json` is shared.
