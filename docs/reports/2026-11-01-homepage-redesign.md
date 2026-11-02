# Homepage redesign

## Implemented scope

Homepage plus shared header/footer adopt the selected asphalt, silver and orange motorcycle direction. The page uses original generated editorial imagery, locally hosted Barlow Condensed headings, Inter body text, a labeled search band, early state browsing, three reviewed club summaries, rider guides and an Amazon shopping-category strip.

The sponsor module is optional and disabled by default. No fixed homepage ad slot or empty placeholder was added; existing Auto ads and all route/indexability gates remain intact. No live sponsor, prices, product testing claims or club endorsements were invented.

## Source baseline

The initial work checkout was behind the curation work. Cached origin/main was fast-forwarded to `a204b36` before implementation. Its homepage blob `1418553dc82fdeadb6b80f1308c5b5ae79d37465` exactly matched GitHub main fetched through the connected API. No remote write was made.

PublicClub on that reconciled baseline already supports approved summaries. The redesign uses that projection without exposing editorial evidence or changing data records, routes, canonical metadata or indexing selectors.

## Implementation decisions

- Local fonts replace Google build-time fetching, which failed in the initial baseline build. SIL licenses accompany the WOFF2 assets.
- The homepage uses three reviewed clubs, within the plan's maximum six, to shorten mobile scrolling before the guides. State pages retain access to the complete directory.
- Shared footer branding has a full-width row, preventing overlap with navigation at tablet widths and with fallback fonts.
- The header and state links reflow at enlarged text sizes. The sponsor layout uses two state columns at intermediate widths.
- Existing Amazon category copy, disclosure, destination generation and sponsored attributes are retained. The default affiliate sidebar variant remains intact.

## Review and verification

An independent code review found two Important responsive issues: header/state overflow with 200% text, and footer brand/navigation overlap. Both were reproduced and fixed. The footer reproduction failed at 768px before the fix, then passed at 375/768/1024/1440px with normal and fallback fonts. Enlarged-text measurements now show document width equals viewport width at 375/768/1024px. A populated sponsor plus fallback font also fits all four widths.

The browser pass covers four viewport widths, all search branches (state, query, combined, special characters, blank input), mobile menu open/Escape/focus/navigation, state/profile/guide/contact/404 routes, ad absence on excluded hard-load routes, missing hero image and text zoom. No browser page errors occurred. CSS checks verified normal-text contrast for orange controls, orange links, light text on asphalt and search metadata.

Node 22.23.4 was downloaded into /tmp and checksum-verified against the official release manifest. All 206 tests passed under that supported runtime. TypeScript and application ESLint checks passed. Direct project binaries were used because the environment's pnpm 11 wrapper attempted an unsupported installation; no lockfile/dependency changes were made.

Production-build and final capture results are recorded at completion below. Local loading measurements are not deployed field performance. Live AdSense/CMP/account behavior was not changed or certified by this visual task.

No push, PR, account-setting change or production deployment was performed.

## Final production verification

- Node 22: 206 tests passed, no failures; TypeScript and application ESLint clean.
- Production compilation passed and generated 3,442 static pages.
- Built sitemap exactly matches the unchanged selector output: 122 URLs. Data, ad gating, sitemap/robots source and canonical metadata were not changed.
- Final production screenshots at 1440px and 375px show no horizontal overflow and the correct canonical host. All homepage images decoded successfully.
- Local Chromium measurements: desktop LCP 804ms, mobile LCP 100ms, CLS 0 in both captures. These local, unthrottled results exclude live ad-network behavior and are not field-performance claims.
- Footer overlap checks pass across four widths with normal and fallback fonts; enlarged-text tests pass at phone/tablet/desktop widths.
- No deferred code-review findings. Live CMP/ad-account behavior and deployed performance remain outside this local visual change.

Screenshots and executable browser checks remain in ignored `work/redesign` for local review. Application changes remain uncommitted in the working branch for review; no remote changes were made.

## Release authorization

After the implementation handoff, the user explicitly instructed “Deploy,” authorizing publication of this redesign to the existing production site. The earlier no-deployment statements describe the implementation stage. Release checks, Git publication and Vercel readiness are verified separately during the release.
