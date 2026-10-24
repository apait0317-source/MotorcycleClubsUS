# CLAUDE.md

Guidance for Claude Code in this repository. Read [README.md](README.md) for setup and [MONETIZATION.md](MONETIZATION.md) for operator steps that code cannot do.

## What this is

US Motorcycle Clubs (https://www.usmotorcycleclubs.com). A directory of about 2,000 motorcycle clubs. Next.js 16 (App Router, Turbopack), React 19, Tailwind CSS 4, TypeScript strict. Hosted on Vercel Pro. Revenue is Google AdSense plus Amazon Associates links. The owner wants about one working session per quarter and no daily upkeep.

## Commands

Use Node 22 and pnpm 10.

```bash
pnpm install --frozen-lockfile
pnpm dev            # http://localhost:3000
pnpm test           # node:test via tsx, tests/**/*.test.ts
pnpm typecheck      # tsc --noEmit
pnpm lint:app       # eslint app components lib (use this, not pnpm lint)
pnpm build          # prerenders about 3,400 pages in about 30 seconds
pnpm health         # production check; SITE_URL=... to aim at a preview
```

Before every push, run `pnpm test && pnpm typecheck && pnpm lint:app && pnpm build`. All four pass on `main` today. Do not push on red.

Data tooling (quarterly only): `pnpm scrape:all`, `pnpm images:manifest`. Review `git diff data/` after every scrape.

## Architecture

- **Static only.** Every public page is prerendered from JSON at build time. There are no runtime data calls, no database, no accounts, no sessions. Do not add `next-auth`, Prisma, Supabase, or any login. They were removed on purpose (see `docs/plans/2026-10-16-low-maintenance-monetization-design.md`).
- **Data:** `data/clubs.json` (master list), `data/cities.json`, `data/states.json`, `data/images.json`. Other `data/scraped-*.json` files are scraper intermediates. Only `lib/data.ts` reads the master files.
- **One API route:** `app/api/contact/route.ts`. It validates, drops honeypot hits, and emails the owner through Resend (`lib/contact.ts`, `lib/email.ts`). It stores nothing.
- **Config files, not components, hold business settings:** `lib/ads.ts` (AdSense), `lib/affiliates.ts` (Amazon), `lib/guides.ts` (articles), `lib/state-intros.ts` (state editorial).
- **Routes:** `/`, `/states`, `/state/[code]`, `/cities`, `/city/[state]/[city]`, `/clubs/[slug]`, `/guides`, `/guides/[slug]`, `/search`, `/contact`, `/submit`, and the legal pages. `app/clubs/[slug]` sets `dynamicParams = false`, and a test enforces it.
- **Path alias:** `@/` maps to the repository root.
- **Next 16 detail:** route `params` is a `Promise`. Await it.

## Rules that must hold

### Ads (AdSense)

1. Ads render only through `components/AdSlot.tsx`. Two placements exist: `inline` and `sidebar`. Each reserves a minimum height to protect layout stability.
2. In production, `AdSlot` renders nothing until both `NEXT_PUBLIC_ADSENSE_ID` and the placement slot ID exist. Keep that. Never ship an empty ad box.
3. Google forbids ads on pages without publisher content. Never add an `AdSlot` to `/404`, `/contact`, `/submit`, `/search`, thank-you states, or legal pages. Source: [Google Publisher Policies](https://support.google.com/publisherpolicies/answer/11112688).
4. Home, `/states`, `/cities`, `/guides`, and `/search` carry no fixed units. Auto ads cover them.
5. Do not add click bait, "ad" lookalike affiliate blocks, or any copy that asks visitors to click ads.
6. `app/ads.txt/route.ts` serves `/ads.txt`. The health check asserts it. Do not remove it.

### Indexing and content depth

- A club page is indexed and linked only when `clubContentScore` is at least `MIN_CLUB_SCORE_FOR_INDEX` (3) in `lib/data.ts`. Others are `noindex`, left out of the sitemap, and shown as unlinked text on state and city pages.
- A city page is indexed only with two or more listable clubs (`MIN_CITY_CLUBS_FOR_INDEX`).
- Non-club categories (bars, dealers, venues, churches) are excluded by `EXCLUDED_CATEGORIES`. Extend that set. Do not delete rows from `clubs.json` to hide them.
- Do not lower these thresholds to grow page count. Thin pages put ad approval at risk.

### Content integrity

- Every number shown to visitors comes from the data files. Never hardcode a count.
- Do not write unverifiable claims ("largest", "most comprehensive", "all 50 states") unless the data supports them.
- Do not invent dates. The data has no "added" date field.
- Ratings and review counts come from third-party sources. Label them as such when you touch the UI.
- Copy rules: plain English, short sentences, no em dashes, no filler.

### Affiliates

- Amazon links are search URLs built by `amazonSearchUrl`. Show no prices (Amazon's agreement allows only live API prices).
- Every affiliate link carries `rel="noopener noreferrer sponsored"` (`AFFILIATE_REL`) and the disclosure from `AFFILIATE_DISCLOSURE`.
- A new program changes `lib/affiliates.ts` only.

### Secrets and environment

- Never commit values. `.env*` is ignored. Variables live in Vercel. The full list is in README.md.
- Never print or log `RESEND_API_KEY`. The contact route logs variable names only.
- Do not decrypt Vercel environment values.

## Known gaps (verify before relying on them)

These were found on 2026-10-24. Fix them or update this list.

1. **Maine is missing from `data/states.json`.** `clubs.json` holds 4 Maine clubs. `/state/me` returns 404 in production, yet club pages link to it. `tests/smoke.test.ts` asserts exactly 51 states, so adding Maine means updating that test to 52.
2. **`/state/dc` is built and in the sitemap with zero clubs.** `/state/pr` has no entry in `lib/state-intros.ts`. `/state/mt` lists one club. Decide to fill, merge, or `noindex` these.
3. **`hasOriginalDescription` overstates originality.** In an audit, 272 of 488 non-template descriptions matched scraped third-party text verbatim (CVMA 201, WOW 38, sober-riders 20, CSV chapters 13). Treat the score as "has text", not "has original text".
4. **Image rights are unresolved.** 660 rows point to Google-hosted images (363 `lh3.ggpht.com`, 297 `streetviewpixels-pa.googleapis.com`). 1,164 re-hosted `.webp` files sit in `public/images/clubs`. Licensing is unknown. Do not add more Google-sourced images.
5. **`getRecentClubs` uses file order, not a date.** The home page "Recently Added" label is therefore not literally true.
6. **`AdSlot` reserves 600px for `sidebar` on all screen sizes.** On mobile the sidebar stacks at the page bottom, so an unfilled unit leaves a 600px gap.
7. **`/search` ships the whole club dataset to the browser** (about 1.7 MB, 311 KB gzipped). It is `noindex` and disallowed in `robots.txt`, so the impact is low.
8. **340 image files belong to clubs no longer in `clubs.json`.** See MONETIZATION.md section 10.
9. **Meta descriptions:** 40 indexable club pages have a description under 70 characters (for example "Motorcycle Club") and 325 are over 160. `generateMetadata` in `app/clubs/[slug]/page.tsx` passes `club.description` through unchanged.

## Working conventions

- Commit style is Conventional Commits with a scope: `feat(ads):`, `fix(contact):`, `docs:`, `test:`, `chore:`.
- Write a test first for logic in `lib/` or `app/api/`. Tests use `node:test` and `node:assert/strict`, and sit in `tests/{api,components,lib,pages,scripts}`.
- Keep components server-rendered. Add `'use client'` only for state, effects, or browser APIs (today: `Header`, `HeroSearch`, `ClubCard`, `ClubImage`, `ClubImageGallery`, `AdSlot`, `GoogleAnalytics`, `SubmitForm`, the contact and search pages).
- Styling is Tailwind utility classes. Accent is `amber-500` and `amber-600`. Neutrals are the `gray` scale. Do not add a component library.
- Comments explain why, not what. Match the surrounding density.
- Vercel deploys from `main`. Develop on the branch you were given. Open a pull request only when asked.
- The weekly health check (`.github/workflows/health-check.yml`) fails on a non-200 page, a wrong canonical host, a missing ad script, or a sitemap count that moves more than 10%. After a deliberate data change, expect one red run.

## Quarterly session

Follow MONETIZATION.md section 8. In short: scrape, refresh the image manifest, review the diff, add 5 to 10 guides, refresh state intros for pages that lose clicks in Search Console, confirm AdSense and Vercel settings, run the four checks above, push.
