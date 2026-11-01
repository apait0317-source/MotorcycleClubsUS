# AdSense readiness through wider directory enrichment

Date: November 1, 2026
Status: Approved in chat on November 1, 2026. Implementation is on the provided work branch; publication is outside this scope.

## Intent and agreed direction

Improve US Motorcycle Clubs so riders receive useful, original information and the site is better prepared for an AdSense review. Google alone decides approval; content scores, page counts, and passing tests do not establish approval or revenue.

The selected approach is **enrich the wider directory before tightening eligibility**. Preserve the existing Next.js 16, prerendered JSON-data architecture, public URLs, and low-maintenance operating model. Keep operator identity private.

## Evidence collected

The current canonical source contains 2,102 records. Of the 472 listable profiles, 277 have no description and 32 fail the current original-description heuristic, for a research cohort of 309. Of those 309, 115 have a website field, which is a research lead rather than proof of identity. Fifty existing approved descriptions are outside this missing/short-description cohort. Among listable profiles, 95 have neither website nor phone. There are 50 indexable state pages and 97 indexable city pages.

The existing score allows website, phone, address, Google reviews, and an image to qualify a profile without original descriptive text. A total of 114 currently listable profiles depend on the image point to reach the indexing threshold. Photo rights remain unresolved. A description-length/contact screen would retain only 159 profiles across 36 states and 19 city pages; this is an illustrative screening result, not a count of verified or AdSense-ready profiles.

Fresh live-source samples returned HTTP 200 for the STNMC profile, Razorback Riders profile, joining guide, and privacy policy. STNMC has no description but loads AdSense and contains affiliate links. Razorback Riders displays the prior approved summary and November 1 checked-source attribution. The privacy page has no AdSense loader on a hard load. It promises a consent message; the sampled HTML does not establish whether a geographically targeted certified CMP is configured or operating. No live email was sent and deployed contact configuration was not verified.

## Approaches

1. **Curate first:** immediately narrow the directory to stronger profiles, then rebuild coverage. Faster to remove thin pages, but sharply reduces geographic coverage. This was recommended initially; the user selected a different approach.
2. **Enrich first, selected by the user:** research the 309 weak profiles in the current listable cohort, publish only supported original summaries, then reassess residual eligibility and monetization risks. Retains useful coverage, with more research and some records potentially unresolved.
3. **Technical changes alone:** improve metadata and advertising controls while retaining weak content. Insufficient to address the confirmed content gap, so not selected.

## Implementation scope

### 1. Evidence-led research and original summaries

- Freeze the 309-record cohort before work. Prioritize the 115 with website fields, then search for authoritative sources for the remainder. Work in reviewable batches, recording actual research effort and outcomes.
- Attempt identity and source verification for every cohort member. Match the organization and the local chapter using name, location, contact information, or another reliable identity anchor. A shared name or a national homepage alone does not confirm the local listing.
- Prefer official club sites, official organization chapter directories, and clearly attributable official public social pages. Third-party directory snippets alone do not establish sufficient evidence for a published update. Search snippets are leads; retrieve the supporting page.
- Publish a new summary only when at least three distinct, club-specific facts are supported. Explain useful characteristics such as riding focus, membership eligibility, activities, history, public event participation, or how the club organizes. Do not invent facts to fill categories or meet a word count.
- Use original prose. Do not copy or lightly paraphrase another directory, repeat a generic template, invent current activity, identify private individuals, or publish personal member contacts. Describe historical or potentially dated claims with attribution and appropriate limits.
- Update `data/club-enrichment.json` through the existing validated overlay. Attribute changed fields to actual retrieved sources with real check dates and internal fact notes. Correct website or phone only when supported. Do not alter raw IDs, names, slugs, location, ratings, or reviews.
- A corroborated unrelated or parked website can be explicitly removed rather than replaced with an unverified URL. The overlay must distinguish an evidenced empty website from an omitted field. A source used solely to establish removal must not offer the unrelated domain again as a public reference link. This is an implementation clarification within supported contact corrections; all other evidence and identity rules remain.
- Exclude a record through the existing reviewed classification only when authoritative evidence identifies it as a non-motorcycle organization or an unrelated/out-of-country match. Source failure alone is not an exclusion or evidence of closure. An identity/location conflict that cannot be fixed through allowed fields is deferred for a later data correction.
- If evidence is insufficient, leave the published record unchanged and record the precise reason and sources attempted in a private research report. Existing records with ambiguous duplicate IDs are deferred; never bypass identity validation.
- Retain existing approved evidence and summaries unless a new source establishes a factual correction. Seed monitoring hashes only from actually retrieved, manually reviewed content; failed requests receive no invented baseline.

### 2. Reader trust and content presentation

