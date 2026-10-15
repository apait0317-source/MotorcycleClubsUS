# Monetization checklist

Operator steps that cannot be done from the codebase. Work top to bottom.

## 1. Google AdSense

1. Sign in to AdSense with the account that owns publisher ID `pub-3750726644611991` (the ID already set in Vercel as `NEXT_PUBLIC_ADSENSE_ID`).
2. **Sites → Add site** `usmotorcycleclubs.com` if it is not already listed. Approval runs against the canonical host `www.usmotorcycleclubs.com`.
3. Confirm **ads.txt** shows *Authorized* for the domain. The site serves it at `/ads.txt` from the env var. Google can take up to a few days to re-crawl.
4. **Ads → By ad unit → Display ads**: create three responsive units named `banner`, `sidebar`, `inline`. Copy each unit's numeric `data-ad-slot` value.
5. In Vercel → Project → Settings → Environment Variables (Production), add:
   - `NEXT_PUBLIC_AD_SLOT_BANNER`
   - `NEXT_PUBLIC_AD_SLOT_SIDEBAR`
   - `NEXT_PUBLIC_AD_SLOT_INLINE`
   Redeploy. Until all three exist, production renders no ad boxes at all (by design).
6. Optional: **Ads → By site → Auto ads** can be enabled in addition. The page `<head>` already loads the AdSense script.
7. **Privacy & messaging → European regulations**: create and publish a GDPR message. This is Google's certified consent management platform and needs no code. Also publish the US state regulations message. Reference: https://support.google.com/adsense/answer/13554116

Do not apply for review until the deploy that carries this change set is live and Search Console shows the new sitemap indexed.

## 2. Google Search Console

1. Add and verify the **Domain** property `usmotorcycleclubs.com` (DNS TXT record at the registrar).
2. Submit `https://www.usmotorcycleclubs.com/sitemap.xml`.
3. If a property exists for `motorcycle-clubs-us.vercel.app`, use **Change of Address** to the new domain. That host now 301s every URL.
4. Request indexing for `/`, `/states`, `/guides`, and the three guide URLs.

## 3. Vercel

- Web Analytics is off. Enable it (Project → Analytics) so traffic can be measured without Google Analytics access.
- The three environment variables above.
- Optional: `NEXT_PUBLIC_SITE_URL` only if the primary domain ever changes. Default is `https://www.usmotorcycleclubs.com`.

## 4. Amazon Associates

- The tag `usamotorcycle-20` is live in the code. Amazon closes accounts that make no qualifying sales within 180 days of approval. Check the Associates dashboard date.
- Prices are not displayed anywhere, by design. The Operating Agreement only allows prices pulled from the Product Advertising API.

## 5. Later ad networks (traffic gated)

| Network | Entry bar (verify before applying) | Source |
|---|---|---|
| Raptive | 25,000 monthly pageviews, half from US/UK/CA/AU/NZ, 6-month-old domain, GA installed | https://help.raptive.com/hc/en-us/articles/360032840891 |
| Mediavine Journey | ~1,000 monthly sessions, Grow script installed 30 days | https://www.mediavine.com |

## 6. Indexing rules (after the "Low value content" rejection)

- Club pages are indexed and linked only when they score 3 or more on public detail (original description, website, phone, photo, reviews, street address). Everything else is `noindex`, out of the sitemap, and shown on state and city pages as an unlinked text entry. Threshold: `MIN_CLUB_SCORE_FOR_INDEX` in `lib/data.ts`.
- City pages are indexed only with two or more listed clubs. Others are `noindex` and not linked from grids.
- Non-club categories (dealers, venues, bars, churches) are never listed.
- Every state page carries an original editorial intro (`lib/state-intros.ts`) plus data-driven counts and an FAQ.
- `/guides` holds 15 original articles. Add more there, not as thin club text.
- Re-apply to AdSense only after Search Console shows the new sitemap indexed and the old vercel.app URLs dropping out.

## 7. Unresolved items

- The production database (Supabase, provisioned by the "Instarank" Vercel integration) is not in the owner's Supabase account. Reviews, favorites, claims, and user accounts depend on it. Photos no longer do.
- 340 image files in `public/images/clubs` belong to clubs that are no longer in `data/clubs.json`. Safe to delete after confirming with `pnpm images:manifest` output.
