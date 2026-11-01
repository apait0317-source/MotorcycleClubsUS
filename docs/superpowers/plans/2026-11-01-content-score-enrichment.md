# Club Content Score Enrichment Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking. This document proposes implementation; the present request authorizes planning only.

**Goal:** Increase the existing content scores by adding accurate, original, sourced information to real motorcycle organizations, while retaining quarterly human upkeep.

**Architecture:** Keep Next.js, build-time JSON, and the existing scoring weights. Add a reviewed JSON enrichment file keyed by stable place_id; merge approved facts into the existing records through lib/data.ts. Automated checks produce reports, while reviewed data changes ship through the existing Git/Vercel process.

**Tech Stack:** Node 22, pnpm 10, TypeScript, Next.js 16, existing node:test/tsx tests, JSON, GitHub Actions. No new runtime services or dependencies are required.

**Spec:** docs/plans/2026-10-16-low-maintenance-monetization-design.md supplies the architecture and upkeep constraints. The proposed enrichment requirements, targets, and acceptance criteria below implement the request to increase content scores. These proposals are not a claim that the user has approved implementation.

## Global Constraints

- Static only: no database, accounts, login, dashboard, or public moderation queue.
- Preserve the present clubContentScore weights, MIN_CLUB_SCORE_FOR_INDEX = 3, and chapter-list exclusions.
- Preserve raw records; exclude invalid listings through reviewed classification rather than deleting them.
- Do not add Google-sourced images or award new points for images with unresolved rights.
- No invented club facts, dates, membership availability, dues, eligibility, hours, or activity claims.
- Do not name the operator or expose personal identity in public copy or documentation.
- Do not send outreach or confirmation emails as part of this plan.
- Keep slugs and place_id stable. Location changes require a separately reviewed correction; this enrichment overlay cannot change identity or location.
- Vercel deploys main. Work on an isolated implementation branch; do not open a pull request unless requested.
- Before a push, run pnpm test, pnpm typecheck, pnpm lint:app, and pnpm build. Documentation-only changes need document verification rather than application tests.

## Review Focus

1. Same-named organizations in different cities: an approved patch applies only to its exact place_id and expected name.
2. Scrape reruns: existing reviewed enrichment survives, and scraped data cannot silently overwrite it.
3. Thin or misleading evidence: padding, duplicated national blurbs, search snippets, and a working URL do not establish club-specific facts.
4. Unavailable or conflicting sources: leave unconfirmed fields unchanged and report the problem; do not infer closure or publish a speculative replacement.
5. Apparent improvement caused by exclusions: report the original cohort, excluded records, and actual enriched records separately.

## Baseline and scoring

Baseline reviewed on 2026-11-01 at commit ec6440f823571a43475108e7c261f91887632659. Recompute before implementation if main changes.

The 2,107 raw rows become 2,102 records after slug deduplication. The category filter accepts 2,005 records, including thin entries and chapter-list records. There are 481 indexable/listable profiles.

| Current score | Indexable profiles |
| --- | ---: |
| 3 | 207 |
| 4 | 146 |
| 5 | 79 |
| 6 | 32 |
| 7 | 17 |
| Total | 481 |

- 353 indexed profiles score below 5; 128 score at least 5.
- 336 indexed profiles have no description.
- 95 indexed profiles have neither a website nor a phone number.
- 134 profiles below 5 have a website and a description earning fewer than two points. Of those, 129 have no description points.
- A stored website is a research starting point, not proof that the link works or represents the correct organization.

Current points from lib/data.ts:

| Field | Existing points | How to improve it honestly |
| --- | ---: | --- |
| Non-template description of at least 60 trimmed characters | 2 | Write a club-specific summary supported by official sources. This replaces the one point for a short description. |
| Short non-template description | 1 | Replace it with a substantive sourced summary; net gain is one point, not two. |
| Website | 1 | Confirm the exact club/chapter's official website. |
| Phone | 1 | Add a published organizational contact number if one exists. |
| Local image in the manifest | 1 | Retain current behavior; adding images is outside this project. |
| Reviews greater than zero | 1 | Retain existing values; do not create reviews. |
| Address with more than two comma-separated parts | 1 | Retain current behavior; do not fabricate an address to meet the parser. |

The score is an internal completeness measure, not a Google score or assurance of AdSense approval. A 60-character threshold does not establish editorial quality.

## Proposed outcome and milestones

