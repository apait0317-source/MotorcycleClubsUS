# Monetization and operations checklist

Operator steps that cannot be done from the codebase. Work top to bottom once, then follow the quarterly and weekly sections. Production domain: https://www.usmotorcycleclubs.com. Never commit secret values.

## 1. Vercel

- **Plan:** the project is on Vercel Pro. Hobby prohibits commercial use, so this must stay Pro while ads run.
- **Web Analytics:** Project → Analytics → Enable.
- **Environment variables (Production):**
  - Already set: `RESEND_API_KEY` (production and preview, sensitive). Keep `NEXT_PUBLIC_ADSENSE_ID` and `NEXT_PUBLIC_GA_MEASUREMENT_ID` as they are.
  - **Still to add:** `CONTACT_TO_EMAIL` (the inbox that receives every form; not yet set, so `/contact` and `/submit` cannot send until it exists), `NEXT_PUBLIC_AD_SLOT_INLINE`, `NEXT_PUBLIC_AD_SLOT_SIDEBAR`.
  - Optional: `CONTACT_FROM_EMAIL` once a sending domain is verified in Resend; `NEXT_PUBLIC_AMAZON_AFFILIATE_TAG`.
  - Removed features, so remove their variables (no longer read by any code): every `AUTH_*`, `NEXTAUTH_URL`, `GOOGLE_CLIENT_*`, `DATABASE_URL`, `POSTGRES_*`, `SUPABASE_*`, `NEXT_PUBLIC_SUPABASE_*`, `NEXT_PUBLIC_AD_SLOT_BANNER` (the banner placement was removed).
  - Redeploy after changing variables.
- **Integrations:** the "Instarank" integration provisioned the old Supabase database. Nothing reads it any more. Remove the integration from the project when convenient.

## 2. Resend

1. `RESEND_API_KEY` is already configured. Set `CONTACT_TO_EMAIL` to the address that owns the Resend account, or verify a sending domain (Resend → Domains → Add `usmotorcycleclubs.com`, add the DNS records) and set `CONTACT_FROM_EMAIL` to an address on it, e.g. `US Motorcycle Clubs <forms@usmotorcycleclubs.com>`.
2. Test: submit `/contact` and `/submit` on production. Both emails should arrive within a minute with the sender's address in Reply-To.

## 3. Google AdSense

1. Publisher ID `pub-3750726644611991`, set as `NEXT_PUBLIC_ADSENSE_ID`.
2. **Sites:** `usmotorcycleclubs.com` listed against the canonical host `www.usmotorcycleclubs.com`. Check the approval status each quarter.
3. **ads.txt:** served at `/ads.txt`; AdSense should show *Authorized*.
4. **Ads → By ad unit → Display ads:** two responsive units, `inline` and `sidebar`. Put their `data-ad-slot` values in `NEXT_PUBLIC_AD_SLOT_INLINE` and `NEXT_PUBLIC_AD_SLOT_SIDEBAR`. Until both exist production renders no fixed ad containers.
5. **Auto ads:** enabled. The fixed units are in addition.
6. **Privacy & messaging:** publish the GDPR and US state regulations messages (Google's certified CMP, no code).

Fixed placements in the code:

| Placement | Where | Reserved height |
|---|---|---|
| `inline` | After the intro on state pages; after the second section on guide pages; in-feed every 12 cards on state and city grids | 250px |
| `sidebar` | Sticky on desktop, last block of the sidebar on guide, club, and city pages | 600px |

Home, `/states`, `/cities`, `/guides`, and `/search` carry no fixed units; Auto ads cover them.

## 4. Google Search Console

- The site has been added to Search Console. Confirm ownership is verified and submit the sitemap `https://www.usmotorcycleclubs.com/sitemap.xml`.
- Leave email alerts on.
- Removed routes (`/login`, `/register`, `/dashboard/*`, `/admin/*`, `/claim/*`, `/submit-club`) now 404 and were always `noindex` or disallowed; no redirects needed.

## 5. Amazon Associates

- Tag `usamotorcycle-20` lives in `lib/affiliates.ts`. Links are search URLs, no prices shown.
- Amazon closes accounts without a qualifying sale within 180 days of approval. Check the dashboard date each quarter.
- At roughly 20,000 monthly pageviews, add a gear retailer through Impact or AvantLink. Only `lib/affiliates.ts` changes.

## 6. Later ad networks (traffic gated)

| Network | Entry bar | Source |
|---|---|---|
| Raptive | 25,000 monthly pageviews, half from US/UK/CA/AU/NZ, domain 6+ months old, GA4 installed | https://help.raptive.com/hc/en-us/articles/360032840891 |
| Mediavine Journey | ~1,000 monthly sessions, Grow script installed 30 days | https://www.mediavine.com |

## 7. Weekly health check

`.github/workflows/health-check.yml` runs every Monday 13:17 UTC and on demand (Actions → Weekly health check → Run workflow). It checks `/ads.txt`, `/robots.txt`, `/sitemap.xml`, and twenty sample pages for status 200, canonical host, the AdSense script, and a sitemap count within 10% of the previous run.

- GitHub emails the workflow's author on failure by default. Confirm under GitHub → Settings → Notifications → Actions that "Only notify for failed workflows" is on.
- A failing count check after a deliberate data change is expected once; the next run uses the new baseline.
- Success criterion after launch: four consecutive green weeks.

## 8. Quarterly session

1. `pnpm scrape:all` and `pnpm images:manifest`; review the diff.
2. Add five to ten guides to `lib/guides.ts` (state route guides for the ten largest states, regional event calendars, gear guides tied to affiliate categories).
3. In Search Console, find pages losing clicks and refresh their intros in `lib/state-intros.ts`.
4. Confirm `/ads.txt`, the AdSense consent messages, and the Vercel plan are still correct.
5. `pnpm test && pnpm build`, commit, push.

## 9. Indexing rules

- Club pages are indexed and linked only when they score 3 or more on public detail (`MIN_CLUB_SCORE_FOR_INDEX` in `lib/data.ts`). Others are `noindex`, out of the sitemap, and listed as unlinked text.
- City pages are indexed only with two or more listed clubs.
- Non-club categories (dealers, venues, bars, churches) are never listed.
- Every state page carries an original intro plus data-driven counts and an FAQ.

## 10. Open items

- 340 image files in `public/images/clubs` belong to clubs no longer in `data/clubs.json`. Safe to delete after confirming with `pnpm images:manifest` output.
