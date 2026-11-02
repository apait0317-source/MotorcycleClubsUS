# Monetization and operations checklist

Operator steps that cannot be done from the codebase. Work top to bottom once, then follow the quarterly and weekly sections. Production domain: https://www.usmotorcycleclubs.com. Never commit secret values.

**November 1 readiness review:** the [wider-directory report](docs/reports/2026-11-01-adsense-readiness.md) records 24 supported descriptions, 20 separate exclusions, and 265 unresolved weak profiles. This does not establish readiness for AdSense resubmission. The owner has instructed us to assume permission for existing photos; no independent rights audit is claimed. Remaining content and location issues, runtime consent, contact delivery and account settings still need resolution or verification. Publication of the reviewed changes was subsequently authorized in chat.

**Consent policy confirmed:** the owner uses Google's consent banner worldwide and explicitly permits Google's cookieless measurement when consent is denied. The initializer applies denied defaults worldwide and keeps the tag configured for advanced Consent Mode. Runtime acceptance, rejection, revocation, and persistence checks must verify that policy and the account's actual message audience.

## 1. Vercel

- **Plan:** the project is on Vercel Pro. Hobby prohibits commercial use, so this must stay Pro while ads run.
- **Web Analytics:** Project → Analytics → Enable.
- **Environment variables (Production):**
  - Already set: `RESEND_API_KEY` (production and preview, sensitive). Keep `NEXT_PUBLIC_ADSENSE_ID` and `NEXT_PUBLIC_GA_MEASUREMENT_ID` as they are.
  - **Active; sender repair pending:** `CONTACT_TO_EMAIL` is set to the owner-confirmed inbox in the existing Production and Preview scopes. The approved production redeploy of `85c69d0` activated it. The labeled test was rejected by Resend HTTP 403 because the onboarding sender only permits testing to its account owner. Configure `CONTACT_FROM_EMAIL` on a Resend-verified domain before retrying.
  - **Still to configure:** `NEXT_PUBLIC_AD_SLOT_INLINE`, `NEXT_PUBLIC_AD_SLOT_SIDEBAR` (both absent in the November 1 Production metadata check).
  - Optional: `CONTACT_FROM_EMAIL` once a sending domain is verified in Resend; `NEXT_PUBLIC_AMAZON_AFFILIATE_TAG`.
  - Removed features, so remove their variables (no longer read by any code): every `AUTH_*`, `NEXTAUTH_URL`, `GOOGLE_CLIENT_*`, `DATABASE_URL`, `POSTGRES_*`, `SUPABASE_*`, `NEXT_PUBLIC_SUPABASE_*`, `NEXT_PUBLIC_AD_SLOT_BANNER` (the banner placement was removed).
  - Redeploy after changing variables.
- **Firewall rate limit (do once):** Project → Firewall → Configure → Add rule: condition `Request path equals /api/contact` and `Method equals POST`, action **Rate limit**, 5 requests per 60 seconds per IP, then Deny. The API previously refused to create the firewall config from outside the dashboard; the November 1 active-config read returned `404 Config not found`. This rule is not verified and remains a dashboard step. It stops a script from draining the Resend quota or flooding the inbox.
- **Integrations:** the "Instarank" integration provisioned the old Supabase database. Nothing reads it any more. Remove the integration from the project when convenient.

## 2. Resend

1. `RESEND_API_KEY` is already configured. Set `CONTACT_TO_EMAIL` to the address that owns the Resend account, or verify a sending domain (Resend → Domains → Add `usmotorcycleclubs.com`, add the DNS records) and set `CONTACT_FROM_EMAIL` to an address on it, e.g. `US Motorcycle Clubs <forms@usmotorcycleclubs.com>`.
2. One authorized, clearly labeled test was attempted through the shared production contact endpoint used by `/contact` and `/submit`. It returned HTTP 500, and the matching runtime log records Resend HTTP 403 for the onboarding sender's account-owner recipient restriction. No email was accepted. After configuring a verified sender and activating it, retry the existing authorized test and check arrival and Reply-To.

## 3. Google AdSense

