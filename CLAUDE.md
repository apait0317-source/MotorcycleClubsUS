# CLAUDE.md

Guidance for Claude Code in this repository. Read [README.md](README.md) for setup and [MONETIZATION.md](MONETIZATION.md) for operator steps that code cannot do.

## What this is

US Motorcycle Clubs (https://www.usmotorcycleclubs.com). A directory of about 2,000 motorcycle clubs. Next.js 16 (App Router, Turbopack), React 19, Tailwind CSS 4, TypeScript strict. Hosted on Vercel Pro. Revenue is Google AdSense plus Amazon Associates links. Upkeep target: about one working session per quarter and no daily work.

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

Data tooling (quarterly only): `pnpm scrape:all`, `pnpm images:manifest`. Review `git diff data/` after every scrape, then run `pnpm test`. `tests/lib/states.test.ts` fails if a scrape drops a state from `states.json` (this is how Maine went missing) or writes "PR" as a state name again; the scraper state maps have no entry for Puerto Rico.

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

1. Fixed units render only through `components/AdSlot.tsx`. Two placements exist: `inline` and `sidebar`. Each reserves a minimum height. The sidebar reserves 280px on phones and 600px from the `lg` breakpoint up.
2. In production, `AdSlot` renders nothing until both `NEXT_PUBLIC_ADSENSE_ID` and the placement slot ID exist. Keep that. Never ship an empty ad box.
3. Google forbids ads on pages without publisher content. Source: [Google Publisher Policies](https://support.google.com/publisherpolicies/answer/11112688). So the AdSense loader is **not** in the root layout, which also wraps the 404 page. Each content page renders `<AdSenseLoader />` itself (React hoists it into `<head>`). Content pages are home, `/states`, `/cities`, `/guides`, guide pages, and state, city, and club pages.
4. `/404`, `/about`, `/contact`, `/submit`, `/search`, and the legal pages never render `AdSenseLoader` or `AdSlot`. A page with an `AdSlot` must also render `AdSenseLoader`. `tests/pages/ad-placement.test.ts` enforces both.
5. Thin pages carry no ads. Club, city, and state pages render the loader, the sidebar unit, and the in-content units only when the page is indexable (`indexable && ...`). In-feed units appear only between cards, and a non-indexable page has too few cards to reach one.
6. Home, `/states`, `/cities`, and `/guides` carry the loader but no fixed units. Auto ads cover them.
7. Do not add click bait, "ad" lookalike affiliate blocks, or any copy that asks visitors to click ads.
8. `app/ads.txt/route.ts` serves `/ads.txt`. The health check asserts it. Do not remove it.

### Indexing and content depth

- A club page is indexed and linked only when `clubContentScore` is at least `MIN_CLUB_SCORE_FOR_INDEX` (3) in `lib/data.ts`. Others are `noindex`, left out of the sitemap, and shown as unlinked text on state and city pages.
- A city page is indexed only with two or more listable clubs (`MIN_CITY_CLUBS_FOR_INDEX`).
- A state page is indexed only with at least one listable club (`MIN_STATE_CLUBS_FOR_INDEX`, `isIndexableState`). Today only DC fails. The sitemap, `/states`, and the home grid use `getIndexableStates()`.
- Every indexable state needs an intro of two paragraphs in `lib/state-intros.ts`. A test enforces it.
- Titles use `fitTitle` in `lib/seo.ts`. It keeps the club or city name and location, and drops the ` | US Motorcycle Clubs` suffix when that is the only way to stay near 60 characters. A few long club names still run over. Club meta descriptions come from `clubMetaDescription`. Do not pass `club.description` straight into metadata.
- Non-club categories (bars, dealers, venues, churches) are excluded by `EXCLUDED_CATEGORIES`. Extend that set. Do not delete rows from `clubs.json` to hide them.
- Do not lower these thresholds to grow page count. Thin pages put ad approval at risk.

### Content integrity

- Every number shown to visitors comes from the data files. Never hardcode a count.
- Do not write unverifiable claims ("largest", "most comprehensive", "all 50 states"). `tests/pages/copy-claims.test.ts` blocks a list of banned phrases. Extend that list when you find a new one.
- Do not invent dates. The data has no "added" date field. The home page section "More Clubs to Explore" is a selection, not a recency list.
- Every rating and review count comes from Google (all 541 rated rows carry a Google Maps link). Show it as `formatReviews(n, 'Google')`.
- State intros are factual. Source every road, event, and base name before it goes in. Write no club counts and no rankings.
- Copy rules: plain English, short sentences, no em dashes, no filler.
- Never name the operator, explicitly or implicitly. Do not put a name, location, employer, service history, personal story, or first-person claim ("I", "my") on the site, the About page, or in docs. Do not write "the site owner" or hint at one person or a small team on public pages. "We" is fine as the site's voice.

### Affiliates

- Amazon links are search URLs built by `amazonSearchUrl`. Show no prices (Amazon's agreement allows only live API prices).
- Every affiliate link carries `rel="noopener noreferrer sponsored"` (`AFFILIATE_REL`) and the disclosure from `AFFILIATE_DISCLOSURE`.
- A new program changes `lib/affiliates.ts` only.

### Secrets and environment

- Never commit values. `.env*` is ignored. Variables live in Vercel. The full list is in README.md.
- Never print or log `RESEND_API_KEY`. The contact route logs variable names only.
- Do not decrypt Vercel environment values.

## Known gaps (verify before relying on them)

Found on 2026-10-24. Fix them or update this list.

1. **`hasOriginalDescription` overstates originality.** In an audit, 272 of 488 non-template descriptions matched scraped third-party text verbatim (CVMA 201, WOW 38, sober-riders 20, CSV chapters 13). Treat the score as "has text", not "has original text". Removing credit for copied text would shrink the indexed club pages from 729 to about 474. That needs the owner's decision.
2. **Image rights are unresolved.** 660 rows point to Google-hosted images (363 `lh3.ggpht.com`, 297 `streetviewpixels-pa.googleapis.com`). 1,164 re-hosted `.webp` files sit in `public/images/clubs`. Licensing is unknown. Do not add more Google-sourced images. Removing the image credit would cut indexed club pages to about 615 (about 360 with item 1).
3. **Soft navigation keeps the loader.** The loader is absent on a hard load of `/contact` and the other non-content pages. A visitor who clicks a header link from a content page keeps the script already loaded, and Google's help pages do not say how Auto ads behave then. Add the page exclusions in MONETIZATION.md section 3 as a second layer.
4. **AdSense can override the reserved height.** With a test publisher ID, the AdSense script wrote `height: auto !important; min-height: 0` on the unit's parent. The reservation is a floor until the script runs, not a guarantee. Check cumulative layout shift in PageSpeed Insights after real units go live.
5. **`/search` ships the whole club dataset to the browser** (about 1.7 MB, 311 KB gzipped). It is `noindex` and disallowed in `robots.txt`, so the impact is low.
6. **340 image files belong to clubs no longer in `clubs.json`.** See MONETIZATION.md section 10.
7. **Thin state pages are indexed and carry ads.** The rule is one listable club, so Montana (one) and Maine (two) qualify. Raise `MIN_STATE_CLUBS_FOR_INDEX` if AdSense reviewers call them thin.
8. **The Terms of Service forbid scraping,** while the site's own data came from scraping. Ask the owner whether to reword.

## Working conventions

- Commit style is Conventional Commits with a scope: `feat(ads):`, `fix(contact):`, `docs:`, `test:`, `chore:`.
- Write a test first for logic in `lib/` or `app/api/`. Tests use `node:test` and `node:assert/strict`, and sit in `tests/{api,components,lib,pages,scripts}`.
- Keep components server-rendered. Add `'use client'` only for state, effects, or browser APIs (today: `Header`, `HeroSearch`, `ClubCard`, `ClubImage`, `ClubImageGallery`, `AdSlot`, `GoogleAnalytics`, `SubmitForm`, the contact and search pages).
- Styling is Tailwind utility classes. Accent is `amber-500` and `amber-600`. Neutrals are the `gray` scale. Do not add a component library.
- Comments explain why, not what. Match the surrounding density.
- Vercel deploys from `main`. Develop on the branch you were given. Open a pull request only when asked.
- The weekly health check (`.github/workflows/health-check.yml`) fails on a non-200 page, a wrong canonical host, a sitemap count that moves more than 10%, a missing ad script on a content page, or an ad script on `/about`, `/contact`, `/submit`, the legal pages, `/search`, or the 404 page. After a deliberate data change, expect one red run. Which pages it fetches is `pickSample` in `scripts/health-check-lib.mjs`, and a test pins that list.

## Quarterly session

Follow MONETIZATION.md section 8. In short: scrape, refresh the image manifest, review the diff, add 5 to 10 guides, refresh state intros for pages that lose clicks in Search Console, confirm AdSense and Vercel settings, run the four checks above, push.
