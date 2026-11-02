# Market Depth Growth Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a useful Bay Area club-discovery pilot that supports organic search, AI discovery and initial AdSense revenue.

**Architecture:** Extend the existing approved enrichment overlay, resolve evidenced aliases at build time, and project sourced comparison facts into a small client filter component. Keep full content prerendered, reuse current club/chapter/guide routes and analytics, and retain publication gates.

**Tech Stack:** Next.js 16, React 19, TypeScript strict, Tailwind CSS 4, JSON, Node 22, pnpm 10, existing node:test/tsx and Cheerio. No new dependencies.

**Spec:** [Approved growth design](../specs/2026-11-01-market-depth-growth-design.md). Read the spec and current `CLAUDE.md`, `README.md`, and `MONETIZATION.md` before execution. A readable design is also at https://chatgpt.com/space/page_be981356670c8191af3bd66d6f483e3f ; chat records its approval.

## Global Constraints

- “AdSense is the initial revenue model; approval is pending and current revenue is zero, as reported in this conversation.”
- “Retain Next.js, prerendered JSON, TypeScript, Tailwind and current branding.”
- “No database, login, additional framework, paid traffic, scraped-description reuse, invented experience, daily content schedule or broad visual redesign.”
- “Retain raw records, original IDs and stable historical URLs.”
- “City and state indexing/ad eligibility retain the newer main rules: two source-backed profiles per hub and the existing profile content gate.”
- “For unknown facts use ‘Not published in the sources reviewed’ within the pilot comparison.”
- “Preserve existing evidence, actual check dates and original publication dates.”
- “No third-party outreach or form test messages.”
- “No AdSense application submission, account changes, production deployment, push or PR in this design scope.”
- Use Node 22/pnpm 10, existing Tailwind amber/gray styling, organizational voice and no operator identity. Preserve current consent defaults and affiliate disclosures. Add no new unreviewed images and do not reset production health history.

## Review Focus

1. A sourced location correction can move a profile to a municipality missing from imported city data: create coherent derived geography and preserve the historical profile URL. Task 1 tests this.
2. Two confirmed aliases can target the same entity: counts and filter results must contain that entity once; aliases must not target excluded/basic entities. Task 2 tests this.
3. A legacy field or stale description can look plausible: new filters and public facts must use approved matching evidence, with internal notes absent. Tasks 1 and 4 test this.
4. A combined filter can have no matches while some entries have unknown fields: show a distinct empty result, unknown coverage and a working reset; render all eligible rows without JavaScript. Task 4 tests this.
5. Analytics can be absent, fail, or run before consent initialization: navigation still works, payloads remain bounded, and tracking never changes consent. Task 6 tests this.

## File Responsibilities

| Files | Responsibility |
| --- | --- |
| `lib/types.ts`, `lib/enrichment.ts` | Optional discovery/location changes and field-attributed validation |
| New `lib/club-geography.ts`; existing `lib/data.ts` | Coherent effective geography and public population selection |
| New `lib/club-aliases.ts`, `data/club-aliases.json` | Validated identity redirects without raw deletion |
| `next.config.ts`, club route, `lib/verified-chapters.ts` | Alias routing and existing chapter references |
| New `data/market-pilots.json`, `lib/markets.ts` | Frozen cohort, holds, selectors and regional-guide gate |
| New `lib/market-discovery.ts` | Client-safe comparison types, labels and pure filtering |
| New `lib/market-projection.ts` | Server-only approved fact/provenance projection |
| New `components/ClubComparison.tsx`; state/city/club routes | Usable comparisons and profile facts |
| `lib/guides.ts`, guide route, sitemap | Conditional regional guide and crawlable connections |
| New `lib/analytics.ts`, `components/TrackedClubLink.tsx` | Bounded, optional interaction measurement |
| New `tests/fixtures/market-clubs.ts`; focused tests below | Shared valid fixtures and meaningful regressions |
| New pilot outcome report; `MONETIZATION.md`, `README.md`, `CLAUDE.md` | Research outcomes, measurement instructions and updated schema rules |

## Task 1: Extend the approved facts boundary and geography

**Files:** Modify `lib/types.ts`, `lib/enrichment.ts`, `lib/data.ts`, `CLAUDE.md`; create `lib/club-geography.ts`, `tests/fixtures/market-clubs.ts`, `tests/lib/club-geography.test.ts`; extend `tests/lib/enrichment.test.ts`.

