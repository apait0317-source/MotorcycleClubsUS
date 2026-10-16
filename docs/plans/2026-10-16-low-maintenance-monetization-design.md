# Low-maintenance monetization design

Date: 2026-10-16
Status: approved for planning
Scope: usmotorcycleclubs.com (Next.js 16 on Vercel)

## Goal

Run the directory as an ad-supported site that needs one working session per quarter and no day-to-day attention. Revenue comes from display ads and affiliate links. No user accounts, no moderation queue, no database.

## Decision

Keep Next.js on Vercel and remove the database layer. Framework migration was rejected as unnecessary. Keeping community features was rejected because they add upkeep and depend on a database the owner cannot access.

## Approaches considered

| Approach | Verdict | Reason |
|---|---|---|
| Strip database, keep Next.js | Chosen | Smallest diff, keeps image optimization and host redirects, no new platform |
| Static export to Cloudflare Pages | Fallback | Free commercial hosting, but loses image optimization and needs a third-party form service. Use only if Vercel plan cost matters |
| Keep runtime and database, automate moderation | Rejected | Highest upkeep; database is owned by the Instarank integration |

## Architecture after the change

- Data: `data/clubs.json`, `data/cities.json`, `data/states.json`, `data/images.json`. All read at build time.
- Rendering: every public page prerendered at build, including all club pages. No on-demand generation, no runtime database calls.
- Forms: one API route, `/api/contact`, that validates, applies the honeypot, and sends an email through Resend. Nothing stored.
- Config: `lib/ads.ts` holds AdSense publisher and slot IDs; `lib/affiliates.ts` holds affiliate tags and link builders.
- Content: `lib/guides.ts` (articles) and `lib/state-intros.ts` (state editorial). Both are data files edited in the quarterly session.

## Removals

- Packages: `next-auth`, `@auth/prisma-adapter`, `@prisma/client`, `prisma`, `bcryptjs`.
- Routes: `/login`, `/register`, `/dashboard/**`, `/admin/**`, `/claim/**`, `/api/auth/**`, `/api/admin/**`, `/api/user/**`, `/api/favorites`, `/api/reviews`, `/api/claims`, `/api/clubs/**`, `/api/newsletter`.
- Components: `ClaimButton`, `FavoriteButton`, `ClubActions`, `ReviewForm`, `ReviewList`, `NotificationBell`, `NewsletterForm`, `SessionProvider`.
- Files: `prisma/`, `dev.db`, `prisma/dev.db`, `lib/auth.ts`, `lib/db.ts`, `types/next-auth.d.ts`.
- Vercel environment variables: all `AUTH_*`, `NEXTAUTH_URL`, `GOOGLE_CLIENT_*`, `DATABASE_URL`, `POSTGRES_*`, `SUPABASE_*`, `NEXT_PUBLIC_SUPABASE_*`. Add `RESEND_API_KEY` and `CONTACT_TO_EMAIL`.
- Header: Sign In, Sign Up, and Add Club become a single "Submit a Club" link.
- Club page: Save and Claim buttons become "Suggest a correction", linking to the contact form with the club name prefilled.
- Footer: newsletter block removed.

## Ads

- Auto ads remain on in AdSense.
- Three fixed responsive units, each with a reserved minimum height to protect layout stability:
  - `inline` after the intro on state pages and after the second section on guide pages.
  - `sidebar` sticky on desktop for guide, club, and city pages.
  - `inline` in-feed every twelve cards on state and city grids.
- Slot IDs come from `NEXT_PUBLIC_AD_SLOT_*`. Nothing renders in production until they exist.
- Apply to Raptive at 25,000 monthly pageviews with half from US, UK, CA, AU, NZ. Prerequisites already met: domain older than six months by then, GA4 installed, original content.

## Affiliate

- Amazon Associates remains the default. Links are search URLs; no prices shown.
- When monthly pageviews pass roughly 20,000, add a motorcycle gear retailer program through Impact or AvantLink. Only `lib/affiliates.ts` changes.

## Content cadence (one session per quarter)

1. `pnpm scrape:*` and `pnpm images:manifest` to refresh data, then review the diff.
2. Add five to ten guides to `lib/guides.ts`. Candidates: state route guides for the ten largest states, event calendars by region, gear guides tied to affiliate categories.
3. Check Search Console for pages losing clicks and refresh their intros.
4. Confirm ads.txt, consent messages, and the Vercel plan are still correct.

## Monitoring

- Vercel Web Analytics on.
- A weekly automated check (GitHub Actions cron) that requests `/ads.txt`, `/robots.txt`, `/sitemap.xml`, and twenty sample pages, asserts status 200, canonical host, ad script presence, and sitemap count within 10 percent of the last run. Emails only on failure.
- Search Console email alerts left on.

## Risks

- Vercel Hobby plan prohibits commercial use. Confirm the project is on Pro before relying on it. If not, upgrade or move to the Cloudflare Pages fallback.
- Removing accounts deletes any existing user data in the Instarank-owned database. There is no evidence of real users, but confirm before the migration ships.
- Amazon Associates closes accounts without a qualifying sale within 180 days of approval.
- AdSense re-review is not guaranteed. Content and indexing hygiene are the levers; nothing in this design depends on a specific review outcome.

## Success criteria

- Zero runtime dependencies beyond Vercel and Resend.
- Build passes with all public pages prerendered.
- Contact and submission emails arrive in the owner inbox within one minute.
- No page shows an empty ad container when slot IDs are unset.
- Weekly check green for four consecutive weeks after launch.
