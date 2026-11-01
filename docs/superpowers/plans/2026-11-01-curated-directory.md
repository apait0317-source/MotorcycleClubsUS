# Curated Directory Implementation Plan

> **For agentic workers:** Use Superpowers task execution and an independent final review. The user authorized implementation with judgment and waived further design questions.

**Goal:** Replace score-only publication with supported profiles and make rider content more useful while improving relevant affiliate offers.

**Architecture:** Keep static JSON overlays and existing route templates. Separate the diagnostic score from editorial eligibility. Preserve basic discovery entries on hubs and suppress monetization on thin profiles.

**Tech Stack:** Next.js 16, React 19, TypeScript strict, Node 22, pnpm 10.

**Spec:** `docs/superpowers/specs/2026-11-01-curated-directory-design.md`.

## Global Constraints

No new dependencies, accounts or database. Preserve raw data, stable slugs, chapter exclusions, sourced guide references, privacy choices and server-only editorial evidence. Do not push, deploy, submit AdSense or send messages. Public counts derive from data. Do not promise approval.

## Review Focus

- A high score or image without source-reviewed prose must not qualify for promotion or ads.
- Review/classification without attributed description evidence must not qualify.
- Demoted records remain reachable without ads or affiliate blocks and remain discoverable as basic state entries.
- Homepage and hub counts/links match the new population; empty states/cities are not promoted.
- Guide shopping categories retain disclosure and do not claim that unverified search results meet safety standards.

### Task 1: Editorial publication and complete audit

Files: `lib/data.ts`, `lib/content-audit.ts`, `scripts/audit-content.ts`, focused logic/audit tests.

- [x] Write regression cases for high-score empty/unsourced prose, classification-only review, supported confirmed prose, excluded and chapter entries; run red.
- [x] Require approved attributed description for `isListableClub`/`isIndexableClub`; retain diagnostic scoring and basic `isThinClub`; state minimum two reviewed profiles; city minimum stays two.
- [x] Audit all real non-chapter records missing supported description, retaining meaningful cohort fields and CSV output; ensure high-score and demoted records enter the backlog. Avoid interpreting score gain as approval.
- [x] Run focused tests and entire suite; record actual population change.

### Task 2: Practical guides and contextual affiliate offers

Files: `lib/guides.ts`, `lib/affiliates.ts`, `components/AffiliateSection.tsx`, guide template, relevant tests.

- [x] Add useful original worksheets/templates to existing joining, verification and group-riding guides without expanding article count or inventing facts. Retain source references and original publication date.
- [x] Write behavioral tests for guide-specific product selection and absence on irrelevant guides; run red before implementing selection logic.
- [x] Use a compact disclosed contextual affiliate block on relevant guides, remove generic guide sidebar duplication, and label destinations as shopping categories with actual-product checks.
- [x] Run focused tests; report content and placement changes.

### Task 3: Confirmed identity cleanup

Files: `data/club-enrichment.json` only plus a scoped evidence report.

- [x] Retrieve authoritative evidence for 69 Motorcycle Club, Wimborne Motorcycle Club, Suffolk Advanced Motorcyclists and Connecticut Ride Guide; approve exclusions only for supported foreign/non-club identities.
- [x] Preserve raw rows and slugs; add field-attributed classification evidence with actual review dates. Do not publish internal notes.
- [x] Run enrichment validation and source integrity tests; record URLs and limitations.

### Task 4: Reader-facing curation and documentation

Files: homepage, club-card public projection, club/hub/about templates as needed, copy/public-boundary tests, README, CLAUDE, MONETIZATION, audit report.

- [x] Replace rating/photo-led homepage priority with source-reviewed profiles and clearly labeled basic-entry coverage.
- [x] Expose only approved summary text on cards for useful hub comparisons; keep private metadata out of client props.
- [x] Hide affiliate blocks on demoted profiles; ensure sparse hubs and obsolete links do not receive accidental promotion.
- [x] Document monetization opportunities, factual cleanup, actual before/after counts and operator blockers without claiming live account verification.
- [x] Run all tests, typecheck, application lint, production build and generated HTML/RSC boundary checks. Dispatch independent review and address material findings before completion.