**Interfaces:**
- Define `ClubKind = 'traditional-mc' | 'riding-club' | 'brand-owners' | 'offroad-racing' | 'advocacy' | 'other'` and `RidingActivity = 'road-social' | 'touring' | 'adventure-dual-sport' | 'trail-offroad' | 'racing'` in `lib/types.ts`.
- Define `ClubDiscovery` with optional `kind`, `activities: RidingActivity[]`, `membershipEligibility`, `bikeRequirements`, `guestParticipation`, `contactUrl`; all remaining values are strings. `Club.discovery?: ClubDiscovery` contains effective approved facts only.
- Extend `ClubEnrichment.changes` with optional `name`, `location: { city: string; state: string; address?: string }`, `discovery: ClubDiscovery`. Extend `EnrichmentField` with `name`, `location` and `discovery.${keyof ClubDiscovery}`. Keep `expectedName` matched against raw identity, not the corrected display name.
- Preserve `validateEnrichments(records: Club[], entries: unknown): string[]` and `applyApprovedEnrichments(records: Club[], entries: unknown): Club[]`.
- New pure `applyReviewedLocation(club: Club, location: NonNullable<ClubEnrichment['changes']['location']>, states: State[]): Club` and `deriveDirectoryCities(records: Club[], imported: City[]): City[]` in `lib/club-geography.ts`.
- Fixtures export `makeReviewedClub(overrides?: Partial<Club>): Club` and `makeEnrichment(club: Club, changes?: ClubEnrichment['changes']): ClubEnrichment`, with valid static past dates, sources and three distinct description fact notes.

- [ ] **Step 1: Reconcile the baseline and freeze inputs.** Confirm a clean worktree; fetch current main through configured access, then merge its changes into the work branch without discarding the approved spec. If remote access is unavailable, record it and use the available `origin/main` for local implementation without claiming remote freshness. Check current Node/pnpm versions and select Node 22/pnpm 10 using available runtime tooling. Preserve the newer source-description gate and chapter registry. Freeze the 23 cohort IDs/slugs and baseline sitemap/eligibility in `work/market-depth/baseline.json`; explain any population difference before proceeding. Keep scratch files out of commits.
- [ ] **Step 2: Write failing tests.** Add fixtures and assertions for unsupported discovery enums, empty arrays/text, unsafe contact URLs, missing per-field attribution and future dates; old valid overlays remain valid. Reject edits to slugs, IDs, reviews and ratings. Prove the location behavior with:

```ts
const before = makeReviewedClub({ slug: 'historical-city-slug' });
const moved = applyReviewedLocation(before, { city: 'New City', state: 'ca' }, states);
assert.equal(moved.slug, before.slug);
assert.equal(moved.citySlug, 'new-city');
assert.equal(moved.stateName, 'California');
assert.notEqual(moved.address, before.address); // No retained address from the old city.
assert.ok(deriveDirectoryCities([moved], []).some(c => c.slug === 'new-city' && c.state === 'ca'));
```

Require an omitted address on a moved city/state to clear the old address; same-city corrections may retain it. Never infer a new street address.
- [ ] **Step 3: Run the focused tests red.** `node --import tsx --test tests/lib/enrichment.test.ts tests/lib/club-geography.test.ts`. Expect failures for the new contract, not an unrelated runner failure. This runner avoids the tsx CLI IPC restriction observed during planning.
- [ ] **Step 4: Implement the interfaces.** Validate each changed discovery field against attributed evidence and nonempty fact notes; descriptions retain their existing three-fact rule. Validate known lowercase state codes and derive state names/city slugs consistently. Deep-clone inputs, merge approved discovery changes without losing retained approved facts, and reject unrecognized fields. Generate missing effective city records without removing historical city routes. Update repository schema guidance to match this approved extension.
- [ ] **Step 5: Run focused tests green and typecheck.** Include existing publication/state tests; all pass and raw JSON remains unchanged. Commit as `feat(content): support sourced discovery facts and locations`.

## Task 2: Resolve confirmed identity aliases across public consumers

**Files:** Create `lib/club-aliases.ts`, empty `data/club-aliases.json`, `tests/lib/club-aliases.test.ts`; modify `lib/data.ts`, `next.config.ts`, `app/clubs/[slug]/page.tsx`, `lib/verified-chapters.ts`; extend `tests/lib/publication.test.ts`, `tests/lib/public-clubs.test.ts`, `tests/lib/verified-chapters.test.ts`.

