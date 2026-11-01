# AdSense Readiness Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enrich the wider motorcycle-club directory with supported original content and correct reader-facing trust gaps before reassessing AdSense eligibility.

**Architecture:** Preserve the existing canonical JSON and validated enrichment overlay. Independent researchers produce candidate evidence in scratch files; the primary implementer reviews and integrates the approved data. Existing server-rendered pages present the evidence without exposing internal notes.

**Tech Stack:** Node 22, pnpm 10, Next.js 16, React 19, TypeScript, node:test, existing Firecrawl retrieval.

**Spec:** `docs/superpowers/specs/2026-11-01-adsense-readiness-design.md`, approved in chat on November 1, 2026.

## Global Constraints

- Keep `MIN_CLUB_SCORE_FOR_INDEX`, city/state thresholds, and chapter-list rules unchanged during this enrichment pass.
- Preserve raw IDs, names, slugs, location, ratings, and reviews. Use the existing enrichment overlay for descriptions, website, phone, and evidenced exclusions.
- Three distinct source-supported facts per published description; no filler, invented activity, copied prose, new photos, or private operator/member details.
- Work on the provided `work` branch; no push, production merge, publication, PR, third-party messages, or health baseline reset.
- Reuse existing architecture and dependencies. Put research scratch under `/workspace/work/adsense-readiness/`.

## Review Focus

- A reused name or national homepage must not approve the wrong local chapter; inspect source identity anchors and defer ambiguous cases.
- A failed/redirected website must not become evidence of closure or an unrelated-club exclusion; distinguish source failure from identity findings.
- Rich-sounding prose must not stretch the retrieved source; match every factual clause to retained evidence.
- Dates and legacy contact fields must not imply broader verification than was performed; keep field attribution accurate.
- Internal research notes must remain out of generated HTML, JS, RSC payloads, and client props.

## Task 1: Research and integrate the 309-profile cohort

**Files:** modify `data/club-enrichment.json`; retain an initial cohort and per-record research outcomes in `/workspace/work/adsense-readiness/`; modify `data/content-source-baselines.json` only for genuinely retrieved and manually reviewed matching source hashes.

**Interfaces:** consume canonical `getAllClubs(): Club[]`, `isListableClub(Club)`, `hasOriginalDescription(Club)`, `ClubEnrichment` and `validateEnrichments(Club[], unknown): string[]`. Produce validated overlay entries and an outcome for every original cohort member.

- [ ] Freeze baseline metrics and all 309 cohort records; separate the 115 with website leads.
- [ ] Assign disjoint research batches; each outcome contains identity anchors, retrieved source URL/date, supported fact notes, proposed original summary or exclusion, and a precise deferred reason where unsupported.
- [ ] Review all candidate facts and identities before integrating. No agent edits the shared overlay.
- [ ] Validate overlay identity, evidence, uniqueness and protected fields using existing enrichment/descriptions tests and direct before/after comparison.
- [ ] For a corroborated parked website on an otherwise confirmed profile, distinguish an explicit evidenced removal from an omitted field. Test approved blank removal, missing evidence, invalid whitespace, protected-field preservation, and absence of the removed domain from public source links before implementation.
- [ ] Re-run the content audit and report original-cohort outcomes separately from population changes. Record actual elapsed research effort without inventing per-profile human time.
- [ ] Commit the validated data and outcome report after relevant tests pass.

## Task 2: Correct misleading profile presentation and explain editorial checks

**Files:** modify `app/clubs/[slug]/page.tsx`, `app/about/page.tsx`; test `tests/pages/club-page.test.ts` and `tests/pages/club-evidence.test.ts`.

**Interfaces:** existing `getRelatedClubs(Club, limit): Club[]` may include city or state matches; `closed_on` represents closed days, not opening hours. Existing approved checked-date/source display stays field-scoped.

- [ ] Add a failing regression assertion for a state-based related-club selection presented as same-city matches. Run the existing page-test style through direct tsx import and confirm failure.
- [ ] Change the related section heading to an accurate neutral label, retaining the existing selection.
- [ ] Replace the unsupported Hours label with a closed-days label when useful; omit the meaningless `Open All Days` sentinel because it establishes no meeting schedule. Add and observe a failing behavioral regression before changing rendering.
- [ ] Add a concise explanation to About: checked dates reflect specified reviewed fields, legacy details may remain unchecked, contact the club for current policies/activity, and listings do not imply endorsement. No invented credentials or operator identity.
- [ ] Run affected tests and the full suite; commit the narrow presentation changes.

## Task 3: Source and qualify existing rider guidance

**Files:** modify `lib/guides.ts`, `app/guides/[slug]/page.tsx`, and appropriate existing guide tests or a narrowly scoped new `tests/lib/guides.test.ts` if new reference logic requires it.

**Interfaces:** extend `Guide` with `sources?: { title: string; url: string }[]` if reference display is needed. Render only supplied, retrieved authoritative sources with accessible links. Preserve current sections and original prose.

- [ ] Audit consequential joining, safety, certification, and legal claims across the guides. Retrieve matching official sources; retain research evidence.
- [ ] Replace absolute cultural rules or claims of expertise with qualified, accurate guidance where sources vary. Do not manufacture a source that supports a different claim.
- [ ] If adding the source display, write a failing render test for a guide with source references, then implement the small data/render extension and verify it passes.
- [ ] Set modification dates only for actually revised guides. Keep the original first-publication date in metadata/schema rather than overwriting it with the revision date.
- [ ] Run guide and full-suite tests; commit guide changes and verified references.

## Task 4: Verify the integrated site and document remaining monetization work

**Files:** create `docs/reports/2026-11-01-adsense-readiness.md`; update `MONETIZATION.md` and `README.md` only where implementation changes make existing instructions inaccurate.

- [ ] Run all tests with assertions visibly executed. The sandbox blocks tsx CLI IPC; use Node 22 `node --import tsx -e` to require every test file if necessary, rather than treating file-level runner successes as executed assertions.
- [ ] Run Node 22/pnpm 10 typecheck, application lint, and production build with the existing session TLS configuration. Inspect generated representative pages and public payload boundaries.
- [ ] Check live ads.txt, robots, sitemap, representative hard-load page behavior, and known official source redirects through available retrieval tools. Account-side consent, inbox, AdSense and Vercel settings need corresponding actual account evidence; otherwise list them as unverified with concrete steps.
- [ ] Produce before/after metrics, every research outcome, unresolved source/image rights risks, exact verification results, and the release checklist. Explicitly state that source changes have not been deployed.
- [ ] Obtain a fresh whole-branch review covering the approved spec and the five Review Focus conditions, address important findings with appropriate regressions, and re-run required checks.
- [ ] Leave the completed work on the provided branch without publishing or opening a PR. Hand over concise measured results and remaining external steps.

## Execution decisions

The user approved the design and explicitly instructed implementation to begin. Use native implementation with independent research delegation and one final fresh review; no additional execution-method approval is needed. Existing `work` branch and installed dependencies are the approved workspace and baseline. The initial 151 assertions passed through direct imports. Research can proceed alongside independent presentation work, but shared overlay edits and final checks remain sequential under the primary implementer.
