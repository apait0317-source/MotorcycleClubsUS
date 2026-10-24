# US Motorcycle Clubs

Directory of motorcycle clubs across the United States. Next.js 16 on Vercel, fully prerendered from JSON data, ad-supported, no database and no sign-in.

**Live site:** https://www.usmotorcycleclubs.com

## How it works

- **Data:** `data/clubs.json`, `data/cities.json`, `data/states.json`, `data/images.json`. Read at build time only.
- **Rendering:** every public page is prerendered at build, including all 2,100+ club pages. There are no runtime data calls.
- **Forms:** `/contact` and `/submit` post to `POST /api/contact`, which validates, drops honeypot hits, and emails the owner through Resend. Nothing is stored.
- **Ads:** `lib/ads.ts` defines two fixed placements (`inline`, `sidebar`) with reserved heights. `components/AdSlot.tsx` renders them. `components/AdSenseLoader.tsx` loads the AdSense script, and only content pages render it (never the 404 page, forms, search, or legal pages). Thin pages carry no ads. Auto ads stay on in AdSense.
- **Affiliate links:** `lib/affiliates.ts` holds the Amazon tag, product list, and link builder. `components/AffiliateSection.tsx` only renders it.
- **Content:** `lib/guides.ts` (articles) and `lib/state-intros.ts` (state editorial) are data files.
- **Monitoring:** `.github/workflows/health-check.yml` runs `scripts/health-check.mjs` weekly.

## Project structure

```
app/
  page.tsx                      Home
  states/page.tsx               All states
  state/[code]/page.tsx         State hub (intro, cities, clubs, FAQ)
  cities/page.tsx               All indexable cities
  city/[state]/[city]/page.tsx  City listing
  clubs/[slug]/page.tsx         Club page (all prerendered)
  guides/                       Rider guides
  contact/, submit/             Forms (email only)
  api/contact/route.ts          The one API route
  sitemap.ts, robots.ts, ads.txt/route.ts
components/                     UI; AdSenseLoader, AdSlot, and AffiliateSection are the monetization pieces
lib/
  data.ts, images.ts, utils.ts  Data access and helpers
  seo.ts                        Title fitting and club meta descriptions
  ads.ts, affiliates.ts         Monetization config
  contact.ts, email.ts          Form validation and Resend sender
  guides.ts, state-intros.ts    Editorial content
data/                           JSON data files
scripts/                        Scrapers, image tooling, health check
tests/                          node:test suites run with tsx
```

## Development

Requires Node 22 and pnpm 10.

```bash
pnpm install
pnpm dev          # http://localhost:3000
pnpm test         # unit tests (tsx --test)
pnpm typecheck    # tsc --noEmit
pnpm lint:app     # eslint app components lib
pnpm build        # full static build, prerenders every page
```

## Environment variables

Set in Vercel → Project → Settings → Environment Variables. Never commit values.

| Variable | Required | Purpose |
|---|---|---|
| `NEXT_PUBLIC_ADSENSE_ID` | yes | AdSense publisher ID (digits, or `pub-…`). Enables the script tag and `/ads.txt`. |
| `NEXT_PUBLIC_AD_SLOT_INLINE` | for ads | Ad unit ID for in-content and in-feed placements. |
| `NEXT_PUBLIC_AD_SLOT_SIDEBAR` | for ads | Ad unit ID for the sticky sidebar placement. |
| `RESEND_API_KEY` | yes | Resend API key for form email. Set in Vercel (production and preview) as a sensitive variable. |
| `CONTACT_TO_EMAIL` | yes | Inbox that receives contact and submission email. Forms return an error until this is set. |
| `CONTACT_FROM_EMAIL` | no | Sender address on a Resend-verified domain. Defaults to `onboarding@resend.dev`. |
| `NEXT_PUBLIC_AMAZON_AFFILIATE_TAG` | no | Amazon Associates tag. Defaults to the value in `lib/affiliates.ts`. |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | no | Google Analytics 4 measurement ID. |
| `NEXT_PUBLIC_SITE_URL` | no | Canonical origin. Defaults to `https://www.usmotorcycleclubs.com`. |

Ad placements render nothing in production until the publisher ID and the matching slot ID both exist.

## Updating data

Quarterly session, in order:

1. `pnpm scrape:all` (and the `scrape:riderclubs:all` / `scrape:ridersinfo:all` variants as needed), then review `git diff data/`.
2. `pnpm images:manifest` after adding photos under `public/images/clubs`.
3. Add guides to `lib/guides.ts` and refresh intros in `lib/state-intros.ts`.
4. `pnpm test && pnpm build`, commit, push. Vercel deploys from `main`.

See [MONETIZATION.md](MONETIZATION.md) for the operator checklist.

## Health check

`pnpm health` runs the same script the weekly workflow runs: it fetches `/ads.txt`, `/robots.txt`, `/sitemap.xml`, and about thirty pages (an even spread plus fixed hub and legal pages), and asserts status 200, canonical host, a sitemap count within 10% of the previous run, the ad script on content pages, and no ad script on `/search`, the legal pages, or the 404 page. Pass `SITE_URL=https://preview-url` to check a preview deployment and `EXPECT_AD_SCRIPT=false` when the preview has no AdSense ID.

## License

Unlicense. See [LICENSE](LICENSE).