**Interfaces:** Define `ClubAlias { aliasSlug: string; canonicalSlug: string; sources: { url: string; checkedAt: string }[]; reviewNote: string }`. Export pure `validateClubAliases(records: Club[], entries: unknown): string[]`, `resolveClubSlug(slug: string, aliases: readonly ClubAlias[]): string`, and `buildAliasRedirects(aliases: readonly ClubAlias[]): { source: string; destination: string; permanent: true }[]`. This module imports no directory singleton. `getAllClubs()` retains stored rows for internal validation/static historical routes; public populations exclude alias rows; `getClubBySlug()` resolves a valid alias to its canonical record.

- [ ] **Step 1: Write failing tests.** Missing targets, self-links, duplicate aliases, chains/cycles and basic/excluded targets are invalid. Two aliases may point to one reviewed entity. Distinct chapters remain distinct. Aliases need safe sources and real check dates. Assert:

```ts
assert.equal(resolveClubSlug('old-profile', aliases), 'reviewed-profile');
assert.deepEqual(buildAliasRedirects(aliases)[0], {
  source: '/clubs/old-profile', destination: '/clubs/reviewed-profile', permanent: true,
});
assert.equal(resolveClubSlug('unrelated-profile', aliases), 'unrelated-profile');
```

Integration assertions pin one public entity across counts, city/state hubs, search and sitemap when multiple aliases target it. Test that a preexisting verified-chapter reference resolves to the canonical reviewed entity only when its reviewed city/state still match.
- [ ] **Step 2: Run new alias and affected existing tests red.** Expect absent alias behavior to fail.
- [ ] **Step 3: Implement explicit alias resolution.** The pure alias module validates structure, sources and approved target identity; after constructing its alias map, `lib/data.ts` also rejects targets failing the full existing publication/detail gate. Keep the alias module free of imports from the directory singleton to avoid initialization cycles. Reject chains rather than silently following them. Filter aliases from `isMotorcycleClub` and hence listable/thin/statistical consumers. Preserve all raw rows. Extend host redirects with alias redirects in `next.config.ts`; call `permanentRedirect` before profile rendering for an alias route. Preserve chapter identity validation and existing explicit matches; do not infer chapter affiliations from names.
- [ ] **Step 4: Run focused tests green and typecheck.** Empty production alias data must preserve current populations. Commit as `feat(directory): resolve evidenced club aliases`.

## Task 3: Research and publish the bounded Bay Area cohort

**Files:** Modify `data/club-enrichment.json`, `data/club-aliases.json`, `data/content-source-baselines.json` only for actually reviewed baselines, `lib/source-check.ts`, `scripts/check-content-sources.ts`, `tests/lib/source-check.test.ts`; create `data/market-pilots.json`, `lib/markets.ts`, `tests/lib/markets.test.ts`, `docs/reports/2026-11-01-market-depth-pilot.md`. Raw captures/outcomes with research notes live under `work/market-depth/`.

**Interfaces:** Define `MarketDefinition { id: string; title: string; state: string; candidateSlugs: string[]; heldSlugs: string[]; guideSlug: string }`. Freeze `sf-bay-area`, California, the six approved stored-city buckets and their baseline candidate slugs. Export `getMarketClubs(marketId: string): Club[]` (canonical, deduplicated, reviewed, no held/excluded entities), `getMarketGuideGate(clubs: Club[]): { eligible: boolean; organizationCount: number; cityCount: number; actionableCount: number }`, and `validateMarkets(value: unknown, records: Club[]): string[]` from server-only `lib/markets.ts`. Unknown market IDs return an empty list.

