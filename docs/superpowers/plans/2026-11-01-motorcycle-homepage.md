# Motorcycle Homepage Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Apply the selected black, silver and orange motorcycle aesthetic to the existing homepage.

**Architecture:** Retain static rendering, data access and search behavior. Scope layout changes to the homepage and shared header/footer; keep inner page bodies intact. Reuse existing monetization infrastructure.

**Tech Stack:** Next.js 16.1.1, React 19.2.3, Tailwind 4, TypeScript, Node 22, pnpm 10, node:test through tsx.

**Spec:** Design brief below and `../specs/motorcycle-style-reference.png`. Reference imagery and copy are illustrative, not factual source material.

**Status:** Implemented locally on branch `work`, after reconciling to `a204b36`. See `docs/reports/2026-11-01-homepage-redesign.md` for verification, review fixes and implementation decisions. Not deployed.

## Design brief

Audience: middle-aged male motorcyclists. Strong motorcycle character without skulls, flames, fake distressing or corporate card layouts. The chosen approach uses close-up machinery and riders, heavy headings, orange accents, and alternating dark and light sections. Earlier atlas, field-guide, journal and blue-directory treatments were explored; the final black/orange direction was preferred.

Proposed implementation decisions:

- Asphalt `#17191A`, silver `#D9DBD8`, paper `#F5F5F2`, orange `#DF5727`. Use darker orange `#B83D12` for small links on light surfaces; dark text on bright-orange controls. Measure contrast.
- Barlow Condensed 600/700/800 through next/font for homepage headings and wordmark. Retain Inter for body and inner-page headings. Do not override all headings globally.
- Body at least 16px, metadata at least 14px, body line height 1.5, controls at least 44px tall. Max content width 1280px, mobile gutters 20px, desktop 32px. Corners 0–4px.
- Hero: “Your next ride starts with people.” Supporting copy: “Motorcycle clubs and riding groups. Find one near you.” Dark overlay keeps text readable independently of the photo.
- Order: dark header; photographic hero; silver search band; state browsing; compact club selection; dark guide section; light Amazon strip; concise methodology/submission links; dark footer. Retain access to cities and all guides.
- Use standalone generated or permitted editorial assets, not screenshots as page artwork or fictional photos attributed to real clubs. Do not carry over the mockup's unverified “rider-tested” claim.
- Preserve homepage Auto ads. Optional quarterly sponsor is configured in code and hidden when unsold. Reuse existing affiliate products and disclosures; mockup products are illustrative.

## Baseline discrepancy to resolve first

The earlier live homepage read showed reviewed profiles and coverage explanations. This checkout still has Top Rated, More Clubs to Explore and Featured Clubs sections. Its `SiteStats` has no reviewed-profile count. Before implementation, identify the deployed source revision and reconcile it with this branch using read-only refs/deployment metadata. Preserve newer live content; do not overwrite it with this older homepage. If reconciliation is unavailable, style work can proceed separately but homepage content replacement remains blocked. Do not invent reviewed counts or eligibility selectors.

## Global constraints

- Preserve routes, canonicals, SchemaMarkup, indexing thresholds and data files. Every count is computed.
- No database, auth, component library, new service, tracking or daily maintenance.
- Keep internal editorial evidence out of client props. `PublicClub` deliberately omits descriptions and editorial metadata.
- Home retains AdSenseLoader with no fixed AdSlot; the mockup ad box is not a production placeholder. Preserve thin-page gates and excluded routes.
- Preserve amazonSearchUrl, AFFILIATE_REL and AFFILIATE_DISCLOSURE. No fabricated reviews, prices or endorsements.
- Shared header/footer changes affect all routes; inner page redesigns are out of scope.
- The requested palette supersedes the old amber styling convention only within this scope. Update that convention when implementing.
- No push, PR, deployment or account-setting changes implied by this plan.

## Review focus

1. Long names and 200% zoom must wrap without horizontal scrolling (Task 3).
2. State-only, query-only, combined, whitespace and special-character searches must preserve navigation (Task 3).
3. Missing images/sponsor configuration must not leave broken or empty content (Tasks 1, 4).
4. Ads and affiliate disclosures must retain existing eligibility and link behavior (Tasks 4, 5).
5. Shared chrome must preserve mobile menus, keyboard access and non-content page behavior (Tasks 2, 5).

## Task 1: Establish baseline and assets

**Inspect:** app/page.tsx, lib/data.ts, lib/public-clubs.ts, lib/types.ts, CLAUDE.md, MONETIZATION.md.

**Create during implementation:** public/images/home/motorcycle-hero.webp; docs/design/homepage-assets.md.

- [x] Identify current deployed source revision and reconcile the discrepancy above before replacing content.
- [x] Run baseline `pnpm test`, `pnpm typecheck`, `pnpm lint:app`, `pnpm build`; record pre-existing failures separately.
- [x] Create or obtain a standalone hero asset, approximately 1920px wide, aiming below 250KB WebP. Record origin/usage basis and crop. Do not fetch new Google-sourced club photos.
- [x] Select up to three editorial images for existing guides; use deliberate text treatment if no suitable image exists.
- [x] Verify a dark background fallback and image dimensions prevent broken layout when imagery fails.

## Task 2: Visual foundation and shared chrome

**Modify:** app/globals.css, app/layout.tsx, components/Header.tsx, components/Footer.tsx, CLAUDE.md.