1. Publisher ID `pub-3750726644611991`, set as `NEXT_PUBLIC_ADSENSE_ID`.
2. **Sites:** `usmotorcycleclubs.com` listed against the canonical host `www.usmotorcycleclubs.com`. Check the approval status each quarter.
3. **ads.txt:** served at `/ads.txt`; AdSense should show *Authorized*.
4. **Ads → By ad unit → Display ads:** two responsive units, `inline` and `sidebar`. Put their `data-ad-slot` values in `NEXT_PUBLIC_AD_SLOT_INLINE` and `NEXT_PUBLIC_AD_SLOT_SIDEBAR`. Each placement renders only when its own slot ID and the publisher ID exist. Missing both slot IDs means no fixed containers.
5. **Auto ads:** enabled. The fixed units are in addition.
6. **Auto ads page exclusions (do once, second layer).** Google forbids ads on dead-end screens such as thank-you and error pages ([policy](https://support.google.com/publisherpolicies/answer/11112688)). The code already keeps the AdSense script off those pages on a hard load. Add the exclusions too, because a visitor who clicks from a content page to `/contact` keeps the script already loaded, and Google's help pages do not say how Auto ads behave then. Steps ([source](https://support.google.com/adsense/answer/9262311)):
   1. AdSense → **Ads** → click **Edit** next to the site.
   2. In **Page exclusions**, click **Manage**, then **+ Add exclusion**.
   3. Enter each URL below and choose **This page only**. Google's help states no wildcard support, and it does not support URLs with parameters or fragments.
   4. Back in Ad settings, click **Apply to site**. Allow up to an hour.

   URLs: `https://www.usmotorcycleclubs.com/contact`, `/submit`, `/search`, `/about`, `/privacy`, `/terms`, `/disclaimer`.
7. **Privacy & messaging:** publish the GDPR and US state regulations messages (Google's certified CMP, no code).
8. **Analytics consent mode:** in **Privacy & messaging → European regulations → Settings**, enable both **Consent mode for advertising purposes** and **Consent mode for analytics purposes** as appropriate for the confirmed policy, then save ([Google instructions](https://support.google.com/adsense/answer/16053245)). Google says these settings apply across all configured European regulations messages in the account. Confirm that scope before changing them. The Analytics initializer queues worldwide denied defaults before measurement configuration and library loading, permitting cookieless measurement under the owner's approved policy. This does not publish a message or configure AdSense consent by itself.
9. **Verify worldwide coverage:** use fresh sessions inside and outside EEA/UK/Switzerland. Before a choice, inspect default consent, requests, and analytics storage; after reject, accept, and revocation, inspect updates and storage behavior. Advanced consent mode can send cookieless pings when storage is denied. Google's CMP updates consent only for visitors shown the European regulations message, so verify that its configured audience actually covers the owner's worldwide scope. Also verify the US state message and privacy-choice controls separately. Do not mark these complete from source code or one browser session.

The [consent/contact follow-up](docs/reports/2026-11-01-consent-contact-checks.md) records code fixes, verified Vercel access, the recipient-activation redeploy and the confirmed Resend sender blocker. The sender rejects blank or malformed recipients and malformed nonempty senders and requires a nonempty provider message ID. The recipient-activation test used `85c69d0`; publication of the subsequent reviewed fixes was then authorized separately. A provider acknowledgement proves acceptance, not inbox delivery. The authorized test was rejected before acceptance, so permitted sender operation and delivery remain unverified.

The AdSense script is not in the root layout. Each content page renders `components/AdSenseLoader.tsx`, and React hoists it into `<head>`. These pages never load it: the 404 page, `/about`, `/contact`, `/submit`, `/search`, the legal pages, and any page that is `noindex` (single-club cities, thin club pages, and state pages with no listable club). `tests/pages/ad-placement.test.ts` checks the page source for all of these. The weekly health check fetches the content hubs (must carry the script) and `/about`, `/contact`, `/submit`, `/privacy`, `/terms`, `/disclaimer`, `/search`, and a missing URL (must not). Noindex pages are not in the sitemap, so only the source test covers them.

Fixed placements in the code (indexable pages only):

| Placement | Where | Reserved height |
|---|---|---|
| `inline` | After the intro on state pages; after the second section on guide pages; after the club details on club pages; in-feed every 12 cards on state and city grids; once after the grid on city pages with 12 clubs or fewer | 250px |
| `sidebar` | Sticky on desktop, last block of the sidebar on guide, club, and city pages | 280px on phones, 600px from the `lg` breakpoint up |

Home, `/states`, `/cities`, and `/guides` load the script but carry no fixed units; Auto ads cover them.

The reservation is a floor. With a test publisher ID, the AdSense script rewrote `height` and `min-height` on the unit's parent. After real units go live, check cumulative layout shift in PageSpeed Insights.

## 4. Google Search Console

- The site has been added to Search Console. Confirm ownership is verified and submit the sitemap `https://www.usmotorcycleclubs.com/sitemap.xml`.
- Leave email alerts on.
- Removed routes (`/login`, `/register`, `/dashboard/*`, `/admin/*`, `/claim/*`, `/submit-club`) now 404 and were always `noindex` or disallowed; no redirects needed.

## 5. Amazon Associates

- Tag `usamotorcycle-20` lives in `lib/affiliates.ts`. Links are search URLs, no prices shown.
- Amazon closes accounts without a qualifying sale within 180 days of approval. Check the dashboard date each quarter.
- Evaluate a specialist gear retailer when real click/conversion data justifies the work. Check current program terms and approval requirements. A second merchant needs explicit destination, merchant label and disclosure support in both config and `AffiliateSection`; it is not a config-only change.

## 6. Later ad networks (traffic gated)

| Network | Entry bar | Source |
|---|---|---|
| Raptive | 25,000 monthly pageviews, half from US/UK/CA/AU/NZ, domain 6+ months old, GA4 installed | https://help.raptive.com/hc/en-us/articles/360032840891 |
| Mediavine Journey | ~1,000 monthly sessions, Grow script installed 30 days | https://www.mediavine.com |

## 7. Weekly health check

After a deliberate change that moves the sitemap count by more than 10% (the chapter-hub change did: 941 to 658 URLs), review the changed population and production result before explicitly approving deletion of the `health-state` branch on GitHub to establish a new baseline. Do not reset it automatically.

`.github/workflows/health-check.yml` runs every Monday 13:17 UTC and on demand (Actions → Weekly health check → Run workflow). It checks `/ads.txt`, `/robots.txt`, `/sitemap.xml`, and about thirty pages (an even spread of twenty from the sitemap plus the home page, the first state, city, club, and guide page, and fixed hub and legal pages) for status 200, canonical host, and a sitemap count within 10% of the previous run. The AdSense script must be present on content pages and absent on every other sampled page, on `/search`, and on the 404 page.

- GitHub emails the workflow's author on failure by default. Confirm under GitHub → Settings → Notifications → Actions that "Only notify for failed workflows" is on.
- A count failure needs review. A large drop continues failing until a baseline reset is explicitly approved.
- Success criterion after launch: four consecutive green weeks.

## 8. Quarterly session

1. Run `pnpm content:audit`. Read `.content-reports/content-audit.json` and `content-candidates.csv` to select a bounded enrichment batch, starting with identity/location problems and unsupported descriptions with credible official websites regardless of score. Discovery imports (`pnpm scrape:all` and optional source variants) are additive, not a refresh of existing records; review their diffs separately.
2. Read the latest source report or run `pnpm content:check-sources`. Review `.content-reports/source-check.json`, `source-check.csv`, and `summary.md`. Access failures and hash changes are review hints, not proof of closure or changed facts.
3. Research identity and facts on official sources. Write original summaries with field-attributed evidence in `data/club-enrichment.json`; keep raw records, stable IDs/slugs and location intact. Allowed changes are description, website and phone, plus reviewed listing classification. Evidence has URL, actual `checkedAt`, supported `fields` and internal `factNotes`; `verifiedAt` is the actual editorial review date. Public pages show “Information checked” and deduplicated source links, never internal review notes. Do not invent current activity, membership or dates. Manually review baseline hashes in `data/content-source-baselines.json` (`url`, `reviewedAt`, `contentHash`). Monitoring never updates approved facts, dates, scores or status.
4. Re-run the audit and compare the original cohort, score distribution, contact changes and exclusions separately. Record research time and successful outcomes before sizing another batch. Replace the fixed guide quota with evidence-led enrichment and re-verification; add guides or revise state intros only where evidence and Search Console support the work. Add no Google-sourced images or credit for unresolved image rights; run `pnpm images:manifest` only for separately reviewed photo changes.
5. Confirm AdSense, consent, `/ads.txt`, Vercel and workflow settings. Review legitimate sitemap population changes explicitly before any production health-baseline reset. Run `pnpm test && pnpm typecheck && pnpm lint:app && pnpm build` before an authorized implementation push. Documentation-only changes require document verification. Publish through the separately authorized release workflow; do not infer traffic, revenue or AdSense approval gains.

The monthly source workflow (`.github/workflows/content-source-check.yml`) runs at 13:23 UTC on day 1, with manual dispatch, Node 22 and pnpm 10. It has read-only contents permission, requires no API keys, and uploads `.content-reports/` for 90 days. Scheduling becomes eligible only after merge to the default branch. No production merge or successful hosted run is claimed. Read reports quarterly; the source check does not create daily or weekly human work. See the [pilot outcome](docs/reports/2026-11-01-content-enrichment-pilot.md) for scope and unresolved sources.

## 9. Indexing rules

- Club profiles require confirmed, approved prose with attributed source evidence plus the existing diagnostic score of at least 3. Score alone cannot qualify a profile. Basic pages are `noindex`, out of the sitemap, without ads or affiliate blocks; state pages keep limited entries available and basic search cards lead there.
- City pages are indexed only with two or more source-reviewed profiles; their cards now include approved summaries for comparison.
- State pages are indexed only with two or more source-reviewed profiles. Sparse state coverage remains linked in a separate basic-listings section of `/states`, with no ads on those state pages.
- Non-club categories (dealers, venues, bars, churches) are never listed.
- Every state page carries an original intro plus data-driven counts and an FAQ.

## 10. Open items

- 340 image files in `public/images/clubs` belong to clubs no longer in `data/clubs.json`. Safe to delete after confirming with `pnpm images:manifest` output.

## 11. Additional monetization priorities from the curation review

See [the full review](docs/reports/2026-11-01-curation-and-monetization-review.md). Contextual affiliate offers on four relevant guides are implemented locally, replacing universal guide-sidebar shopping. Category search links make no claim that every returned product has a particular certification or material.

Next, verify existing Amazon account status and outbound click reporting. Compare guide-level clicks and actual commissions over a quarter; no revenue estimate is supported yet. Evaluate one specialist retailer if the evidence supports it. After contact delivery works and a relevant audience is demonstrated, a separately labeled quarterly sponsor can fit the static architecture. Sponsorship must never buy club inclusion, ranking, reviewed status or favorable editorial copy; corrections and basic listings remain free. Do not promise automatic sponsor expiry from a build-time date without a verified rebuild process. A small organizer download is a later demand test, not a reason to add accounts or a database. No sponsor outreach, merchant application or payment setup was performed.

The prior contact-delivery test was rejected by Resend due to the onboarding sender restriction; sender-domain repair remains an operator task. Do not repeat an external send as part of content verification. Runtime CMP/AdSense account settings remain unverified, and published ad-network entry bars above must be rechecked against current official terms before acting. No AdSense resubmission is established by this code review.

## Homepage sponsor placement

The homepage keeps Auto ads and has no fixed AdSlot or empty advertising placeholder. Amazon shopping categories reuse the existing config and disclosure in a horizontal homepage strip.

Optional quarterly sponsorship lives in `lib/sponsors.ts`. Set QUARTERLY_SPONSOR to a name, HTTPS destination and short message only for a booked placement. The component visibly labels Paid sponsorship and uses sponsored link attributes. Null, incomplete or invalid configuration renders nothing and leaves the state browser full width. A sponsorship is separate from editorial review status.

At the quarterly review, renew or remove the configuration and rebuild/redeploy through the normal release process. Static pages do not expire themselves. No sponsorship is configured by the redesign.