1. Confirm the baseline and produce a ranked enrichment backlog.
2. Pilot 10 confirmed organizations, then expand to 50 confirmed organizations if the method produces useful information.
3. Pilot target: at least 40 of the 50 reach score 5 or higher, with every changed fact supported by evidence. Record all unsuccessful research and excluded candidates as well.
4. Subsequent planning target: 250 retained, valid profiles at score 5 or higher, versus 128 initially. This requires at least 122 actual upgrades from the initial cohort if no high-scoring records are excluded. Reassess feasibility after the pilot; never pad content to meet the target.
5. Keep the remaining records on an honest backlog when public information is insufficient. Do not aim for every record to score 7.

## Research and editorial rules

For each candidate:

- Establish that it is a motorcycle organization, and identify the exact chapter/city before drafting.
- Prefer the club's own website, official chapter page, or national organization's chapter directory. An accessible official social page can supply evidence; unavailable social content is not a reason to bypass access restrictions.
- Use other directories to discover leads, not as the sole source of a rewritten description.
- Gather at least three distinct club-specific facts for a substantive summary: for example purpose, riding focus, chapter affiliation, published membership criteria, or public first-contact procedure.
- Write original prose, normally two short paragraphs. Roughly 80–150 words is a drafting guide, not a quota. Fewer accurate words are preferable to repetition.
- Do not claim "active," "accepting members," "family friendly," or a particular legal/tax status without evidence for that exact claim.
- Add official website and phone details only when attributable to that organization. No phone number is required if the organization does not publish one.
- Record URLs, dates actually checked, and factual notes in original words. Do not commit copied source text or private contact details.
- Complete a factual review separately from the drafting pass. An unchanged description copied from a parent organization is not chapter-specific enrichment.

## File map

Existing files to modify during implementation:
- lib/types.ts: enrichment and evidence types.
- lib/data.ts: apply reviewed enrichment once before downstream queries; honor reviewed exclusions.
- app/clubs/[slug]/page.tsx: show evidence links and the actual information-check date for enriched profiles.
- package.json: content:audit and content:sources commands.
- .gitignore: ignore generated local reports.
- README.md, CLAUDE.md, MONETIZATION.md: actual enrichment and quarterly maintenance procedure.

New files:
- lib/content-audit.ts: deterministic completeness reports and candidate ranking.
- lib/enrichment.ts: validation and application of reviewed records.
- lib/source-check.ts: comparison of source-check observations.
- data/club-enrichment.json: approved original summaries, verified contacts, evidence, and exclusions.
- data/content-source-baselines.json: hashes from sources actually reviewed, not synthetic dates.
- scripts/audit-content.ts: writes JSON and CSV reports under .content-reports/.
- scripts/check-content-sources.ts: checks only recorded approved source URLs.
- .github/workflows/content-source-check.yml: monthly read-only source report with downloadable artifacts.
- tests/lib/content-audit.test.ts
- tests/lib/enrichment.test.ts
- Extend tests/lib/descriptions.test.ts to include the effective enriched descriptions.
- tests/lib/source-check.test.ts
- tests/pages/club-evidence.test.ts

## Task 1: Produce a reproducible baseline and ranked backlog

**Files:** Create lib/content-audit.ts, scripts/audit-content.ts, tests/lib/content-audit.test.ts; modify package.json and .gitignore.

**Interfaces:**
- auditContent(records: Club[]): ContentAudit
- ContentAudit contains recordCount, listableCount, listableScoreHistogram, listableAtLeastFive, missingDescriptionCount, missingWebsiteAndPhoneCount, records, and candidates. records contains { placeId, slug, score, listable, editorialStatus } for every input record so before/after comparisons can retain the original cohort. The CLI passes getAllClubs(); recordCount is the deduplicated count, not the raw JSON row count.
- Each candidate contains placeId, expectedName, slug, state, score, descriptionPoints, website, missingFields, and potentialScoreAfterDescription.
- Reuse clubContentScore, isListableClub, and related existing helpers rather than reimplementing scoring.
- Rank initially by an existing website, potential to reach 5 through description alone, current low score, then slug for stable ordering. If Search Console page data is supplied, prioritize relevant existing impressions/clicks before these tie-breakers.

- [ ] Write tests asserting that a score-3 fixture with no description and an official website projects to 5; a score-3 fixture with a one-point description projects to 4, not 5; excluded/chapter rows cannot enter the indexed-profile candidate cohort.
- [ ] Run pnpm exec tsx --test tests/lib/content-audit.test.ts and verify the missing implementation causes failure.
- [ ] Implement the audit and JSON/CSV output. Keep generated reports ignored; reports never edit content.
- [ ] Run the test and pnpm content:audit. Reconcile the resulting current baseline with the table above, explaining any intervening data change.
- [ ] Commit the independently usable audit tooling.