- [ ] **Step 1: Write gate/selection tests and run red.** Five unique reviewed organizations across three municipalities with three actionable entries qualify. Four organizations, two municipalities, or two actionable entries fail independently. Actionable means a published activity or membership fact plus an approved official contact route. Aliases cannot inflate the gate; held records and basic profiles do not qualify. Reject orphan/duplicate cohort slugs and holds outside the selected canonical cohort.
- [ ] **Step 2: Implement market validation and selectors, then run green.** Read the frozen manifest, resolve aliases and apply existing publication gates. Count unique city/state pairs from effective geography. Keep the guide gate independent of ads and numeric content scores. Extend monthly monitoring with pure `collectReviewedSourceUrls(enrichments: readonly ClubEnrichment[], aliases: readonly ClubAlias[]): string[]` in `lib/source-check.ts`; test that it returns a sorted unique union of both source sets and changes neither input. Make `scripts/check-content-sources.ts` use this union, retaining its read-only report/baseline behavior and current schedule.
- [ ] **Step 3: Research every frozen record.** Use retrieved official/authoritative sources through Firecrawl; check identity before collecting facts. Start with duplicates/location conflicts, then existing reviewed profiles, then other candidates. Record actual time, attempted URLs, source check dates and outcome per record. Inspect cross-cohort matches when necessary. Do not send messages or forms. A national homepage alone does not verify a local chapter.
- [ ] **Step 4: Apply only supported changes.** Add original summaries with three facts and explicit discovery evidence; preserve earlier sources. Add confirmed aliases or coherent location/name corrections. Put unresolved geography/identity in `heldSlugs` for the new comparison and explain the hold privately. A failed source does not establish closure/exclusion. Record published, excluded, merged and unresolved outcomes separately; no success quota.
- [ ] **Step 5: Verify the cohort and commit.** Existing enrichment/alias/market/publication tests pass; every frozen record has an outcome. Audit before/after against the fixed cohort and record actual guide-gate counts and research effort. No invented monitor hash or photo changes. Commit as `feat(content): research Bay Area club discovery pilot`.

## Task 4: Render sourced comparisons and filters

**Files:** Create `lib/market-discovery.ts`, `lib/market-projection.ts`, `components/ClubComparison.tsx`, `tests/lib/market-discovery.test.ts`, `tests/components/ClubComparison.test.ts`; modify `app/state/[code]/page.tsx`, `app/city/[state]/[city]/page.tsx`, `app/clubs/[slug]/page.tsx`; extend `tests/lib/public-clubs.test.ts`, `tests/pages/club-evidence.test.ts`, `tests/pages/curation.test.ts`.

**Interfaces:** Client-safe `PublicComparisonRow` contains `id`, `slug`, `name`, `city`, `state`, `profileHref`, optional `ClubDiscovery` facts and `sources: Partial<Record<keyof ClubDiscovery, { url: string; checkedAt: string }[]>>`. Export pure `filterComparisonRows(rows, filters: { kind?: ClubKind; activity?: RidingActivity }): PublicComparisonRow[]` and `comparisonCoverage(rows): { missingKind: number; missingActivities: number }`. Server-only `toPublicComparisonRow(club: Club): PublicComparisonRow | undefined` returns nothing for basic/held/noneligible data and emits only evidence-backed facts matching effective approved values. `ClubComparison({ rows, marketId, heading })` accepts projected rows only.

- [ ] **Step 1: Write failing behavior tests.** Positive filters omit unknown values; filters combine with AND. All rows appear with empty filters. Coverage counts are independent of filtered results. Stale/unattributed discovery values cannot leak into rows. Add a valid reviewed fixture with sentinel internal notes and assert:

```ts
assert.equal(filterComparisonRows(rows, { kind: 'riding-club', activity: 'touring' }).length, 0);
assert.deepEqual(filterComparisonRows(rows, {}), rows);
assert.doesNotMatch(JSON.stringify(projected), /PRIVATE NOTE|reviewNote|factNotes|expectedName/);
assert.match(renderToStaticMarkup(createElement(ClubComparison, props)), /Not published in the sources reviewed/);
```

Server rendering must contain every initial row, source/check-date text, profile links and contact routes, not a loading placeholder. Extend the client import-graph test to block imports of the market manifest, aliases and private enrichment data into client modules.
- [ ] **Step 2: Run focused tests red.** New filtering/projection/rendering tests fail for the intended missing behavior.
- [ ] **Step 3: Implement comparison helpers and UI.** Add labeled selects, reset button, an `aria-live` result count, zero-results guidance and selected-field unknown coverage. Use semantic table headers and a labeled horizontal-scroll wrapper on small screens. Escape text normally. Put the full comparison on California and eligible pilot city hubs, constrained to that city's effective records where applicable. Show reviewed facts with provenance on full profiles. Label pilot scope, link wider directory coverage, and preserve existing cards/basic contacts. Nonpilot/sparse hubs gain no empty comparison block or changed ad eligibility.
- [ ] **Step 4: Run tests green, then browser checks.** Verify keyboard selection/reset and combined empty results at mobile and desktop widths, plus JavaScript-disabled initial HTML. Confirm no filter URLs or new indexable search pages. Commit as `feat(discovery): add sourced club comparisons and filters`.