**Interface:** Tailwind tokens asphalt, silver, paper, brand, brand-ink and font-display. Existing Header/Footer signatures unchanged.

- [x] Add tokens and display-font variable. Keep Inter as the root body font and apply display styling explicitly.
- [x] Restyle header/footer with compact wordmark, dark surfaces and orange accent; retain existing navigation/search destinations.
- [x] Keep mobile menu named and expanded state exposed; verify Escape, navigation close and visible keyboard focus. Avoid crowding before switching to desktop nav.
- [x] Check homepage, /state/wa, a valid club page, /guides, /contact and 404 at mobile/desktop widths.

## Task 3: Homepage composition and search

**Modify:** app/page.tsx, components/HeroSearch.tsx.

**Create:** components/home/HomeHero.tsx, components/home/HomeClubList.tsx.

**Interfaces:** HomeHero({ children }: { children: React.ReactNode }) supplies hero composition and wraps the search block. HomeClubList({ clubs }: { clubs: PublicClub[] }) is server-rendered and uses existing name, city/state, category and slug fields. Keep HeroSearch's existing states prop contract. Any reconciled review labels remain server-side; never broaden client projections to expose evidence.

- [x] Replace centered gradient hero with the selected image composition. Use Next Image, explicit sizes, and high loading priority for the hero only.
- [x] Add persistent labels/IDs to search controls; keep visible Find clubs text at all widths. Stack inputs on mobile.
- [x] Preserve router semantics: state-only to /state/{code}; trimmed query to /search?q=... with optional state; empty input stays put.
- [x] Move existing indexable-state browsing near the top. Keep all-covered-state search choices.
- [x] Replace repeated card sections with one compact selection of up to six eligible clubs using the reconciled baseline selectors. No unsupported reviewed/newest/recommended labels.
- [x] Render three existing guides on dark background, retaining original slugs, descriptions and reading times, with All guides access.
- [x] Retain concise coverage methodology, cities/submission links, canonical metadata and both SchemaMarkup components.
- [x] Browser-check state-only, query-only, combined, blank and A&B searches, including keyboard submission and destination filtering.
- [x] Inspect 375/768/1024/1440px, 200% zoom, long names, font fallback and missing hero imagery. No horizontal overflow or hidden controls.

## Task 4: Monetization integration

**Modify:** components/AffiliateSection.tsx, app/page.tsx, MONETIZATION.md.

**Create:** lib/sponsors.ts, components/SponsorPlacement.tsx, tests/components/SponsorPlacement.test.ts, tests/components/AffiliateSection.test.ts.

**Interfaces:** AffiliateSection adds variant?: 'sidebar' | 'strip', default sidebar. QuarterlySponsor = { name: string; href: string; message: string }; QUARTERLY_SPONSOR: QuarterlySponsor | null = null. SponsorPlacement({ sponsor }: { sponsor: QuarterlySponsor | null }) is a server component; incomplete configuration or non-HTTPS destinations render null. Valid links use rel="noopener noreferrer sponsored" and visible Paid sponsorship label.

- [x] Write failing renderToStaticMarkup tests: null, blank name/message and unsafe destination render empty; valid fixture renders sponsor name/message, disclosure and sponsored HTTPS link.
- [x] Implement optional sponsor beside state browsing; absent sponsor leaves the content full width. Mobile sponsor follows state links.
- [x] Implement horizontal affiliate variant using current products/config and exact AFFILIATE_DISCLOSURE. Keep default sidebar layout working on other pages.
- [x] Add render regression tests for disclosure and affiliate link target/rel; run focused tests to passing.
- [x] Preserve homepage Auto ads with no fixed boxes. Keep sponsor independent from review status and club endorsements.
- [x] Document manual quarterly sponsor renewal/removal and rebuild. Do not add expiry behavior that assumes static pages update daily.

## Task 5: Verify and hand off

- [x] Run `pnpm test`, `pnpm typecheck`, `pnpm lint:app`, `pnpm build`. All must pass or genuine baseline failures must be reported separately before release decisions.
- [x] Inspect the production build with keyboard and at 200% zoom. Verify 4.5:1 normal text contrast, labels, focus order, heading hierarchy and 44px targets. Use visual/browser checks for styling, not tests mirroring Tailwind classes.
- [x] Compare route/sitemap output against baseline; visual changes must not change indexed population or canonical URLs.
- [x] Check consent and ad exclusions on unchanged routes; absent ad configuration must not introduce empty homepage boxes. Do not click live ads during verification.
- [x] Measure loading/layout shift and check reserved image dimensions. Aim for LCP <=2.5s and CLS <=0.1; report actual conditions rather than claim unmeasured performance.
- [x] Capture desktop/mobile homepage screenshots and summarize changes, test results and unresolved runtime checks. Keep the result on the assigned development branch for review before release.

## Execution recommendation

Implement sequentially: reconcile baseline, foundation, homepage, monetization, verification. These are closely related changes and do not require parallel agents. The new scope is a homepage redesign with shared chrome, not a full-site rebuild.

## Recorded adjustments

Fonts use next/font/local with licensed WOFF2 assets because the baseline Google Fonts build fetch failed. Three reviewed clubs are displayed (within the maximum six) to reduce mobile scrolling. The reconciled PublicClub projection already carries approved summaries. The unsold sponsor remains null. Production browser captures are local verification artifacts in work/redesign; no publication was performed.
