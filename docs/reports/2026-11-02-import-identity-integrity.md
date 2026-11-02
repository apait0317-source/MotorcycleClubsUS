# RiderClubs identity and location correction

The RiderClubs importer could promote a sentence from a description into an organization name and assign the search city's location to a nearby result. A retained current source page reproduces both failures: the original parser returns `Unlike a Motorcycle Club` in San Francisco, while the page's structured listing identifies Soldiers of the Cross Modesto in Modesto, California.

## Corrected import boundary

The importer now reads organization entities within ItemList/ListItem, graph and array JSON-LD structures. A candidate needs a named organization, a local RiderClubs club-detail URL, an explicit US country, a city and a recognized two-letter state code. Direct and location-nested postal addresses are supported. Description text and query-city headings cannot create or place an entity. A malformed JSON-LD block does not discard another valid block.

Detail URLs are normalized to HTTPS without tracking parameters or fragments. Credentials, foreign hosts and unrelated paths are rejected. Candidates are deduplicated by detail URL across city searches, preserving independently identified listings with the same name. Unsupported or incomplete structured layouts produce no candidates; they do not establish that an organization has closed.

Discovery metadata still requires editorial review against official sources. Source descriptions remain unapproved research input. This change performs no bulk scrape, merge or refresh of existing records, and changes no raw rows, IDs, profile prose, ratings, photos or existing review dates.

## Resolved artifact

The original [San Francisco Christian listings page](https://www.riderclubs.com/motorcycle-clubs/united-states/california/san-francisco/f/christian) places the exact imported phrase under a linked [Soldiers of the Cross Modesto entry](https://www.riderclubs.com/club/soldiers-of-the-cross-modesto). That directory establishes the import's origin. The [official ministry page](https://sotc.faith/mens-bible-study) establishes the existing canonical organization's Modesto identity and current clubhouse address. All three pages were retrieved November 2, 2026.

The malformed route `/clubs/unlike-a-motorcycle-club-san-francisco-ca` now permanently redirects to the already reviewed `/clubs/soldiers-of-the-cross-motorcycle-ministry-modesto-ca`. It is not treated as a separate San Francisco chapter.

The original cohort slug remains held from the Bay Area comparison. Alias resolution applies that hold to the Modesto canonical, so the comparison remains eight organizations across six localities with six actionable entries. Modesto is not added to the regional guide. Seven aliases consolidate duplicate or malformed imports. The sitemap remains at 126 URLs.

The original 23-record outcomes now comprise seven supported cohort profiles, five resolved imports and eleven unresolved records. The manifest still has twelve held slugs: eleven unresolved entries and this resolved out-of-area import. A hold is not always an unresolved identity.

## Other records researched

Northern California Norton Owners Club's official contact and membership pages add useful regional information but do not establish a current fixed club city. Golden Gate BMW Riders still lacks a corroborated official identity; a BMW car club is not substituted. The Motor Cycle Club Cafe's Spanish address is corroborated only by third-party directory results in this pass, so no new authoritative exclusion is claimed. These three entries remain outside the comparison.

## Verification and review

Six regression tests failed before the parser existed and passed after implementation. They cover entity names/localities, rejection of prose and publisher metadata, missing/foreign addresses, constrained URLs, graph/array/direct-address structures, canonical duplicate URLs and malformed blocks. A separate probe against retained live HTML confirms the new parser returns the named Modesto organization rather than the reproduced phrase-name/San Francisco result. Alias and market probes confirm the canonical destination and eight-row regional exclusion.

All 245 tests, TypeScript checks, application lint and explicit importer/parser lint pass under Node 22 and pnpm 10. Production build, output scan, browser and live results are recorded separately in the task artifacts; publication evidence is distinct from these implementation checks.

The fresh production build prerenders 3,445 pages. Its output scan checks eight comparison profiles, seven redirect rules and 126 sitemap URLs, with no internal review fields in 32,220 public files. Local production Chromium verifies all seven HTTP 308 redirects, the corrected artifact destination and Modesto schema locality, eight comparison rows with and without JavaScript, filters/reset/keyboard/mobile behavior and the existing Petaluma/Fulton gates. Analytics and ad requests are blocked during browser verification. Actual production alias delivery, ads.txt and health remain separate release checks.

Independent review found no Critical or Important issue. One Minor test case is deferred: identical organization names/state with different detail URLs should explicitly assert that both candidates survive. The URL-based implementation preserves those listings, but the additional regression would protect that choice from a later change.

The reviewer inspected the retained source, transform contract and scraper integration. Its focused test attempt was blocked by an environment selecting Node 24/pnpm 11 and a store-resolution failure; the successful test evidence above comes from the implementation run. It did not judge broader source coverage, current activity or membership availability, unchanged downstream ID generation/import deduplication, production behavior or later documentation. No broader coverage, current availability, rankings, AdSense approval or revenue result is inferred from this fix.

The isolated checkout was moved outside the primary repository's TypeScript source glob to `/workspace/work/` while keeping research and validation artifacts under ignored `work/market-depth/identity-cleanup/`. The original primary checkout is reserved for verified integration. No account setting, message, production analytics event or hosted health baseline is changed by implementation checks.