## Task 5: Connect the regional guide and entity metadata

**Files:** Modify `lib/guides.ts`, `app/guides/[slug]/page.tsx`, `components/SchemaMarkup.tsx`, `app/clubs/[slug]/page.tsx`, `app/state/[code]/page.tsx`; create `tests/pages/market-guide.test.ts`; extend `tests/pages/guide-page.test.ts`, `tests/pages/club-page.test.ts`.

**Interfaces:** Add optional `marketId?: string` to `Guide`. Preserve `guides`, `getGuide`, `guideWordCount` contracts. Add pure `selectPublishedGuides(standard: Guide[], candidates: Guide[], isEligible: (marketId: string) => boolean): Guide[]` in `lib/guides.ts` so tests can supply gate outcomes without module mocking. Export the normal guide list plus the Bay Area guide only when `getMarketGuideGate(getMarketClubs('sf-bay-area')).eligible` passes; all consumers, including sitemap and static params, use that single list. Import `Guide` as a type in any shared helper to avoid circular runtime dependencies. Reuse `ClubComparison` for a guide carrying `marketId`.

- [ ] **Step 1: Write gate and metadata tests red.** The guide is absent from `guides`, static params and sitemap under each failing boundary and present at the exact five/three/three boundary. Existing guide dates remain intact. Corrected profile location agrees across visible text, canonical metadata and Organization address; old city text may remain only in the preserved slug. Organization `@id` always uses the canonical profile. Existing chapter relations are emitted only when an explicit sourced match exists and the relationship is visible on the page.
- [ ] **Step 2: Implement the qualified content branch.** If research passes, write the original regional guide at `motorcycle-clubs-san-francisco-bay-area` with scope, an opening answer, comparison, sourced local context, limitations, and useful joining/verification links. Use actual editorial dates and retrieved references, not generic location-swapped prose. Include it through the single gate-controlled guide list. If research fails, do not invent content: retain conditional support, omit the guide and record precise gate counts in the outcome report.
- [ ] **Step 3: Connect crawlable links and truthful schema.** Link qualifying guide/hub/profile destinations bidirectionally at relevant points. Add ItemList for comparison destinations and preserve existing BreadcrumbList/Organization/Article behavior. Reuse explicit verified-chapter matches, and retain the no-aggregateRating rule. No new AI file, API, crawler-policy change or type-by-city route.
- [ ] **Step 4: Run affected tests green.** Inspect server-rendered content and sitemap entries for both gate branches using fixtures. Existing national guides, ads and affiliate tests remain green. Commit as `feat(content): connect the qualified Bay Area guide`.

## Task 6: Measure useful actions without changing consent

**Files:** Create `lib/analytics.ts`, `components/TrackedClubLink.tsx`, `tests/lib/analytics.test.ts`; modify `components/ClubComparison.tsx`, `components/ClubCard.tsx`, `app/clubs/[slug]/page.tsx`, `MONETIZATION.md`, `README.md`; extend `tests/components/GoogleAnalytics.test.ts`.

**Interfaces:** Define `ClubInteraction` as a discriminated union for `club_profile_open`, `club_official_contact`, `club_filter_change`, `club_filter_empty`. Payloads use a controlled market ID, stable club ID, enum filter values, bounded result count and controlled `surface: 'comparison' | 'profile' | 'card'` as applicable. Export `emitClubInteraction(event: ClubInteraction, send?: (name: string, params: Record<string, string | number>) => void): void`; default sender uses an already initialized `window.gtag` and a configured measurement ID, otherwise no-ops. `TrackedClubLink` wraps an ordinary anchor, preserves navigation and emits profile/contact actions from user clicks only. No free text, contact details, arbitrary URLs or ad-click events.

