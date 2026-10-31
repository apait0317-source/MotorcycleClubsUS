# Monetization and AI discoverability review

Date: 2026-10-31
Status: findings and recommended order. Nothing implemented.
Scope: usmotorcycleclubs.com

## Inputs and what is unknown

Facts from the repository on this date:

- 2,107 rows in `data/clubs.json`. 102 are non-club categories (dealers, venues, offices). Of the 2,005 real clubs, 729 are indexable and 1,276 are thin (`noindex`).
- 51 indexable state pages, 136 indexable city pages, 15 guides. About 940 pages are indexable out of about 3,400 prerendered.
- `robots.txt` (live) allows every crawler except `/api/` and `/search`. No AI crawler is blocked.
- No `llms.txt`. The sitemap carries no `lastModified` for club, city, or state pages.
- The affiliate box is the same four Amazon search links on every club, city, and guide page.
- `MONETIZATION.md` lists `NEXT_PUBLIC_AD_SLOT_INLINE`, `NEXT_PUBLIC_AD_SLOT_SIDEBAR`, and `CONTACT_TO_EMAIL` as not yet set. Verify in Vercel. Until set, fixed ad units render nothing and `/contact` and `/submit` cannot send mail.

Unknown, and decisive: monthly pageviews, Search Console clicks and impressions, the indexed-page count, AdSense approval status, and any traffic from AI tools. The Vercel connector in this session shows no project, so analytics could not be read.

## Update: no ads live and very little traffic

This supersedes the order under "Recommended order". Revenue work waits for traffic. The sequence is now:

1. **Get indexed and approved.** Confirm Search Console ownership and the sitemap submission, and read the indexed count against the roughly 940 indexable pages. Check the AdSense site status (not applied, in review, needs attention, or rejected). The status decides whether anything on the site must change before approval.
2. **Make pages worth indexing and quoting.** Step 1 below (facts tables, club summary line, real data-refresh date, `llms.txt`, IndexNow, Bing Webmaster Tools).
3. **Earn links and mentions.** Neither AI tools nor Google cite a site no one links to. One courtesy notice to each club that has a website ("your listing is here, correct it here"), plus listings in veteran and rider community resources. Outreach stays off the site and names no one on public pages.
4. **Add guides and category hubs** (Step 2 below) once indexing shows which page types Google accepts.
5. **Defer** affiliate relevance, sponsors, and ad networks. At near-zero traffic they return dollars per month (estimate). Amazon Associates also closes an account with no qualifying sale in 180 days, so expect that account to lapse and do not spend effort protecting it.

### AdSense is not approved yet

Approval is the first gate for all ad revenue, so it moves ahead of every code item. Read the exact status and reason in AdSense (Sites). The reason decides the fix. Do not guess before reading it.

Risks in this repository that a reviewer could flag, from `CLAUDE.md` and the data files. These are hypotheses, not findings, until the AdSense reason confirms one:

- **Scraped-origin content.** Club facts came from CVMA, WOW, sober-riders, and CSV chapter lists. The descriptions were rewritten, but chapters from one boilerplate still carry the same facts (known gap 1). Reviewers can read these as low-value or duplicate pages.
- **Third-party images.** 660 rows point to Google-hosted images and image rights are unresolved (known gap 2).
- **Terms of Service** forbid scraping while the data came from scraping (known gap 8).
- **Thin state pages** such as Montana (one club) and Maine (two) are indexed (known gap 7).
- **Original editorial depth.** Fifteen guides and 51 state intros are the strongest approval evidence. More sourced guides help approval and indexing at once.

If the reason is low-value content, the order is: raise `MIN_STATE_CLUBS_FOR_INDEX`, raise the score bar for boilerplate chapters, add guides, then request review. Resubmitting without a change usually repeats the result (estimate).

Stop condition for step 3: if the indexed count stays under half of the indexable pages after two Search Console cycles, the problem is content depth, and the fix is rewriting thin pages, not more pages.

## Finding 1: traffic is the constraint, not ad placement

The ad stack is sound and policy-safe. Revenue equals pageviews times revenue per thousand views. A directory of this size in a niche vertical earns a low rate per thousand views (estimate, unverified). The code cannot raise traffic. It can raise the share of pages that rank and the revenue per visit.

## Finding 2: AI visibility and revenue pull in different directions

AI answers resolve many directory queries without a click. Being cited builds brand and referral traffic, but expect few clicks. Revenue must therefore rest on what an AI answer does not replace: guides with buying intent, sponsor placements, and returning visitors.