## Task 2: Add a reviewed enrichment file that survives scrape reruns

**Files:** Modify lib/types.ts, lib/data.ts, and tests/lib/descriptions.test.ts; create lib/enrichment.ts, data/club-enrichment.json, tests/lib/enrichment.test.ts.

**Interfaces:**
- EnrichmentField = 'description' | 'website' | 'phone' | 'listingStatus'.
- ClubEvidence = { url: string; checkedAt: string; fields: EnrichmentField[]; factNotes: string[] }.
- ClubEnrichment = { placeId: string; expectedName: string; listingStatus: 'confirmed-club' | 'excluded'; changes: { description?: string; website?: string; phone?: string }; evidence: ClubEvidence[]; verifiedAt: string; reviewNote: string }.
- Club gains optional editorial: ClubEnrichment.
- validateEnrichments(records: Club[], entries: ClubEnrichment[]): string[].
- applyApprovedEnrichments(records: Club[], entries: ClubEnrichment[]): Club[].
- Apply the validated enrichment after slug deduplication in lib/data.ts. An excluded editorial status makes isMotorcycleClub return false. A confirmed status still obeys existing category, chapter, and content-depth rules.

- [ ] Write tests for exact ID/name matching, duplicate/orphan IDs, invalid or future dates, evidence missing for a changed field, and unsupported URL schemes. Approved descriptions must match a description-attributed evidence entry with at least three factual notes.
- [ ] Include preservation assertions: an updated raw phone is overlaid by the explicitly reviewed phone, unknown fields/slugs remain unchanged, and exclusion removes a record from listing/statistic helpers without removing its raw row.
- [ ] Run the test and verify failure before implementation.
- [ ] Extend the existing copied-description regression checks to the effective records returned by getAllClubs(), so approved overlays cannot bypass them.
- [ ] Implement validation and pure application. Fail clearly for malformed approved data; pending proposals do not belong in the approved file. Do not add fuzzy matching.
- [ ] Run tests and the audit with an empty approved file; existing eligibility and scores must remain unchanged.
- [ ] Document that the existing scraper is additive discovery, not a reliable refresh engine. Reviewed enrichment changes use this separate source-aware workflow.
- [ ] Commit the data contract and integration.

## Task 3: Research and enrich 10 pilot organizations

**Files:** Populate data/club-enrichment.json; record source hashes in data/content-source-baselines.json only for successfully reviewed sources.

- [ ] Select 10 candidates projected to reach 5, spread across several states and organization types. Confirm identity first. Candidates such as Davis Bike Club or Bikes Blues & BBQ require classification review; their existing inclusion does not prove they are motorcycle clubs.
- [ ] Record unsupported, ambiguous, excluded, and unreachable candidates in the generated research report. For confirmed non-clubs, save an evidence-backed exclusion entry instead of writing motorcycle-club copy.
- [ ] Research each confirmed organization under the editorial rules. Draft original summaries and verify available organizational contact details.
- [ ] Review every changed fact against its recorded sources; store only approved entries. checkedAt records source retrieval; verifiedAt records the actual factual review, not a build or link-ping date.
- [ ] Run pnpm content:audit and pnpm test. Inspect representative rendered profiles after Task 5 before publishing.
- [ ] Record score movement, confirmed-contact coverage, excluded candidates, unresolved candidates, research time, and provider usage if any.
- [ ] Continue only if the majority of researched confirmed clubs yield useful independent details. If yield is poor, adjust candidate selection or reduce batch size before expanding.
- [ ] Commit the first reviewed batch. Do not claim a target score was achieved until the generated report confirms it.

## Task 4: Expand the approved pilot to 50 organizations

**Files:** Continue data/club-enrichment.json and reviewed source baselines.

- [ ] Use the pilot findings to select the next 40 confirmed organizations. Work in reviewable batches of 10; do not publish a bulk unsourced rewrite.
- [ ] Apply the same source, identity, originality, and date standards to every batch.
- [ ] Run the audit after each batch. Preserve a list of the original cohort IDs so exclusions cannot masquerade as enrichment gains.
- [ ] Target 40 of the 50 confirmed pilot organizations at score 5 or higher. If the target is missed, report why and leave unsupported fields unchanged.
- [ ] Commit each reviewed batch after the repository's required checks. Record effort per successful enrichment to estimate subsequent scope.

## Task 5: Expose sources and review dates on enriched profiles

**Files:** Modify app/clubs/[slug]/page.tsx; create tests/pages/club-evidence.test.ts.