- [ ] **Step 1: Write failing sink tests.** Exact four event names and whitelisted keys reach a fake sender; unexpected runtime keys are dropped. Invalid runtime enum values are rejected. Missing ID/gtag and a throwing sender do not throw or prevent navigation. Event emission never sets up gtag, changes consent or imports private data. Existing initialization tests continue to assert denied defaults before config.
- [ ] **Step 2: Run red, implement the helper and tracked links, then run green.** Keep existing GoogleAnalytics/consent setup. Profile navigation and contact clicks emit once; filter-change emits once per actual user change/reset, and filter-empty only for a resulting zero-match selection, never on mount. Keep the initial server markup ordinary linked HTML.
- [ ] **Step 3: Verify browser behavior using a local test sink.** Capture events without an external analytics request; verify absent analytics and a throwing stub leave links and filters functional. Validate real debug-view delivery only when an authorized configured destination is available; otherwise report it unverified. Do not fabricate production events.
- [ ] **Step 4: Document measurement and commit.** Explain 28/56/84-day comparisons, missing-vs-zero values, Search Console Web aggregation of Google AI features, recognizable assistant referrers and correct AdSense pageview/RPM denominators. Preserve quarterly upkeep; record research-time cost and external account checks. Commit as `feat(analytics): measure club discovery interactions`.

## Task 7: Verify the complete local release candidate

**Files:** Extend `docs/reports/2026-11-01-market-depth-pilot.md`; add `tests/pages/market-discovery.test.ts` for cross-template assertions and `scripts/check-market-output.mjs` for generated-output checks.

**Interfaces:** `scripts/check-market-output.mjs` exits nonzero on contradictions in generated `.next` public artifacts and writes a summary to `work/market-depth/output-check.json`. It is read-only against application data and never invokes a deployment, live email, analytics destination or health-baseline reset.

- [ ] **Step 1: Add meaningful final assertions.** Check a reviewed pilot, resolved alias, held/basic pilot, nonpilot profile, qualifying/sparse hubs, chapter hub, guide gate, search/legal/404. Assert canonical uniqueness, coherent locations, sitemap/ads/affiliate gates, public sources and no internal notes in public HTML/RSC/client JavaScript. Exclude server-only build bundles from the privacy scan. Verify Next redirect configuration and alias route behavior; verify HTTP 308 on the local server, including redirects to targets outside the original cohort.
- [ ] **Step 2: Run the required checks once after final edits.** With Node 22/pnpm 10 run `pnpm test`, `pnpm typecheck`, `pnpm lint:app`, `pnpm build`, and `git diff --check`. If the pnpm test script hits the documented tsx IPC restriction, run the identical complete suite via `node --import tsx --test 'tests/**/*.test.ts'`; report the exact successful command. Use session CA guidance if fonts need system trust. Run the output checker against the fresh build; all exit zero.
- [ ] **Step 3: Check the full local journey in the browser.** Hub/qualified guide → filters/comparison → canonical profile → official anchor. Verify desktop/mobile, keyboard, empty/reset, no-JavaScript content, canonical redirect and an ordinary navigation with analytics absent. Inspect link destinations without sending third-party messages or loading real ads for tests.
- [ ] **Step 4: Write the outcome report and final commit.** Record frozen-cohort outcomes, research time, alias/location changes, content gate outcome, sitemap delta, actual checks and any external limitations. Include pre-release measurement sources if accessible, or mark the baseline unavailable. Keep the newer curation gates and unrelated improvements intact. Commit as `docs: record Bay Area pilot verification and measurement`.
- [ ] **Step 5: Obtain whole-branch review and resolve findings.** Follow the selected execution workflow's reviewer requirement, then rerun only checks affected by fixes plus required final release checks. Present a concrete diff and outcome report. No push, PR, deployment or account operation follows automatically.

## Plan Coverage Review

The approved market boundary, evidence contract, geography and aliases map to Tasks 1–3; visible provenance and client privacy to Tasks 4 and 7; conditional local content, crawlable links and schema to Task 5; consent-preserving measurement and revenue denominators to Task 6; static build, ad eligibility, browser behavior and release boundaries to Task 7. Existing source monitoring is reused without automatic fact changes. All five Review Focus conditions have explicit owning tests. Function/type names in later tasks match their interface definitions above. Source-backed outcome counts and time remain execution results, not invented planning estimates.

## Execution Handoff

Recommended: **Native execution**. These seven stages share the enrichment/data/projection interfaces, and the research is a bounded 23-record batch; one implementer avoids repeated handoffs while a final independent review checks the complete change. Subagent-driven execution remains available if the user prefers a fresh implementer and reviewer for each task. Review this plan and choose the execution approach before product implementation.