- Keep the existing public checked-date and field-level source attribution for approved profiles, with internal review notes excluded from client props, HTML, and RSC payloads.
- Explain the review process and limitations on the About page: facts are checked at the displayed date, club policies and activity can change, and a listing is not an endorsement. Use the site's organizational voice without inventing credentials, personal experience, or an operator biography.
- Correct inaccurate editorial labels supported by the audit. For example, related clubs may come from elsewhere in the state, so the heading must match the actual selection. Do not turn a closed-day field into unsupported operating hours. These are narrow corrections, not a redesign.
- Audit the existing guides for consequential unsupported generalizations, replace blanket advice with qualified guidance, and add retrieved authoritative references where useful. Preserve substantial original explanations. Do not manufacture authors, dates, or expertise. Facts about safety, certification, and legal requirements need matching official sources.

### 3. Reassess monetization readiness after enrichment

- Re-run the audit against the original cohort. Separate successful enrichments, exclusions, unresolved cases, and contact corrections; report both the fixed cohort and current eligible population. Do not equate score increases with measured search or revenue improvement.
- Keep `MIN_CLUB_SCORE_FOR_INDEX`, city/state thresholds, and chapter-list rules unchanged during this enrichment pass. Any later eligibility change must be based on the remaining content, with the affected pages and coverage impact shown first.
- Add no unlicensed images and no credit for newly discovered images. Inventory the current unresolved photo exposure and outline rights clearance or suppression as a remaining release prerequisite; enrichment does not resolve image rights.
- Verify public `/ads.txt`, robots, sitemap, representative page status/canonicals, and ad-free excluded templates with read-only requests. Check the source for ad eligibility and affiliate disclosures. Existing ads or publisher authorization do not establish approval.
- Treat certified CMP publication, regional consent behavior, Auto ads exclusions, AdSense account status, ad-unit configuration, contact inbox delivery, and deployment credentials as external checks. Use connected authorized account tools if available. Otherwise state exactly what remains unverified and provide concrete dashboard steps. Do not claim a live consent system or working inbox from source code alone.

## Constraints and non-goals

No database, login, new analytics provider, paid ad traffic, redesign, scraper expansion, mass-generated filler, automatic fact publication, threshold reduction, or new affiliate program. Do not change a site's hosting provider or audience. No messages to third parties, AdSense application submission, or production merge. Work on the provided `work` branch; repository guidance requires a separately authorized release and says to open a PR only when asked. Do not reset the production health baseline automatically.

## Builder decisions

The implementer may choose research batch sizes and independent research assignments, wording, source-retrieval fallbacks, and small presentation changes within the scope above. Use the existing validation, evidence, source-monitoring, and public-data boundary rather than adding a parallel content system. Keep research reports and captures in ignored `work/` files; publish only approved facts and intentionally selected deliverables. The primary implementer owns shared overlay edits and final verification.

## Acceptance and verification

1. Every one of the 309 cohort records has a recorded research outcome: supported enrichment, evidenced exclusion, or an explicit unresolved reason. All published descriptions have at least three distinct source-supported facts, original wording, matching identity, and accurate check dates. There is no invented success quota.
2. Existing identity and enrichment validation passes. Raw rows, slugs, and protected fields remain unchanged. All new and retained facts are reviewed for contradictions, copying, unsupported inference, and personal information.
3. Checked-source display accurately scopes the fields reviewed. Internal fact notes and review notes do not appear in public generated artifacts. Reviewed exclusions remain out of indexable/listable selections and ad eligibility through existing rules.
4. Reader-facing editorial corrections and guide references are verified against the final rendered output or build artifacts. Links and labels match their destinations and content.
5. Run Node 22/pnpm 10 tests, typecheck, application lint, and the production build, using the repository's existing tools and session proxy/CA configuration. Add meaningful regression tests for changed logic; data-only enrichment primarily uses existing validation and source review. If normal test execution is sandbox-blocked, resolve the runner limitation or explicitly report incomplete verification rather than treating file-level exit results as the full suite.
6. Compare audit metrics before and after and inspect the diff. Verify representative enriched, unresolved, excluded, city, state, guide, legal, search, and missing-page behavior as applicable. Run available browser QA without claiming unsupported regional consent coverage.
7. Deliver a reviewable branch diff, outcome report, and remaining release checklist. Explain which external settings were verified and which still require account access. Do not claim AdSense readiness, approval, revenue, deployment, or successful email delivery without corresponding evidence.

## Official review references

- Google, Make sure your site's pages are ready for AdSense: https://support.google.com/adsense/answer/7299563?hl=en
- Google, Your AdSense account wasn't approved: https://support.google.com/adsense/answer/81904?hl=en

Google emphasizes unique, relevant content, sufficient complete prose, clear navigation, and review of the site's pages. It does not publish a guaranteed approval word count, internal content score, or required number of profiles.