## Finding 3: what AI discoverability requires

Google states that appearing in AI Overviews and AI Mode needs no extra technical step, no AI text file, and no special markup beyond being indexed and snippet-eligible ([Google Search Central](https://developers.google.com/search/docs/appearance/ai-features)). OpenAI separates OAI-SearchBot (ChatGPT search, honors robots.txt), GPTBot (training, honors robots.txt), and ChatGPT-User (user-initiated, robots.txt may not apply) ([OpenAI](https://developers.openai.com/api/docs/bots)). The site already allows all three.

Evidence that AI crawlers read `llms.txt` is weak, and Google says it has no effect on Search. Treat it as low cost and low expected return.

Unconfirmed, from vendor sources only: ChatGPT search and Copilot lean on the Bing index. Settle it by checking referrals in Vercel Analytics after Bing indexing.

## Recommended order

### Step 0: measure (no code, same day)

1. Record Search Console clicks, impressions, and indexed-page count for 28 and 90 days.
2. Add the site to Bing Webmaster Tools and submit the sitemap.
3. In Vercel Analytics, filter `referrerHostname` for chatgpt.com, perplexity.ai, claude.ai, and gemini.google.com. This is the only direct measure of AI referral.
4. Confirm the three unset variables above, AdSense site status, and the Amazon Associates 180-day date.

Gate: if monthly pageviews exceed 25,000, move Raptive ahead of everything below. If the indexed count is far under 940, the cause is content quality and Step 1 waits.

### Step 1: extractable facts (code, one session)

- State and city pages: a plain HTML table of listable clubs (name, type, city, website, Google rating and review count). Cards stay.
- Club pages: one summary sentence at the top built from data fields, in the style of `clubMetaDescription`.
- A real data-refresh date. Write it from the scrape scripts to a small data file, show it as "Directory data refreshed <month year>", and use it as `lastModified` in the sitemap. This is the date of the scrape, not an invented one. CLAUDE.md says not to invent dates, so confirm this reading before building.
- `llms.txt` generated at build from guides and indexable states. Under an hour.
- `robots.ts`: name OAI-SearchBot, Claude-SearchBot, and PerplexityBot with `allow: /`. Keep training crawlers allowed.
- IndexNow ping at deploy for Bing and others.

### Step 2: pages that match list queries (code, one to two sessions)

Category and state hubs, for example veteran clubs in Texas. Data supports it: about 268 rows mention veterans, 94 are off-road, 50 are women's clubs, before the indexable filter. Index a hub only at a high floor (start at 5 listable clubs) with a written intro per hub. Do not lower the existing thresholds. Count the indexable hubs before building; if fewer than about 30 qualify, drop this step.

### Step 3: affiliate relevance (code, one session)

Pass a product set per guide through the existing `products` prop: intercoms for group riding, helmets and gloves for new-rider guides, patches and vests for joining and etiquette guides. Remove the generic box from club pages that carry no buying intent. Gear programs beyond Amazon stay gated at about 20,000 monthly pageviews.

### Step 4: direct sponsors (pilot before build)

Sell one sponsor slot per state page to a local dealer, shop, or insurance agent, held in a new `lib/sponsors.ts` and billed through a payment link. No database. Do not build until one outreach round yields a paying pilot. The excluded rows are not a prospect list: only 102 exist and 58 have a website.

## Assumptions that carry the order

| Assumption | If wrong |
|---|---|
| Traffic is under 25,000 monthly pageviews | Apply to Raptive first |
| Indexable pages are being indexed | Fix content depth before any of this |
| AI citation follows Google and Bing presence plus fact-dense, dated pages (vendor-sourced) | Steps 1 and 2 still help ordinary search |
| AdSense approval stands | Revenue work stops until the site passes review |
| Third-party data terms hold | See risk below |

## Do not do

- Publish a bulk CSV or JSON download of the dataset. Many fields come from Google Maps listings, and CLAUDE.md already flags image rights and the scraping terms as open. A download widens that exposure.
- Add per-page Markdown copies or paid "GEO" tooling. No confirmed return.
- Grow thin pages to raise page count.
- Add accounts, claim flows, or a database.

## Sources

- [Google: AI features and your website](https://developers.google.com/search/docs/appearance/ai-features)
- [OpenAI: crawlers](https://developers.openai.com/api/docs/bots)
- [PPC Land: llms.txt adoption study summary](https://ppc.land/llms-txt-adoption-rises-8-8x-but-97-of-files-get-zero-ai-requests/) (secondary, headline only)
