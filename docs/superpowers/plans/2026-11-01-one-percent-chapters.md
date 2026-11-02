# Verified US Chapters Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development. Track steps below.

**Goal:** Add useful, sourced coverage of eight major US motorcycle club organizations.
**Architecture:** Reviewed chapter data supplements existing discovery records and organization hubs. Public sources, review dates and matching existing profile links establish provenance without manufacturing addresses or rewriting stable URLs.
**Tech Stack:** Next.js 16, TypeScript, JSON, Node test runner.
**Spec:** docs/superpowers/specs/2026-11-01-one-percent-chapters-design.md

## Global Constraints

US only. Preserve existing IDs and URLs. No guessed cities or addresses. Distinguish namesakes. Official sources first. No deployment.

## Review Focus

- Regional/state-only labels must not become city locations.
- Same-name clubs and multiple chapters in one city must not be incorrectly merged.
- Unverified historical records must not inherit verification from name matching.
- Existing rich profiles and prior hubs must retain routes and visibility.
- Public evidence links must be safe URLs with real checked dates; data gaps must remain explicit.

## Task 1: Research and evidence

- [x] Three independent research agents read official rosters and public sources for assigned organizations.
- [x] Save structured source-backed findings in work/one-percent/research-{west,central,east}.json.
- [x] Resolve ambiguous geographic labels and organization identity; retain unresolved gaps in a report.

## Task 2: Reviewed registry and hub integration

Files: new data/verified-chapters.json and lib/verified-chapters.ts; existing lib/chapter-orgs.ts, app/chapters/[org]/page.tsx, relevant navigation/state pages, tests/lib and tests/pages.
Interface: registry holds organization metadata, sources, city/state chapter evidence, optional existing club slug and public Maps link. Existing legacy chapter APIs continue to work.

- [x] Add failing behavior tests for reviewed registry validation, geography, duplicate identity, safe sources, profile eligibility and legacy hubs.
- [x] Implement registry loading, sourced chapter hub rendering and discovery links without changing raw IDs/slugs or indexing thin individual profiles.
- [x] Keep regional/state-only evidence out of city fields and show coverage limitations.
- [x] Run focused tests, typecheck and lint.

## Task 3: Integrate research and validate

- [x] Normalize evidence into the registry; match existing profiles only with sufficient identity/location evidence.
- [x] Record actual added/verified counts and source gaps in docs/reports/2026-11-01-one-percent-chapters.md.
- [x] Run pnpm test, pnpm typecheck, pnpm lint:app and pnpm build.
- [x] Independent review of data provenance, rendered hubs and regression risks; fix actionable findings.
- [x] Report completed changes and limitations; leave deployment to a separately authorized action.