- [ ] Write tests that a reviewed profile displays its checked date and source links; an untouched profile displays no invented date; evidence is escaped; an exclusion cannot become an indexed profile; no "club-confirmed" or "active" badge is inferred from a website fetch.
- [ ] Run pnpm exec tsx --test tests/pages/club-evidence.test.ts and verify failure before implementation.
- [ ] Render a small information/source block using the existing page layout and original summaries already consumed through lib/data.ts. Label it "Information checked" and use verifiedAt. Collapse duplicate URLs. Do not display internal reviewNote or factNotes.
- [ ] Verify old profiles still render, scoring thresholds and ad eligibility are unchanged, and the new block does not imply club endorsement.
- [ ] Run the tests and inspect representative enriched, untouched, and excluded pages.
- [ ] Commit the visible evidence block.

## Task 6: Detect future source changes without adding weekly human work

**Files:** Create lib/source-check.ts, scripts/check-content-sources.ts, tests/lib/source-check.test.ts, .github/workflows/content-source-check.yml; modify package.json. SourceBaseline and SourceObservation are exported from lib/source-check.ts; comparison tests pass observations without making network requests.

**Interfaces:**
- SourceBaseline = { url: string; reviewedAt: string; contentHash: string }.
- SourceObservation = { url: string; checkedAt: string; status: number | null; finalUrl?: string; contentHash?: string; error?: string }.
- compareSource(baseline: SourceBaseline, observation: SourceObservation): { state: 'unchanged' | 'changed' | 'redirected' | 'unavailable'; reason: string }.

- [ ] Write tests: same hash = unchanged; different hash = changed; a different final URL = redirected; timeout/403/404 = unavailable, with no automatic inactive/closed conclusion. Check that observations never change reviewedAt, approved descriptions, or scores.
- [ ] Run the test and verify failure before implementation.
- [ ] Check distinct recorded URLs monthly, sequentially per host, with a 15-second timeout and a maximum 2 MB response. Use the existing cheerio dependency for normalized main text when available. A text hash change is a review hint, not proof a club fact changed.
- [ ] Generate a JSON/CSV change report and a GitHub Actions summary. The workflow uses cron '23 13 1 * *' (monthly at 13:23 UTC on day 1) plus workflow_dispatch, Node 22, pnpm 10, and pnpm install --frozen-lockfile. It uploads artifacts with 90-day retention and has contents: read. It requires no API keys. Do not commit, publish, send messages, or update approved evidence automatically.
- [ ] Treat source-level access failures as report entries; fail the workflow for a broken script or invalid input. The quarterly procedure reads the latest report.
- [ ] Test source comparison logic and inspect a manually generated report. Do not claim the schedule has run successfully until an actual run is observed.
- [ ] Commit monitoring.

## Task 7: Verify the pilot and set the next enrichment batch

**Files:** Update README.md, CLAUDE.md, and MONETIZATION.md with the actual commands and quarterly procedure.

- [ ] Run pnpm test, pnpm typecheck, pnpm lint:app, and pnpm build; require successful output for all four before pushing implementation.
- [ ] Compare before/after reports: original cohort scores, actual profiles crossing 5, descriptions added, official contacts added, exclusions, unresolved records, and score distribution.
- [ ] Confirm MIN_CLUB_SCORE_FOR_INDEX and scoring weights did not change, no new images/reviews were introduced, and every approved change has field-attributed evidence.
- [ ] Verify the sitemap and ad eligibility follow existing rules. Review legitimate population changes explicitly; do not auto-reset the production monitoring baseline.
- [ ] Replace the fixed "five to ten new guides" quarterly quota with evidence-led enrichment and re-verification sized from the pilot's measured effort.
- [ ] Set the next target toward 250 valid score-5+ profiles only if research yield supports it. Next tackle remaining low-scoring profiles with official websites, then profiles whose official sources can be found reliably.
- [ ] Publish only through the separately authorized implementation/release workflow. Observe actual Search Console and revenue changes later; no traffic or approval gains are guaranteed.

## Acceptance criteria

- The report identifies real data enrichment separately from changes in population or eligibility.
- The 50-profile pilot has a sourced outcome report, including failures; target 40 reach score 5+.
- Every approved summary has three distinct supported facts, original wording, source attribution, and a real review date.
- Source and reviewed contact data survive discovery-scraper reruns.
- Unsupported organizations stay unresolved or excluded; no fabricated content fills their gaps.
- Monthly monitoring produces a review report while human upkeep remains quarterly.
- No accounts, database, new paid service, or operator identity is introduced.

## Planning status

Proposed and ready for review. No application code, club content, scoring rules, production configuration, or deployment has been changed by creating this document. The 10/50/250 milestones are proposed targets, not completed results.
