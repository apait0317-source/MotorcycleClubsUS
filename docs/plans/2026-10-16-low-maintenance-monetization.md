# Low-Maintenance Monetization Implementation Plan

**Goal:** Turn usmotorcycleclubs.com into a fully prerendered, ad-supported Next.js site with no database, no accounts, email-only forms, and a weekly automated health check.

**Architecture:** All pages render from `data/*.json` at build time (2,102 club pages included). The only runtime code path is `POST /api/contact`, which validates, applies a honeypot, and forwards the message to the owner's inbox through Resend's REST API. Ad placements and affiliate links are driven by two config files (`lib/ads.ts`, `lib/affiliates.ts`) so quarterly maintenance touches data, not components.

**Tech Stack:** Next.js 16.1 (App Router), React 19, TypeScript 5, Tailwind 4, pnpm 10, Node 22 built-in test runner via `tsx --test`, Resend REST API, GitHub Actions cron, Vercel Pro.

Design source: `docs/plans/2026-10-16-low-maintenance-monetization-design.md`.

---

## Decisions and assumptions

1. **Two ad placement types, not three.** The design names `inline` (after intro / after second guide section / in-feed every 12 cards) and `sidebar` (sticky). The existing `banner` unit and `NEXT_PUBLIC_AD_SLOT_BANNER` are dropped; the home, `/states`, `/cities`, `/guides`, and `/search` pages carry no fixed units and rely on Auto ads. Reserved heights: inline 250px, sidebar 600px.
2. **Resend via `fetch`, no SDK.** Keeps the dependency list unchanged and makes the sender trivially mockable. Sender defaults to `onboarding@resend.dev` (works without domain verification, delivers only to the Resend account owner). `CONTACT_FROM_EMAIL` overrides it once a domain is verified.
3. **Test runner is `tsx --test`** (Node's `node:test`), already installed. Verified in this repo: `@/` alias, JSON imports, `react-dom/server`, and importing `app/clubs/[slug]/page.tsx` all work. No new devDependencies.
4. **Deletion-only tasks** use a grep + `tsc --noEmit` command as the failing/passing check instead of a unit test; there is nothing to assert beyond "the symbol is gone and the project still typechecks."
5. **`/submit` is the one public submission form** (it already posts to `/api/contact`). The auth-gated `/submit-club` is removed and every link points at `/submit`.
6. **The Vercel env-var cleanup is an operator step** recorded in MONETIZATION.md. Code never reads the removed variables, so nothing breaks if they linger.
7. **Health check state** (last sitemap count) lives in the GitHub Actions cache under `.health/`, restored with a prefix key and saved every run including failures.
8. **Commits per task.** Intermediate commits between Tasks 9 and 16 may not `next build` cleanly because consumers are updated before the packages are removed; `tsc --noEmit` is the gate per task and `pnpm build` is the gate in Task 20.

Run every command from `/home/user/MotorcycleClubsUS`.

---

### Task 1: Test harness

**Files:**
- Modify: `package.json`
- Create: `tests/smoke.test.ts`

**Step 1: Write the failing test**

Create `tests/smoke.test.ts`:

```ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getAllStates, getAllClubs } from '@/lib/data';

test('data files load through the @/ alias', () => {
  assert.equal(getAllStates().length, 51);
  assert.ok(getAllClubs().length > 2000);
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm test`
Expected: FAIL with `ERR_PNPM_NO_SCRIPT  Missing script: test`

**Step 3: Write minimal implementation**

In `package.json`, add inside `"scripts"` after `"lint:app"`:

```json
    "lint:app": "eslint app components lib",
    "test": "tsx --test \"tests/**/*.test.ts\"",
    "typecheck": "tsc --noEmit"
```

**Step 4: Run test to verify it passes**

Run: `pnpm test`
Expected: PASS, output ends with `# pass 1` and `# fail 0`

**Step 5: Commit**

```bash
git add package.json tests/smoke.test.ts
git commit -m "test: add node:test harness via tsx"
```

---

### Task 2: Ad placement config in `lib/ads.ts`

**Files:**
- Modify: `lib/ads.ts`
- Test: `tests/lib/ads.test.ts`

**Step 1: Write the failing test**

Create `tests/lib/ads.test.ts`:

```ts
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  getAdsensePublisherId,
  getAdPlacement,
  isAdEnabled,
  shouldInsertInFeedAd,
  IN_FEED_EVERY,
} from '@/lib/ads';

beforeEach(() => {
  delete process.env.NEXT_PUBLIC_ADSENSE_ID;
  delete process.env.NEXT_PUBLIC_AD_SLOT_INLINE;
  delete process.env.NEXT_PUBLIC_AD_SLOT_SIDEBAR;
});

test('publisher id strips ca-pub- and pub- prefixes', () => {
  process.env.NEXT_PUBLIC_ADSENSE_ID = 'ca-pub-123';
  assert.equal(getAdsensePublisherId(), '123');
  process.env.NEXT_PUBLIC_ADSENSE_ID = 'pub-456 ';
  assert.equal(getAdsensePublisherId(), '456');
  delete process.env.NEXT_PUBLIC_ADSENSE_ID;
  assert.equal(getAdsensePublisherId(), '');
});

test('placements reserve fixed heights', () => {
  assert.equal(getAdPlacement('inline').minHeight, 250);
  assert.equal(getAdPlacement('sidebar').minHeight, 600);
});

test('placements read slot ids from env at call time', () => {
  assert.equal(getAdPlacement('inline').slot, '');
  process.env.NEXT_PUBLIC_AD_SLOT_INLINE = '111';
  process.env.NEXT_PUBLIC_AD_SLOT_SIDEBAR = '222';
  assert.equal(getAdPlacement('inline').slot, '111');
  assert.equal(getAdPlacement('sidebar').slot, '222');
});

test('an ad is enabled only when publisher id and slot are both set', () => {
  assert.equal(isAdEnabled('inline'), false);
  process.env.NEXT_PUBLIC_ADSENSE_ID = 'pub-1';
  assert.equal(isAdEnabled('inline'), false);
  process.env.NEXT_PUBLIC_AD_SLOT_INLINE = '111';
  assert.equal(isAdEnabled('inline'), true);
  assert.equal(isAdEnabled('sidebar'), false);
});

test('in-feed ads go after every twelfth card but never after the last', () => {
  assert.equal(IN_FEED_EVERY, 12);
  assert.equal(shouldInsertInFeedAd(11, 30), true);
  assert.equal(shouldInsertInFeedAd(23, 30), true);
  assert.equal(shouldInsertInFeedAd(5, 30), false);
  assert.equal(shouldInsertInFeedAd(11, 12), false);
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm exec tsx --test tests/lib/ads.test.ts`
Expected: FAIL with `SyntaxError: The requested module '@/lib/ads' does not provide an export named 'getAdPlacement'`

**Step 3: Write minimal implementation**

Replace `lib/ads.ts` entirely:

```ts
/**
 * Google AdSense configuration.
 *
 * NEXT_PUBLIC_ADSENSE_ID       publisher ID (with or without the "pub-" / "ca-pub-" prefix)
 * NEXT_PUBLIC_AD_SLOT_INLINE   ad unit ID for in-content and in-feed placements
 * NEXT_PUBLIC_AD_SLOT_SIDEBAR  ad unit ID for the sticky sidebar placement
 *
 * Auto ads stay enabled in the AdSense account. The two placements below are
 * the fixed units. Each reserves a minimum height so a late-filling ad never
 * shifts the layout. Nothing renders in production until the IDs exist.
 */
export function getAdsensePublisherId(): string {
  const raw = process.env.NEXT_PUBLIC_ADSENSE_ID || '';
  return raw.replace(/^ca-pub-/, '').replace(/^pub-/, '').trim();
}

export type AdPlacement = 'inline' | 'sidebar';

export interface AdPlacementConfig {
  /** AdSense ad unit ID. Empty string when the env var is unset. */
  slot: string;
  /** Reserved height in px, applied to the container and the <ins>. */
  minHeight: number;
}

const MIN_HEIGHTS: Record<AdPlacement, number> = {
  inline: 250,
  sidebar: 600,
};

export function getAdPlacement(placement: AdPlacement): AdPlacementConfig {
  // Each env var is spelled out so Next can inline it into client bundles.
  const slot =
    placement === 'inline'
      ? process.env.NEXT_PUBLIC_AD_SLOT_INLINE
      : process.env.NEXT_PUBLIC_AD_SLOT_SIDEBAR;
  return { slot: (slot || '').trim(), minHeight: MIN_HEIGHTS[placement] };
}

export function isAdEnabled(placement: AdPlacement): boolean {
  return Boolean(getAdsensePublisherId() && getAdPlacement(placement).slot);
}

/** Cards between in-feed ads on state and city grids. */
export const IN_FEED_EVERY = 12;

/**
 * True when an in-feed ad belongs after the card at zero-based `index` in a
 * grid of `total` cards. Never places an ad after the final card.
 */
export function shouldInsertInFeedAd(index: number, total: number, every: number = IN_FEED_EVERY): boolean {
  return (index + 1) % every === 0 && index < total - 1;
}
```

**Step 4: Run test to verify it passes**

Run: `pnpm exec tsx --test tests/lib/ads.test.ts`
Expected: PASS, `# pass 5`

**Step 5: Commit**

```bash
git add lib/ads.ts tests/lib/ads.test.ts
git commit -m "feat(ads): placement config with reserved heights and in-feed helper"
```

---

### Task 3: `AdSlot` component

**Files:**
- Create: `components/AdSlot.tsx`
- Test: `tests/components/AdSlot.test.ts`

**Step 1: Write the failing test**

Create `tests/components/AdSlot.test.ts`:

```ts
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import AdSlot from '@/components/AdSlot';

beforeEach(() => {
  delete process.env.NEXT_PUBLIC_ADSENSE_ID;
  delete process.env.NEXT_PUBLIC_AD_SLOT_INLINE;
  delete process.env.NEXT_PUBLIC_AD_SLOT_SIDEBAR;
  process.env.NODE_ENV = 'production';
});

test('renders nothing in production when ids are unset', () => {
  assert.equal(renderToStaticMarkup(createElement(AdSlot, { placement: 'inline' })), '');
});

test('renders a labelled outline outside production when ids are unset', () => {
  process.env.NODE_ENV = 'development';
  const html = renderToStaticMarkup(createElement(AdSlot, { placement: 'sidebar' }));
  assert.match(html, /Ad placement \(sidebar\)/);
  assert.match(html, /NEXT_PUBLIC_AD_SLOT_SIDEBAR/);
  assert.match(html, /min-height:600px/);
});

test('renders an adsbygoogle unit with reserved height when configured', () => {
  process.env.NEXT_PUBLIC_ADSENSE_ID = 'pub-999';
  process.env.NEXT_PUBLIC_AD_SLOT_INLINE = '123';
  const html = renderToStaticMarkup(createElement(AdSlot, { placement: 'inline', className: 'mb-8' }));
  assert.match(html, /class="adsbygoogle"/);
  assert.match(html, /data-ad-client="ca-pub-999"/);
  assert.match(html, /data-ad-slot="123"/);
  assert.match(html, /data-ad-placement="inline"/);
  assert.match(html, /min-height:250px/);
  assert.match(html, /mb-8/);
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm exec tsx --test tests/components/AdSlot.test.ts`
Expected: FAIL with `Cannot find module '@/components/AdSlot'`

**Step 3: Write minimal implementation**

Create `components/AdSlot.tsx`:

```tsx
'use client';

import { useEffect, useRef } from 'react';
import { getAdsensePublisherId, getAdPlacement, type AdPlacement } from '@/lib/ads';

interface AdSlotProps {
  placement: AdPlacement;
  className?: string;
}

/**
 * Fixed AdSense placement with a reserved height.
 *
 * Renders a responsive ad unit when the publisher ID and this placement's slot
 * ID are configured. In production with no configuration it renders nothing,
 * so visitors and ad reviewers never see an empty box. Outside production it
 * shows an outline so the layout can be checked.
 */
export default function AdSlot({ placement, className = '' }: AdSlotProps) {
  const adRef = useRef<HTMLModElement>(null);
  const publisherId = getAdsensePublisherId();
  const { slot, minHeight } = getAdPlacement(placement);
  const enabled = Boolean(publisherId && slot);

  useEffect(() => {
    if (!enabled || !adRef.current) return;
    // Only request an ad once per <ins>; AdSense marks filled slots.
    if (adRef.current.getAttribute('data-adsbygoogle-status')) return;
    try {
      const w = window as Window & { adsbygoogle?: unknown[] };
      (w.adsbygoogle = w.adsbygoogle || []).push({});
    } catch (err) {
      console.error('AdSense error:', err);
    }
  }, [enabled]);

  if (!enabled) {
    if (process.env.NODE_ENV === 'production') return null;
    return (
      <div
        className={`bg-gray-100 border border-dashed border-gray-300 rounded-lg flex items-center justify-center ${className}`}
        style={{ minHeight }}
        data-ad-placement={placement}
      >
        <p className="text-gray-400 text-xs text-center px-4">
          Ad placement ({placement}). Set NEXT_PUBLIC_ADSENSE_ID and NEXT_PUBLIC_AD_SLOT_{placement.toUpperCase()}.
        </p>
      </div>
    );
  }

  return (
    <div
      className={`overflow-hidden ${className}`}
      style={{ minHeight }}
      aria-label="Advertisement"
      data-ad-placement={placement}
    >
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block', minHeight }}
        data-ad-client={`ca-pub-${publisherId}`}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
```

**Step 4: Run test to verify it passes**

Run: `pnpm exec tsx --test tests/components/AdSlot.test.ts`
Expected: PASS, `# pass 3`

**Step 5: Commit**

```bash
git add components/AdSlot.tsx tests/components/AdSlot.test.ts
git commit -m "feat(ads): AdSlot component with reserved heights"
```

---

### Task 4: Affiliate config in `lib/affiliates.ts`

**Files:**
- Create: `lib/affiliates.ts`
- Modify: `components/AffiliateSection.tsx`
- Test: `tests/lib/affiliates.test.ts`

**Step 1: Write the failing test**

Create `tests/lib/affiliates.test.ts`:

```ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { amazonSearchUrl, AFFILIATE_PRODUCTS, AFFILIATE_REL, AMAZON_AFFILIATE_TAG } from '@/lib/affiliates';
import AffiliateSection from '@/components/AffiliateSection';

test('amazon search urls carry the encoded term and tag', () => {
  const url = amazonSearchUrl('full face helmet', 'demo-20');
  assert.equal(url, 'https://www.amazon.com/s?k=full%20face%20helmet&tag=demo-20');
  assert.ok(amazonSearchUrl('x').endsWith(`&tag=${encodeURIComponent(AMAZON_AFFILIATE_TAG)}`));
});

test('default product list is complete', () => {
  assert.equal(AFFILIATE_PRODUCTS.length, 4);
  for (const p of AFFILIATE_PRODUCTS) {
    assert.ok(p.name && p.description && p.searchTerm && p.category);
  }
});

test('AffiliateSection renders sponsored links built from the config', () => {
  const html = renderToStaticMarkup(createElement(AffiliateSection));
  assert.equal((html.match(new RegExp(`rel="${AFFILIATE_REL}"`, 'g')) || []).length, 4);
  assert.match(html, new RegExp(`tag=${encodeURIComponent(AMAZON_AFFILIATE_TAG)}`));
  assert.match(html, /As an Amazon Associate/);
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm exec tsx --test tests/lib/affiliates.test.ts`
Expected: FAIL with `Cannot find module '@/lib/affiliates'`

**Step 3: Write minimal implementation**

Create `lib/affiliates.ts`:

```ts
/**
 * Affiliate configuration. This is the only file that changes when a tag
 * rotates or a second program (Impact, AvantLink) is added.
 *
 * Amazon Associates: links go to Amazon search results so they never dead-end
 * on a retired ASIN. No prices are shown; the Operating Agreement only permits
 * prices pulled live from the Product Advertising API.
 */
export const AMAZON_AFFILIATE_TAG = process.env.NEXT_PUBLIC_AMAZON_AFFILIATE_TAG || 'usamotorcycle-20';

/** rel value for every outbound affiliate link. */
export const AFFILIATE_REL = 'noopener noreferrer sponsored';

export const AFFILIATE_DISCLOSURE = 'As an Amazon Associate, we earn from qualifying purchases.';

export type AffiliateCategory = 'Helmets' | 'Jackets' | 'Gloves' | 'Communication';

export interface AffiliateProduct {
  name: string;
  description: string;
  searchTerm: string;
  category: AffiliateCategory;
}

export const AFFILIATE_PRODUCTS: AffiliateProduct[] = [
  {
    name: 'Full-face helmets',
    description: 'DOT and ECE rated full-face helmets for street and touring riders',
    searchTerm: 'full face motorcycle helmet DOT ECE',
    category: 'Helmets',
  },
  {
    name: 'Armored riding jackets',
    description: 'CE-rated armor in leather and textile for all-season riding',
    searchTerm: 'armored motorcycle jacket CE',
    category: 'Jackets',
  },
  {
    name: 'Riding gloves',
    description: 'Full-grain leather gloves with knuckle protection',
    searchTerm: 'leather motorcycle gloves knuckle protection',
    category: 'Gloves',
  },
  {
    name: 'Helmet intercoms',
    description: 'Bluetooth and mesh headsets for group rides',
    searchTerm: 'motorcycle helmet bluetooth intercom mesh',
    category: 'Communication',
  },
];

export function amazonSearchUrl(term: string, tag: string = AMAZON_AFFILIATE_TAG): string {
  return `https://www.amazon.com/s?k=${encodeURIComponent(term)}&tag=${encodeURIComponent(tag)}`;
}
```

In `components/AffiliateSection.tsx`, replace everything from the top of the file through the end of the `defaultProducts` array (lines 1 to 41, ending at `];`) with:

```tsx
import { ReactNode } from 'react';
import {
  AFFILIATE_PRODUCTS,
  AFFILIATE_REL,
  AFFILIATE_DISCLOSURE,
  amazonSearchUrl,
  type AffiliateProduct,
} from '@/lib/affiliates';
```

Then make these three replacements further down the same file:

```tsx
// before
  products = defaultProducts,
// after
  products = AFFILIATE_PRODUCTS,
```

```tsx
// before (delete these two lines entirely)
  const amazonUrl = (term: string) =>
    `https://www.amazon.com/s?k=${encodeURIComponent(term)}&tag=${encodeURIComponent(AMAZON_AFFILIATE_TAG)}`;
```

```tsx
// before
            href={amazonUrl(product.searchTerm)}
            target="_blank"
            rel="noopener noreferrer sponsored"
// after
            href={amazonSearchUrl(product.searchTerm)}
            target="_blank"
            rel={AFFILIATE_REL}
```

```tsx
// before
        As an Amazon Associate, we earn from qualifying purchases.
// after
        {AFFILIATE_DISCLOSURE}
```

**Step 4: Run test to verify it passes**

Run: `pnpm exec tsx --test tests/lib/affiliates.test.ts && pnpm typecheck`
Expected: PASS, `# pass 3`; tsc exits 0

**Step 5: Commit**

```bash
git add lib/affiliates.ts components/AffiliateSection.tsx tests/lib/affiliates.test.ts
git commit -m "feat(affiliates): isolate affiliate config in lib/affiliates.ts"
```

---

### Task 5: Contact validation in `lib/contact.ts`

**Files:**
- Create: `lib/contact.ts`
- Test: `tests/lib/contact.test.ts`

**Step 1: Write the failing test**

Create `tests/lib/contact.test.ts`:

```ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateContact, formatContactEmail, correctionHref, correctionPrefill } from '@/lib/contact';

const good = { name: ' Jane ', email: 'Jane@Example.com', subject: 'Hi', message: 'Hello there' };

test('honeypot filled means silent accept', () => {
  assert.deepEqual(validateContact({ ...good, website: 'http://spam' }), { ok: 'honeypot' });
});

test('every field is required', () => {
  assert.deepEqual(validateContact({ ...good, message: '  ' }), { ok: false, error: 'All fields are required' });
  assert.deepEqual(validateContact(null), { ok: false, error: 'All fields are required' });
});

test('length limits are enforced per field', () => {
  assert.deepEqual(validateContact({ ...good, subject: 'x'.repeat(201) }), { ok: false, error: 'subject is too long' });
});

test('email must look like an email', () => {
  assert.deepEqual(validateContact({ ...good, email: 'nope' }), { ok: false, error: 'Please enter a valid email' });
});

test('valid input is trimmed and email lowercased', () => {
  assert.deepEqual(validateContact(good), {
    ok: true,
    data: { name: 'Jane', email: 'jane@example.com', subject: 'Hi', message: 'Hello there' },
  });
});

test('email body carries sender and message', () => {
  const { subject, text } = formatContactEmail({ name: 'Jane', email: 'jane@example.com', subject: 'Hi', message: 'Hello' });
  assert.equal(subject, '[usmotorcycleclubs.com] Hi');
  assert.match(text, /From: Jane <jane@example\.com>/);
  assert.match(text, /Hello/);
});

test('correction link and prefill are derived from club name and slug', () => {
  assert.equal(correctionHref('Iron Order MC', 'iron-order-mc'), '/contact?club=Iron+Order+MC&slug=iron-order-mc');
  const prefill = correctionPrefill('Iron Order MC', 'iron-order-mc');
  assert.equal(prefill.subject, 'Correction: Iron Order MC');
  assert.match(prefill.message, /\/clubs\/iron-order-mc/);
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm exec tsx --test tests/lib/contact.test.ts`
Expected: FAIL with `Cannot find module '@/lib/contact'`

**Step 3: Write minimal implementation**

Create `lib/contact.ts`:

```ts
import { SITE_URL } from './utils';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const CONTACT_LIMITS = { name: 120, email: 254, subject: 200, message: 5000 } as const;

export interface ContactMessage {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export type ContactValidation =
  | { ok: true; data: ContactMessage }
  | { ok: false; error: string }
  | { ok: 'honeypot' };

/**
 * Validates a contact or club-submission payload. The hidden "website" field
 * is a honeypot: people never see it, bots fill it. A tripped honeypot is
 * reported separately so the route can return success without sending.
 */
export function validateContact(body: unknown): ContactValidation {
  if (!body || typeof body !== 'object') return { ok: false, error: 'All fields are required' };
  const { name, email, subject, message, website } = body as Record<string, unknown>;

  if (typeof website === 'string' && website.trim() !== '') return { ok: 'honeypot' };

  const fields = { name, email, subject, message };
  for (const [key, value] of Object.entries(fields)) {
    if (typeof value !== 'string' || !value.trim()) return { ok: false, error: 'All fields are required' };
    if (value.length > CONTACT_LIMITS[key as keyof typeof CONTACT_LIMITS]) return { ok: false, error: `${key} is too long` };
  }
  if (!EMAIL_RE.test(email as string)) return { ok: false, error: 'Please enter a valid email' };

  return {
    ok: true,
    data: {
      name: (name as string).trim(),
      email: (email as string).trim().toLowerCase(),
      subject: (subject as string).trim(),
      message: (message as string).trim(),
    },
  };
}

export function formatContactEmail(data: ContactMessage): { subject: string; text: string } {
  return {
    subject: `[usmotorcycleclubs.com] ${data.subject}`,
    text: `From: ${data.name} <${data.email}>\nSubject: ${data.subject}\n\n${data.message}\n`,
  };
}

/** Link target for the "Suggest a correction" button on a club page. */
export function correctionHref(clubName: string, slug: string): string {
  return `/contact?${new URLSearchParams({ club: clubName, slug }).toString()}`;
}

/** Subject and message the contact form prefills when opened from that link. */
export function correctionPrefill(clubName: string, slug: string): { subject: string; message: string } {
  return {
    subject: `Correction: ${clubName}`,
    message: `Club: ${clubName}\nPage: ${SITE_URL}/clubs/${slug}\n\nWhat needs to change:\n`,
  };
}
```

**Step 4: Run test to verify it passes**

Run: `pnpm exec tsx --test tests/lib/contact.test.ts`
Expected: PASS, `# pass 7`

**Step 5: Commit**

```bash
git add lib/contact.ts tests/lib/contact.test.ts
git commit -m "feat(contact): pure validation, email formatting, and correction prefill"
```

---

### Task 6: Resend sender in `lib/email.ts`

**Files:**
- Create: `lib/email.ts`
- Test: `tests/lib/email.test.ts`

**Step 1: Write the failing test**

Create `tests/lib/email.test.ts`:

```ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sendEmail, EmailConfigError } from '@/lib/email';

const env = { RESEND_API_KEY: 're_test', CONTACT_TO_EMAIL: 'owner@example.com' } as NodeJS.ProcessEnv;

function fakeFetch(status: number, body: unknown) {
  const calls: { url: string; init: RequestInit }[] = [];
  const impl = (async (url: string | URL | Request, init?: RequestInit) => {
    calls.push({ url: String(url), init: init || {} });
    return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
  }) as typeof fetch;
  return { impl, calls };
}

test('throws EmailConfigError when env is missing', async () => {
  await assert.rejects(
    () => sendEmail({ subject: 's', text: 't' }, fakeFetch(200, {}).impl, {} as NodeJS.ProcessEnv),
    EmailConfigError,
  );
});

test('posts the message to Resend with the owner as recipient', async () => {
  const { impl, calls } = fakeFetch(200, { id: 'abc' });
  const result = await sendEmail({ subject: 'Hi', text: 'Body', replyTo: 'jane@example.com' }, impl, env);
  assert.deepEqual(result, { id: 'abc' });
  assert.equal(calls[0].url, 'https://api.resend.com/emails');
  assert.equal((calls[0].init.headers as Record<string, string>).Authorization, 'Bearer re_test');
  const payload = JSON.parse(String(calls[0].init.body));
  assert.deepEqual(payload.to, ['owner@example.com']);
  assert.equal(payload.subject, 'Hi');
  assert.equal(payload.text, 'Body');
  assert.equal(payload.reply_to, 'jane@example.com');
  assert.equal(payload.from, 'US Motorcycle Clubs <onboarding@resend.dev>');
});

test('honours CONTACT_FROM_EMAIL', async () => {
  const { impl, calls } = fakeFetch(200, { id: 'x' });
  await sendEmail({ subject: 's', text: 't' }, impl, { ...env, CONTACT_FROM_EMAIL: 'Site <hello@usmotorcycleclubs.com>' });
  assert.equal(JSON.parse(String(calls[0].init.body)).from, 'Site <hello@usmotorcycleclubs.com>');
});

test('throws on a non-2xx response', async () => {
  await assert.rejects(
    () => sendEmail({ subject: 's', text: 't' }, fakeFetch(422, { message: 'bad' }).impl, env),
    /Resend responded 422/,
  );
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm exec tsx --test tests/lib/email.test.ts`
Expected: FAIL with `Cannot find module '@/lib/email'`

**Step 3: Write minimal implementation**

Create `lib/email.ts`:

```ts
/**
 * Transactional email through Resend's REST API. One fetch call, no SDK.
 *
 * RESEND_API_KEY      Resend API key (already set in Vercel)
 * CONTACT_TO_EMAIL    owner inbox that receives every form submission
 * CONTACT_FROM_EMAIL  optional sender. Defaults to Resend's onboarding sender,
 *                     which delivers only to the Resend account owner. Set it
 *                     to an address on a verified domain once one exists.
 */
const RESEND_ENDPOINT = 'https://api.resend.com/emails';
const DEFAULT_FROM = 'US Motorcycle Clubs <onboarding@resend.dev>';

export interface OutboundEmail {
  subject: string;
  text: string;
  replyTo?: string;
}

export class EmailConfigError extends Error {}

export function getEmailConfig(env: NodeJS.ProcessEnv = process.env) {
  const apiKey = env.RESEND_API_KEY;
  const to = env.CONTACT_TO_EMAIL;
  if (!apiKey) throw new EmailConfigError('RESEND_API_KEY is not set');
  if (!to) throw new EmailConfigError('CONTACT_TO_EMAIL is not set');
  return { apiKey, to, from: env.CONTACT_FROM_EMAIL || DEFAULT_FROM };
}

export async function sendEmail(
  email: OutboundEmail,
  fetchImpl: typeof fetch = fetch,
  env: NodeJS.ProcessEnv = process.env,
): Promise<{ id: string }> {
  const { apiKey, to, from } = getEmailConfig(env);
  const res = await fetchImpl(RESEND_ENDPOINT, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from, to: [to], subject: email.subject, text: email.text, reply_to: email.replyTo }),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`Resend responded ${res.status}: ${detail.slice(0, 200)}`);
  }
  const json = (await res.json()) as { id?: string };
  return { id: json.id || '' };
}
```

**Step 4: Run test to verify it passes**

Run: `pnpm exec tsx --test tests/lib/email.test.ts`
Expected: PASS, `# pass 4`

**Step 5: Commit**

```bash
git add lib/email.ts tests/lib/email.test.ts
git commit -m "feat(email): send through Resend REST API"
```

---

### Task 7: Rewrite `POST /api/contact` to email instead of store

**Files:**
- Modify: `app/api/contact/route.ts`
- Test: `tests/api/contact-route.test.ts`

**Step 1: Write the failing test**

Create `tests/api/contact-route.test.ts`:

```ts
import { test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { POST } from '@/app/api/contact/route';

const realFetch = globalThis.fetch;
let sent: unknown[] = [];

beforeEach(() => {
  sent = [];
  process.env.RESEND_API_KEY = 're_test';
  process.env.CONTACT_TO_EMAIL = 'owner@example.com';
  globalThis.fetch = (async (_url: string | URL | Request, init?: RequestInit) => {
    sent.push(JSON.parse(String(init?.body)));
    return new Response(JSON.stringify({ id: 'ok' }), { status: 200 });
  }) as typeof fetch;
});

afterEach(() => {
  globalThis.fetch = realFetch;
});

function post(body: unknown) {
  return POST(new Request('http://localhost/api/contact', { method: 'POST', body: JSON.stringify(body) }));
}

const good = { name: 'Jane', email: 'jane@example.com', subject: 'Hi', message: 'Hello' };

test('valid message is emailed and acknowledged', async () => {
  const res = await post(good);
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { success: true });
  assert.equal(sent.length, 1);
  assert.equal((sent[0] as { reply_to: string }).reply_to, 'jane@example.com');
});

test('honeypot returns success and sends nothing', async () => {
  const res = await post({ ...good, website: 'spam' });
  assert.equal(res.status, 200);
  assert.equal(sent.length, 0);
});

test('invalid payload is a 400', async () => {
  const res = await post({ ...good, email: 'bad' });
  assert.equal(res.status, 400);
  assert.deepEqual(await res.json(), { error: 'Please enter a valid email' });
});

test('missing email config is a 500 with a clear message', async () => {
  delete process.env.CONTACT_TO_EMAIL;
  const res = await post(good);
  assert.equal(res.status, 500);
  assert.deepEqual(await res.json(), { error: 'Contact form is not configured' });
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm exec tsx --test tests/api/contact-route.test.ts`
Expected: FAIL. The first test fails because the current route calls `prisma.contactSubmission.create` (error mentions `prisma` or `PrismaClientInitializationError`), and the fourth test gets `Failed to submit message` instead of `Contact form is not configured`.

**Step 3: Write minimal implementation**

Replace `app/api/contact/route.ts` entirely:

```ts
import { validateContact, formatContactEmail } from '@/lib/contact';
import { sendEmail, EmailConfigError } from '@/lib/email';

export const runtime = 'nodejs';

/**
 * Receives the contact form and the club submission form. Validates, drops
 * honeypot hits silently, and forwards the message to CONTACT_TO_EMAIL through
 * Resend. Nothing is stored.
 */
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'Invalid request' }, { status: 400 });
  }

  const result = validateContact(body);
  if (result.ok === 'honeypot') return Response.json({ success: true });
  if (result.ok === false) return Response.json({ error: result.error }, { status: 400 });

  try {
    const { subject, text } = formatContactEmail(result.data);
    await sendEmail({ subject, text, replyTo: result.data.email });
    return Response.json({ success: true });
  } catch (error) {
    console.error('Contact form error:', error);
    const message = error instanceof EmailConfigError ? 'Contact form is not configured' : 'Failed to send message';
    return Response.json({ error: message }, { status: 500 });
  }
}
```

**Step 4: Run test to verify it passes**

Run: `pnpm exec tsx --test tests/api/contact-route.test.ts`
Expected: PASS, `# pass 4`

**Step 5: Commit**

```bash
git add app/api/contact/route.ts tests/api/contact-route.test.ts
git commit -m "feat(contact): email submissions through Resend, store nothing"
```

---

### Task 8: Contact page prefill and copy

**Files:**
- Modify: `app/contact/page.tsx`

**Step 1: Write the failing check**

Run: `grep -c "correctionPrefill\|Suspense" app/contact/page.tsx; grep -c "mcdirectory\|/register" app/contact/page.tsx`
Expected: `0` then `2` (the page does not use the prefill and still carries the stale email and register link)

**Step 2: Verify the check fails**

Same command. Expected output is `0` and `2`, which is the failing state.

**Step 3: Write minimal implementation**

Replace `app/contact/page.tsx` entirely:

```tsx
'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { correctionPrefill } from '@/lib/contact';

function ContactForm() {
  const params = useSearchParams();
  const club = params.get('club');
  const slug = params.get('slug');
  const prefill = club && slug ? correctionPrefill(club, slug) : null;

  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('loading');
    setError('');

    const formData = new FormData(e.currentTarget);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.get('name'),
          email: formData.get('email'),
          subject: formData.get('subject'),
          message: formData.get('message'),
          website: formData.get('website'),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to send message');
      }

      setStatus('success');
      (e.target as HTMLFormElement).reset();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-green-800 mb-2">Message Sent</h3>
        <p className="text-green-700">Thanks. Messages go straight to the site owner and are read in the next working session.</p>
        <button onClick={() => setStatus('idle')} className="mt-4 text-green-600 hover:underline">
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Honeypot: hidden from people, filled by bots. */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
      {status === 'error' && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>}

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
        <input
          id="name"
          name="name"
          type="text"
          required
          maxLength={120}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          placeholder="John Doe"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
        <input
          id="email"
          name="email"
          type="email"
          required
          maxLength={254}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          placeholder="you@example.com"
        />
      </div>

      <div>
        <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
        <input
          id="subject"
          name="subject"
          type="text"
          required
          maxLength={200}
          defaultValue={prefill?.subject ?? ''}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          placeholder="What is this about?"
        />
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Message</label>
        <textarea
          id="message"
          name="message"
          rows={prefill ? 8 : 5}
          required
          maxLength={5000}
          defaultValue={prefill?.message ?? ''}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          placeholder="Your message..."
        />
      </div>

      <button
        type="submit"
        disabled={status === 'loading'}
        className="w-full py-3 bg-amber-500 text-white font-semibold rounded-lg hover:bg-amber-600 transition disabled:opacity-50"
      >
        {status === 'loading' ? 'Sending...' : 'Send Message'}
      </button>
    </form>
  );
}

export default function ContactPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">Contact Us</h1>
      <p className="text-xl text-gray-600 mb-8">
        Corrections, removals, questions, and feedback. Every message reaches the site owner by email.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div>
          <Suspense fallback={<div className="h-96 bg-gray-50 rounded-xl animate-pulse" />}>
            <ContactForm />
          </Suspense>
        </div>

        <div className="space-y-8">
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Fixing a listing</h3>
            <p className="text-gray-600">
              Every club page has a <strong>Suggest a correction</strong> link that opens this form with the club name
              and page filled in. Tell us what changed and, if you can, point to the club&apos;s own website or social page
              so we can confirm it.
            </p>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Adding a club</h3>
            <p className="text-gray-600 mb-4">
              Know a club that is not listed? Use the submission form so the entry arrives with the fields we need.
            </p>
            <Link href="/submit" className="text-amber-600 hover:underline font-medium">
              Submit a club &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
```

**Step 4: Run check to verify it passes**

Run: `grep -c "correctionPrefill\|Suspense" app/contact/page.tsx; grep -c "mcdirectory\|/register" app/contact/page.tsx; pnpm typecheck`
Expected: a number greater than `0`, then `0`, then tsc exits 0

**Step 5: Commit**

```bash
git add app/contact/page.tsx
git commit -m "feat(contact): prefill corrections from club pages, drop account copy"
```

---

### Task 9: Header without sessions

**Files:**
- Modify: `components/Header.tsx`

**Step 1: Write the failing check**

Run: `grep -c "next-auth\|useSession\|/login\|/register\|/dashboard\|/submit-club" components/Header.tsx`
Expected: a number greater than `0`

**Step 2: Verify the check fails**

Same command; any non-zero count is the failing state.

**Step 3: Write minimal implementation**

Replace `components/Header.tsx` entirely:

```tsx
'use client';

import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SITE_NAME } from '@/lib/utils';

export default function Header() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsMenuOpen(false);
    }
  };

  // Close the More dropdown when clicking outside it.
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (moreRef.current && !moreRef.current.contains(event.target as Node)) {
        setIsMoreOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <svg className="w-8 h-8 text-amber-500" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M17.5 12a5.5 5.5 0 1 1 0 11 5.5 5.5 0 0 1 0-11zm-11 0a5.5 5.5 0 1 1 0 11 5.5 5.5 0 0 1 0-11zm11 2a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7zm-11 0a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7zM20 7c.55 0 1 .45 1 1v1h-1.5V8H18V6h1c.55 0 1 .45 1 1zM6 6v2H4.5V9H3V8c0-.55.45-1 1-1h1c.55 0 1-.45 1-1zm9.5-2h-7L7 6.5V8h10V6.5L15.5 4z"/>
            </svg>
            <span className="font-bold text-xl text-gray-900">{SITE_NAME}</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/states" className="text-gray-600 hover:text-gray-900 font-medium transition">States</Link>
            <Link href="/cities" className="text-gray-600 hover:text-gray-900 font-medium transition">Cities</Link>
            <Link href="/guides" className="text-gray-600 hover:text-gray-900 font-medium transition">Guides</Link>

            <div className="relative" ref={moreRef}>
              <button
                onClick={() => setIsMoreOpen(!isMoreOpen)}
                className="flex items-center text-gray-600 hover:text-gray-900 font-medium transition"
                aria-expanded={isMoreOpen}
              >
                More
                <svg
                  className={`w-4 h-4 ml-1 transition-transform ${isMoreOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isMoreOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  <Link href="/about" className="block px-4 py-2 text-gray-700 hover:bg-gray-50 transition" onClick={() => setIsMoreOpen(false)}>
                    About Us
                  </Link>
                  <Link href="/contact" className="block px-4 py-2 text-gray-700 hover:bg-gray-50 transition" onClick={() => setIsMoreOpen(false)}>
                    Contact
                  </Link>
                </div>
              )}
            </div>
          </nav>

          {/* Search + CTA */}
          <div className="hidden md:flex items-center space-x-4">
            <form onSubmit={handleSearch} className="flex items-center" role="search">
              <div className="relative">
                <label htmlFor="header-search" className="sr-only">Search clubs</label>
                <input
                  id="header-search"
                  type="text"
                  placeholder="Search clubs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-48 lg:w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
                <svg
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </form>

            <Link
              href="/submit"
              className="flex items-center px-4 py-2 bg-amber-500 text-white font-semibold rounded-lg hover:bg-amber-600 transition shadow-sm"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Submit a Club
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMenuOpen}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <form onSubmit={handleSearch} className="mb-4" role="search">
              <div className="relative">
                <label htmlFor="mobile-search" className="sr-only">Search clubs</label>
                <input
                  id="mobile-search"
                  type="text"
                  placeholder="Search clubs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <svg
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </form>

            <nav className="space-y-1">
              <p className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Browse</p>
              <Link href="/states" className="block px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg" onClick={() => setIsMenuOpen(false)}>
                Browse States
              </Link>
              <Link href="/cities" className="block px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg" onClick={() => setIsMenuOpen(false)}>
                Browse Cities
              </Link>
              <Link href="/guides" className="block px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg" onClick={() => setIsMenuOpen(false)}>
                Rider Guides
              </Link>

              <hr className="my-3 border-gray-200" />

              <p className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">More</p>
              <Link href="/about" className="block px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg" onClick={() => setIsMenuOpen(false)}>
                About Us
              </Link>
              <Link href="/contact" className="block px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg" onClick={() => setIsMenuOpen(false)}>
                Contact
              </Link>

              <hr className="my-3 border-gray-200" />

              <Link
                href="/submit"
                className="flex items-center justify-center mx-3 mt-4 px-4 py-3 bg-amber-500 text-white font-semibold rounded-lg hover:bg-amber-600 transition"
                onClick={() => setIsMenuOpen(false)}
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Submit a Club
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
```

**Step 4: Run check to verify it passes**

Run: `grep -c "next-auth\|useSession\|/login\|/register\|/dashboard\|/submit-club" components/Header.tsx; pnpm typecheck`
Expected: `0`; tsc exits 0

**Step 5: Commit**

```bash
git add components/Header.tsx
git commit -m "feat(header): single Submit a Club link, no session UI"
```

---

### Task 10: Root layout and footer without session provider and newsletter

**Files:**
- Modify: `app/layout.tsx`
- Modify: `components/Footer.tsx`
- Delete: `components/providers/SessionProvider.tsx`, `components/NewsletterForm.tsx`, `app/api/newsletter/route.ts`

**Step 1: Write the failing check**

Run: `grep -c "SessionProvider" app/layout.tsx; grep -c "NewsletterForm\|Stay Connected" components/Footer.tsx`
Expected: `3` and `3`

**Step 2: Verify the check fails**

Same command; non-zero counts are the failing state.

**Step 3: Write minimal implementation**

`app/layout.tsx` edits:

```tsx
// before (delete this import line)
import { SessionProvider } from "@/components/providers/SessionProvider";
```

```tsx
// before
      <body className={`${inter.className} bg-white text-gray-900 antialiased`}>
        <SessionProvider>
          <GoogleAnalytics />
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-grow">{children}</main>
            <Footer />
          </div>
        </SessionProvider>
      </body>
// after
      <body className={`${inter.className} bg-white text-gray-900 antialiased`}>
        <GoogleAnalytics />
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-grow">{children}</main>
          <Footer />
        </div>
      </body>
```

`components/Footer.tsx` edits:

```tsx
// before (delete this import line)
import NewsletterForm from './NewsletterForm';
```

```tsx
// before (delete this whole block)
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="max-w-xl">
            <h3 className="font-semibold text-white mb-2">Stay Connected</h3>
            <p className="text-gray-400 text-sm mb-4">
              Occasional updates on new clubs and guides. No spam, unsubscribe any time.
            </p>
            <NewsletterForm />
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-800 text-center">
// after
        <div className="mt-12 pt-8 border-t border-gray-800 text-center">
```

Then delete the files:

```bash
git rm -q components/providers/SessionProvider.tsx components/NewsletterForm.tsx app/api/newsletter/route.ts
```

**Step 4: Run check to verify it passes**

Run: `grep -c "SessionProvider" app/layout.tsx; grep -c "NewsletterForm\|Stay Connected" components/Footer.tsx; pnpm typecheck`
Expected: `0`, `0`, tsc exits 0

**Step 5: Commit**

```bash
git add app/layout.tsx components/Footer.tsx
git commit -m "feat: remove session provider and newsletter block"
```

---

### Task 11: Club page prerenders everything, no database

**Files:**
- Modify: `app/clubs/[slug]/page.tsx`
- Test: `tests/pages/club-page.test.ts`

**Step 1: Write the failing test**

Create `tests/pages/club-page.test.ts`:

```ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getAllClubs } from '@/lib/data';

test('every club page is prerendered and unknown slugs 404', async () => {
  const page = await import('@/app/clubs/[slug]/page');
  const params = await page.generateStaticParams();
  assert.equal(params.length, getAllClubs().length);
  assert.equal(page.dynamicParams, false);
  assert.equal('revalidate' in page, false);
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm exec tsx --test tests/pages/club-page.test.ts`
Expected: FAIL with `Expected values to be strictly equal: 100 !== 2102`

**Step 3: Write minimal implementation**

Replace `app/clubs/[slug]/page.tsx` entirely:

```tsx
import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Breadcrumbs from '@/components/Breadcrumbs';
import Rating from '@/components/Rating';
import ClubCard from '@/components/ClubCard';
import ClubImage from '@/components/ClubImage';
import ClubImageGallery from '@/components/ClubImageGallery';
import SchemaMarkup from '@/components/SchemaMarkup';
import AdSlot from '@/components/AdSlot';
import AffiliateSection from '@/components/AffiliateSection';
import { getAllClubs, getClubBySlug, getRelatedClubs, isIndexableClub, isTemplateDescription, isIndexableCity, getCityBySlug } from '@/lib/data';
import { attachImages, getClubImages, sortForDisplay } from '@/lib/images';
import { correctionHref } from '@/lib/contact';
import { formatRating, formatReviews, capitalizeCity, SITE_URL } from '@/lib/utils';

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Every club page is built ahead of time from data/clubs.json. Unknown slugs 404.
export const dynamicParams = false;

export async function generateStaticParams() {
  return getAllClubs().map((club) => ({ slug: club.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const club = getClubBySlug(slug);

  if (!club) {
    return { title: 'Club Not Found' };
  }

  const cityName = capitalizeCity(club.City);
  const indexable = isIndexableClub(club);

  return {
    title: `${club.name} - ${cityName}, ${club.stateName}`,
    alternates: { canonical: `/clubs/${club.slug}` },
    // Thin listings, dealers, venues, and bars stay reachable but out of the index.
    robots: indexable ? undefined : { index: false, follow: true },
    description: club.description || `${club.name} is a motorcycle club located in ${cityName}, ${club.stateName}. ${club.rating > 0 ? `Rated ${club.rating}/5 with ${club.reviews} reviews.` : ''}`,
    openGraph: {
      title: `${club.name} - Motorcycle Club in ${cityName}, ${club.stateName}`,
      description: club.description || `${club.name} motorcycle club in ${cityName}, ${club.stateName}.`,
      url: `${SITE_URL}/clubs/${club.slug}`,
      images: club.featured_image ? [{ url: club.featured_image }] : undefined,
    },
  };
}

export default async function ClubPage({ params }: PageProps) {
  const { slug } = await params;
  const club = getClubBySlug(slug);

  if (!club) {
    notFound();
  }

  const images = getClubImages(club.place_id);
  const relatedClubs = attachImages(sortForDisplay(getRelatedClubs(club, 20)).slice(0, 4));
  const cityRecord = getCityBySlug(club.State, club.citySlug);
  const cityHasPage = cityRecord ? isIndexableCity(cityRecord) : false;
  const amaChartered = isTemplateDescription(club.description);
  const showDescription = Boolean(club.description) && !amaChartered;
  const cityName = capitalizeCity(club.City);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumbs
        items={[
          { label: 'States', href: '/states' },
          { label: club.stateName, href: `/state/${club.State}` },
          ...(cityHasPage ? [{ label: cityName, href: `/city/${club.State}/${club.citySlug}` }] : []),
          { label: club.name },
        ]}
      />

      <SchemaMarkup type="club" club={club} />

      <SchemaMarkup
        type="breadcrumb"
        items={[
          { name: 'Home', url: '/' },
          { name: 'States', url: '/states' },
          { name: club.stateName, url: `/state/${club.State}` },
          ...(cityHasPage ? [{ name: cityName, url: `/city/${club.State}/${club.citySlug}` }] : []),
          { name: club.name, url: `/clubs/${club.slug}` },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {images.length > 0 ? (
            <div className="mb-6">
              <ClubImageGallery images={images} clubName={club.name} />
            </div>
          ) : (
            <div className="relative h-64 md:h-96 bg-gray-100 rounded-xl overflow-hidden mb-6">
              <ClubImage src={club.featured_image || club.featured_image_original} alt={club.name} priority />
              {club.main_category && (
                <span className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-gray-700 text-sm font-medium px-3 py-1 rounded-full z-10">
                  {club.main_category}
                </span>
              )}
            </div>
          )}

          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{club.name}</h1>

            <div className="flex flex-wrap items-center gap-4 mb-4">
              {club.rating > 0 && (
                <div className="flex items-center gap-2">
                  <Rating rating={club.rating} size="md" />
                  <span className="font-semibold text-gray-900">{formatRating(club.rating)}</span>
                  <span className="text-gray-500">({formatReviews(club.reviews)})</span>
                </div>
              )}
              <span className="text-gray-400">•</span>
              <span className="text-gray-600">
                {cityName}, {club.stateName}
              </span>
            </div>

            {showDescription && (
              <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-line">{club.description}</p>
            )}
            {amaChartered && (
              <p className="text-gray-700 text-lg leading-relaxed">
                {club.name} holds a club charter with the American Motorcyclist Association, which means it can sanction
                AMA events and carries the association&apos;s club insurance and rules. Contact the club directly for
                meeting times and membership requirements.
              </p>
            )}

            <div className="mt-6">
              <Link
                href={correctionHref(club.name, club.slug)}
                className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Suggest a correction
              </Link>
            </div>
          </div>

          {/* Details */}
          <div className="bg-gray-50 rounded-xl p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Club Details</h2>
            <dl className="space-y-4">
              {club.address && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Address</dt>
                  <dd className="text-gray-900 mt-1">{club.address}</dd>
                </div>
              )}
              {club.phone && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Phone</dt>
                  <dd className="mt-1">
                    <a href={`tel:${club.phone}`} className="text-blue-600 hover:underline">{club.phone}</a>
                  </dd>
                </div>
              )}
              {club.website && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Website</dt>
                  <dd className="mt-1">
                    <a href={club.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">
                      {club.website}
                    </a>
                  </dd>
                </div>
              )}
              {club.categories && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Categories</dt>
                  <dd className="mt-1 flex flex-wrap gap-2">
                    {club.categories.split(',').map((cat) => (
                      <span key={cat.trim()} className="bg-gray-200 text-gray-700 text-sm px-3 py-1 rounded-full">
                        {cat.trim()}
                      </span>
                    ))}
                  </dd>
                </div>
              )}
              {amaChartered && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Affiliation</dt>
                  <dd className="text-gray-900 mt-1">American Motorcyclist Association chartered club</dd>
                </div>
              )}
              {club.closed_on && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Hours</dt>
                  <dd className="text-gray-900 mt-1">{club.closed_on}</dd>
                </div>
              )}
            </dl>

            {club.link && (
              <div className="mt-6">
                <a
                  href={club.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition"
                >
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                  </svg>
                  View on Google Maps
                </a>
              </div>
            )}
          </div>

          {relatedClubs.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">More Clubs in {cityName}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {relatedClubs.map((relatedClub) => (
                  <ClubCard key={relatedClub.place_id} club={relatedClub} />
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Sidebar. The ad is last so it can stick without covering the links above it. */}
        <aside className="lg:col-span-1 space-y-6">
          <AffiliateSection />

          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Explore More</h3>
            <ul className="space-y-3">
              {cityHasPage && (
                <li>
                  <Link href={`/city/${club.State}/${club.citySlug}`} className="text-gray-600 hover:text-gray-900 transition flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    More clubs in {cityName}
                  </Link>
                </li>
              )}
              <li>
                <Link href={`/state/${club.State}`} className="text-gray-600 hover:text-gray-900 transition flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  All clubs in {club.stateName}
                </Link>
              </li>
              <li>
                <Link href="/states" className="text-gray-600 hover:text-gray-900 transition flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  Browse all states
                </Link>
              </li>
            </ul>
          </div>

          <div className="lg:sticky lg:top-20">
            <AdSlot placement="sidebar" />
          </div>
        </aside>
      </div>
    </div>
  );
}
```

**Step 4: Run test to verify it passes**

Run: `pnpm exec tsx --test tests/pages/club-page.test.ts && pnpm typecheck`
Expected: PASS, `# pass 1`; tsc exits 0

**Step 5: Commit**

```bash
git add app/clubs/[slug]/page.tsx tests/pages/club-page.test.ts
git commit -m "feat(clubs): prerender every club page, replace save/claim with correction link"
```

---

### Task 12: State page ad placements

**Files:**
- Modify: `app/state/[code]/page.tsx`

**Step 1: Write the failing check**

Run: `grep -c "AdPlaceholder" app/state/[code]/page.tsx; grep -c "shouldInsertInFeedAd" app/state/[code]/page.tsx`
Expected: `4` then `0`

**Step 2: Verify the check fails**

Same command; `4` and `0` is the failing state.

**Step 3: Write minimal implementation**

Edits to `app/state/[code]/page.tsx`:

```tsx
// before
import AdPlaceholder from '@/components/AdPlaceholder';
// after
import AdSlot from '@/components/AdSlot';
import { shouldInsertInFeedAd } from '@/lib/ads';
```

```tsx
// before
      <AdPlaceholder size="banner" className="mb-8" />

      {cities.length > 0 && (
// after
      {/* Fixed unit: after the editorial intro. */}
      <AdSlot placement="inline" className="mb-8" />

      {cities.length > 0 && (
```

```tsx
// before
              {(index + 1) % 12 === 0 && index < clubs.length - 1 && (
                <div className="col-span-full">
                  <AdPlaceholder size="inline" />
                </div>
              )}
// after
              {shouldInsertInFeedAd(index, clubs.length) && (
                <div className="col-span-full">
                  <AdSlot placement="inline" />
                </div>
              )}
```

```tsx
// before (delete these two lines; the closing </div> that follows stays)
      <AdPlaceholder size="banner" className="mt-8" />

```

**Step 4: Run check to verify it passes**

Run: `grep -c "AdPlaceholder" app/state/[code]/page.tsx; grep -c "AdSlot placement" app/state/[code]/page.tsx; pnpm typecheck`
Expected: `0`, `2`, tsc exits 0

**Step 5: Commit**

```bash
git add app/state/[code]/page.tsx
git commit -m "feat(ads): state page inline unit after intro and in-feed every 12"
```

---

### Task 13: City page ad placements

**Files:**
- Modify: `app/city/[state]/[city]/page.tsx`

**Step 1: Write the failing check**

Run: `grep -c "AdPlaceholder" app/city/[state]/[city]/page.tsx; grep -c "% 9 === 0" app/city/[state]/[city]/page.tsx`
Expected: `5` then `1`

**Step 2: Verify the check fails**

Same command; `5` and `1` is the failing state.

**Step 3: Write minimal implementation**

Edits to `app/city/[state]/[city]/page.tsx`:

```tsx
// before
import AdPlaceholder from '@/components/AdPlaceholder';
// after
import AdSlot from '@/components/AdSlot';
import { shouldInsertInFeedAd } from '@/lib/ads';
```

```tsx
// before
        <div className="lg:col-span-3">
          <AdPlaceholder size="banner" className="mb-8" />

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
// after
        <div className="lg:col-span-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
```

```tsx
// before
                {(index + 1) % 9 === 0 && index < clubs.length - 1 && (
                  <div className="col-span-full">
                    <AdPlaceholder size="inline" />
                  </div>
                )}
// after
                {shouldInsertInFeedAd(index, clubs.length) && (
                  <div className="col-span-full">
                    <AdSlot placement="inline" />
                  </div>
                )}
```

```tsx
// before
        <div className="lg:col-span-1 space-y-6">
          <AdPlaceholder size="sidebar" />
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="font-semibold text-gray-900 mb-3">New to clubs?</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/guides/how-to-join-a-motorcycle-club" className="text-amber-700 hover:underline">How to join a motorcycle club</Link></li>
              <li><Link href="/guides/types-of-motorcycle-clubs" className="text-amber-700 hover:underline">Types of motorcycle clubs</Link></li>
              <li><Link href="/guides/motorcycle-club-etiquette-and-patches" className="text-amber-700 hover:underline">Club etiquette and patches</Link></li>
            </ul>
          </div>
          <AffiliateSection />
        </div>
      </div>

      <AdPlaceholder size="banner" className="mt-8" />
    </div>
// after
        <aside className="lg:col-span-1 space-y-6">
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="font-semibold text-gray-900 mb-3">New to clubs?</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/guides/how-to-join-a-motorcycle-club" className="text-amber-700 hover:underline">How to join a motorcycle club</Link></li>
              <li><Link href="/guides/types-of-motorcycle-clubs" className="text-amber-700 hover:underline">Types of motorcycle clubs</Link></li>
              <li><Link href="/guides/motorcycle-club-etiquette-and-patches" className="text-amber-700 hover:underline">Club etiquette and patches</Link></li>
            </ul>
          </div>
          <AffiliateSection />
          {/* Last in the column so it sticks without covering the blocks above. */}
          <div className="lg:sticky lg:top-20">
            <AdSlot placement="sidebar" />
          </div>
        </aside>
      </div>
    </div>
```

**Step 4: Run check to verify it passes**

Run: `grep -c "AdPlaceholder" app/city/[state]/[city]/page.tsx; grep -c "AdSlot placement" app/city/[state]/[city]/page.tsx; pnpm typecheck`
Expected: `0`, `2`, tsc exits 0

**Step 5: Commit**

```bash
git add app/city/[state]/[city]/page.tsx
git commit -m "feat(ads): city page sticky sidebar and in-feed every 12"
```

---

### Task 14: Guide page placements, drop banners elsewhere, delete `AdPlaceholder`

**Files:**
- Modify: `app/guides/[slug]/page.tsx`, `app/guides/page.tsx`, `app/page.tsx`, `app/states/page.tsx`, `app/cities/page.tsx`, `app/search/page.tsx`
- Delete: `components/AdPlaceholder.tsx`

**Step 1: Write the failing check**

Run: `grep -rl "AdPlaceholder" app components | wc -l`
Expected: `7`

**Step 2: Verify the check fails**

Same command; `7` is the failing state.

**Step 3: Write minimal implementation**

`app/guides/[slug]/page.tsx`:

```tsx
// before
import AdPlaceholder from '@/components/AdPlaceholder';
// after
import AdSlot from '@/components/AdSlot';
```

```tsx
// before
              {i === 1 && <AdPlaceholder size="inline" className="mt-8" />}
// after
              {/* Fixed unit: after the second section. */}
              {i === 1 && <AdSlot placement="inline" className="mt-8" />}
```

```tsx
// before
        <aside className="space-y-6">
          <AdPlaceholder size="sidebar" />
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="font-semibold text-gray-900 mb-3">Find clubs by state</h3>
            <ul className="grid grid-cols-2 gap-2">
              {popularStates.map((s) => (
                <li key={s.code}>
                  <Link href={`/state/${s.code}`} className="text-gray-700 hover:text-amber-700 text-sm">{s.name}</Link>
                </li>
              ))}
            </ul>
            <Link href="/states" className="inline-block mt-4 text-sm font-medium text-amber-700 hover:underline">All states</Link>
          </div>
          <AffiliateSection />
        </aside>
// after
        <aside className="space-y-6">
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="font-semibold text-gray-900 mb-3">Find clubs by state</h3>
            <ul className="grid grid-cols-2 gap-2">
              {popularStates.map((s) => (
                <li key={s.code}>
                  <Link href={`/state/${s.code}`} className="text-gray-700 hover:text-amber-700 text-sm">{s.name}</Link>
                </li>
              ))}
            </ul>
            <Link href="/states" className="inline-block mt-4 text-sm font-medium text-amber-700 hover:underline">All states</Link>
          </div>
          <AffiliateSection />
          {/* Last in the column so it sticks without covering the blocks above. */}
          <div className="lg:sticky lg:top-20">
            <AdSlot placement="sidebar" />
          </div>
        </aside>
```

`app/guides/page.tsx`: delete the line `import AdPlaceholder from '@/components/AdPlaceholder';` and the line `      <AdPlaceholder size="banner" className="mb-8" />` (plus the blank line after it).

`app/page.tsx`: delete the line `import AdPlaceholder from '@/components/AdPlaceholder';` and both blocks:

```tsx
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <AdPlaceholder size="banner" />
      </div>
```

```tsx
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AdPlaceholder size="banner" />
      </div>
```

`app/states/page.tsx`: delete the line `import AdPlaceholder from '@/components/AdPlaceholder';`, the line `      <AdPlaceholder size="banner" className="mb-8" />`, and the line `      <AdPlaceholder size="banner" className="mt-8" />`.

`app/cities/page.tsx`: same three deletions as `app/states/page.tsx`.

`app/search/page.tsx`: delete the line `import AdPlaceholder from '@/components/AdPlaceholder';`, the line `      <AdPlaceholder size="banner" className="mb-8" />`, and the line `      <AdPlaceholder size="banner" className="mt-8" />`.

Then:

```bash
git rm -q components/AdPlaceholder.tsx
```

**Step 4: Run check to verify it passes**

Run: `grep -rl "AdPlaceholder" app components | wc -l; pnpm typecheck && pnpm lint:app`
Expected: `0`; tsc and eslint exit 0

**Step 5: Commit**

```bash
git add app
git commit -m "feat(ads): guide page units, remove banner placements and AdPlaceholder"
```

---

### Task 15: Copy and robots cleanup for the no-account site

**Files:**
- Modify: `app/robots.ts`, `app/about/page.tsx`, `app/privacy/page.tsx`, `app/terms/page.tsx`, `app/submit/page.tsx`

**Step 1: Write the failing check**

Run: `grep -rn "create an account\|/submit-club\|/dashboard\|/register\|User Accounts\|one-way hash\|24-48 hours" app/robots.ts app/about/page.tsx app/privacy/page.tsx app/terms/page.tsx app/submit/page.tsx | wc -l`
Expected: `10`

**Step 2: Verify the check fails**

Same command; a non-zero count is the failing state.

**Step 3: Write minimal implementation**

`app/robots.ts`:

```ts
// before
      disallow: [
        '/api/',
        '/search',
        '/dashboard/',
        '/admin/',
        '/login',
        '/register',
        '/claim/',
        '/submit-club',
      ],
// after
      disallow: ['/api/', '/search'],
```

`app/about/page.tsx`:

```tsx
// before
            <span>User reviews and ratings to help you find the right club</span>
// after
            <span>Public ratings where a club has them, plus original guides on how clubs work</span>
```

```tsx
// before
        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">For Club Owners</h2>
        <p className="text-gray-600 mb-6">
          If you run a motorcycle club and want to claim or update your listing, you can
          create an account and submit a claim request. We verify all claims to ensure
          accurate information for our users.
        </p>
// after
        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">For Club Officers</h2>
        <p className="text-gray-600 mb-6">
          If you run a motorcycle club and something on your listing is wrong, use the
          <strong> Suggest a correction</strong> link on the club page. It opens the contact form with the
          club already filled in. We check requests against the club&apos;s own website or social page before
          updating the entry, and we remove listings on request.
        </p>
```

```tsx
// before
              href="/submit-club"
// after
              href="/submit"
```

`app/privacy/page.tsx`:

```tsx
// before
          <li>Name and email address when you create an account, subscribe to updates, or contact us.</li>
          <li>Account credentials, which are stored as a one-way hash.</li>
          <li>Content you submit, such as club submissions, reviews, and listing claims.</li>
// after
          <li>Name and email address when you contact us or submit a club.</li>
          <li>Content you submit, such as club submissions and listing corrections.</li>
```

```tsx
// before
          <li>To operate the directory, accounts, and submission review.</li>
          <li>To respond to messages and listing corrections.</li>
          <li>To send updates you asked for. Every email includes an unsubscribe link.</li>
// after
          <li>To operate the directory and review submissions.</li>
          <li>To respond to messages and listing corrections.</li>
```

```tsx
// before
          Account data is kept while the account is active and deleted on request. Contact messages are kept for up to two
          years. We use industry-standard safeguards, but no method of transmission or storage is completely secure.
// after
          We do not offer user accounts and the website stores no personal data. Form submissions are delivered to our
          inbox by email and kept there for up to two years. We use industry-standard safeguards, but no method of
          transmission or storage is completely secure.
```

```tsx
// before
          <li>Delete your account and data.</li>
// after
          <li>Delete information you sent us.</li>
```

`app/terms/page.tsx`:

```tsx
// before
          information about clubs, including locations, contact details, and user reviews. Our
// after
          information about clubs, including locations, contact details, and public ratings. Our
```

```tsx
// before
        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">3. User Accounts</h2>
        <p>To access certain features, you may need to create an account. You agree to:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Provide accurate and complete information</li>
          <li>Maintain the security of your account credentials</li>
          <li>Notify us immediately of any unauthorized access</li>
          <li>Be responsible for all activities under your account</li>
        </ul>
// after
        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">3. Submissions</h2>
        <p>The site has no user accounts. When you send a message, correction, or club submission, you agree to:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Provide accurate and complete information</li>
          <li>Submit only clubs and details you are entitled to share</li>
          <li>Accept that submissions are reviewed before publication and may be edited or declined</li>
        </ul>
```

```tsx
// before
          When you submit content (reviews, club information, etc.), you grant us a non-exclusive,
// after
          When you submit content (club information, corrections, messages), you grant us a non-exclusive,
```

```tsx
// before
          Club owners may claim and update their listings by creating an account and submitting a
          verification request.
// after
          Club officers may request corrections or removal through the contact form. We verify requests
          against the club&apos;s own published information before changing a listing.
```

`app/submit/page.tsx`:

```tsx
// before
            Submissions are reviewed within 24-48 hours to verify information.
// after
            Every submission is checked against the club&apos;s own website before it is added.
```

**Step 4: Run check to verify it passes**

Run: `grep -rn "create an account\|/submit-club\|/dashboard\|/register\|User Accounts\|one-way hash\|24-48 hours" app/robots.ts app/about/page.tsx app/privacy/page.tsx app/terms/page.tsx app/submit/page.tsx | wc -l; pnpm typecheck`
Expected: `0`; tsc exits 0

**Step 5: Commit**

```bash
git add app/robots.ts app/about/page.tsx app/privacy/page.tsx app/terms/page.tsx app/submit/page.tsx
git commit -m "chore: remove account language from policies, about, robots"
```

---

### Task 16: Remove auth, database, and their packages

**Files:**
- Delete: `app/login/`, `app/register/`, `app/dashboard/`, `app/admin/`, `app/claim/`, `app/submit-club/`, `app/api/auth/`, `app/api/admin/`, `app/api/user/`, `app/api/favorites/`, `app/api/reviews/`, `app/api/claims/`, `app/api/clubs/`, `prisma/`, `dev.db`, `lib/auth.ts`, `lib/db.ts`, `types/next-auth.d.ts`, `components/ClaimButton.tsx`, `components/FavoriteButton.tsx`, `components/ClubActions.tsx`, `components/ReviewForm.tsx`, `components/ReviewList.tsx`, `components/NotificationBell.tsx`, `scripts/sync-new-clubs-to-db.ts`, `scripts/download-club-images.ts`
- Modify: `package.json`, `pnpm-workspace.yaml`, `.gitignore`, `pnpm-lock.yaml` (regenerated)

**Step 1: Write the failing check**

Run: `grep -rln "next-auth\|@prisma\|@/lib/db\|@/lib/auth\|bcrypt" app components lib scripts types prisma | wc -l; grep -c "prisma\|next-auth\|bcrypt" package.json`
Expected: `46`, then `10`

**Step 2: Verify the check fails**

Same command; non-zero counts are the failing state.

**Step 3: Write minimal implementation**

```bash
git rm -rq app/login app/register app/dashboard app/admin app/claim app/submit-club \
  app/api/auth app/api/admin app/api/user app/api/favorites app/api/reviews app/api/claims app/api/clubs \
  prisma dev.db lib/auth.ts lib/db.ts types/next-auth.d.ts \
  components/ClaimButton.tsx components/FavoriteButton.tsx components/ClubActions.tsx \
  components/ReviewForm.tsx components/ReviewList.tsx components/NotificationBell.tsx \
  scripts/sync-new-clubs-to-db.ts scripts/download-club-images.ts
rmdir types 2>/dev/null || true
```

`package.json` — replace the `scripts`, `dependencies`, and `devDependencies` blocks with:

```json
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint",
    "lint:app": "eslint app components lib",
    "test": "tsx --test \"tests/**/*.test.ts\"",
    "typecheck": "tsc --noEmit",
    "health": "node scripts/health-check.mjs",
    "images:download": "tsx scripts/download-images.ts",
    "images:manifest": "tsx scripts/build-image-manifest.ts",
    "scrape:fetch": "tsx scripts/scrape-motorcycleroads.ts",
    "scrape:transform": "tsx scripts/transform-scraped-data.ts",
    "scrape:merge": "tsx scripts/merge-club-data.ts",
    "scrape:all": "npm run scrape:fetch && npm run scrape:transform && npm run scrape:merge",
    "scrape:riderclubs": "tsx scripts/scrape-riderclubs.ts",
    "scrape:riderclubs:transform": "tsx scripts/transform-riderclubs-data.ts",
    "scrape:riderclubs:all": "npm run scrape:riderclubs && npm run scrape:riderclubs:transform && npm run scrape:merge",
    "scrape:ridersinfo": "tsx scripts/scrape-ridersinfo.ts",
    "scrape:ridersinfo:transform": "tsx scripts/transform-ridersinfo-data.ts",
    "scrape:ridersinfo:all": "npm run scrape:ridersinfo && npm run scrape:ridersinfo:transform && npm run scrape:merge",
    "brand:assets": "node scripts/generate-brand-assets.mjs public"
  },
  "dependencies": {
    "csv-parser": "^3.2.0",
    "next": "16.1.1",
    "react": "19.2.3",
    "react-dom": "19.2.3"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "cheerio": "^1.1.2",
    "dotenv": "^17.2.3",
    "eslint": "^9",
    "eslint-config-next": "16.1.1",
    "sharp": "^0.34.5",
    "tailwindcss": "^4",
    "tsx": "^4.21.0",
    "typescript": "^5"
  }
```

`pnpm-workspace.yaml`, whole file:

```yaml
onlyBuiltDependencies: ["sharp"]
```

`.gitignore`: delete the line `/lib/generated/prisma` and add after `# vercel` / `.vercel`:

```
# weekly health check state (GitHub Actions cache)
/.health/
```

Then regenerate the lockfile and node_modules:

```bash
pnpm install
```

**Step 4: Run check to verify it passes**

Run: `grep -rln "next-auth\|@prisma\|@/lib/db\|@/lib/auth\|bcrypt" app components lib scripts 2>/dev/null | wc -l; grep -c "prisma\|next-auth\|bcrypt" package.json; ls node_modules/.pnpm | grep -c "prisma\|next-auth"; pnpm typecheck && pnpm test`
Expected: `0`, `0`, `0`, tsc exits 0, all tests pass

**Step 5: Commit**

```bash
git add -A
git commit -m "feat: remove auth, database, and their packages"
```

---

### Task 17: Health check library

**Files:**
- Create: `scripts/health-check-lib.mjs`
- Test: `tests/scripts/health-check-lib.test.ts`

**Step 1: Write the failing test**

Create `tests/scripts/health-check-lib.test.ts`:

```ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseSitemapUrls, sampleEvenly, withinTolerance, checkPage } from '../../scripts/health-check-lib.mjs';

const HOST = 'www.usmotorcycleclubs.com';
const AD = '<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1"></script>';
const CANON = `<link rel="canonical" href="https://${HOST}/state/tx"/>`;

test('parses <loc> entries from a sitemap', () => {
  const xml = `<urlset><url><loc>https://a/1</loc></url><url><loc> https://a/2 </loc></url></urlset>`;
  assert.deepEqual(parseSitemapUrls(xml), ['https://a/1', 'https://a/2']);
});

test('samples evenly across the list and keeps short lists whole', () => {
  const items = Array.from({ length: 100 }, (_, i) => i);
  const picked = sampleEvenly(items, 20);
  assert.equal(picked.length, 20);
  assert.equal(picked[0], 0);
  assert.equal(picked[19], 95);
  assert.deepEqual(sampleEvenly([1, 2, 3], 20), [1, 2, 3]);
});

test('tolerance compares against the previous count', () => {
  assert.equal(withinTolerance(null, 500, 0.1), true);
  assert.equal(withinTolerance(1000, 950, 0.1), true);
  assert.equal(withinTolerance(1000, 1100, 0.1), true);
  assert.equal(withinTolerance(1000, 880, 0.1), false);
  assert.equal(withinTolerance(1000, 1120, 0.1), false);
});

test('a healthy page reports no problems', () => {
  const problems = checkPage({ status: 200, finalUrl: `https://${HOST}/state/tx`, html: `<html><head>${AD}${CANON}</head></html>`, host: HOST, adScript: true });
  assert.deepEqual(problems, []);
});

test('bad status, wrong host, missing canonical, and missing ad script are reported', () => {
  const problems = checkPage({ status: 500, finalUrl: 'https://motorcycle-clubs-us.vercel.app/x', html: '<html></html>', host: HOST, adScript: true });
  assert.deepEqual(problems, ['status 500', 'served from motorcycle-clubs-us.vercel.app', 'no canonical', 'ad script missing']);
});

test('canonical on another host is reported', () => {
  const problems = checkPage({ status: 200, finalUrl: `https://${HOST}/x`, html: `${AD}<link rel="canonical" href="https://usmotorcycleclubs.com/x"/>`, host: HOST, adScript: true });
  assert.deepEqual(problems, ['canonical host usmotorcycleclubs.com']);
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm exec tsx --test tests/scripts/health-check-lib.test.ts`
Expected: FAIL with `Cannot find module '.../scripts/health-check-lib.mjs'`

**Step 3: Write minimal implementation**

Create `scripts/health-check-lib.mjs`:

```js
// Pure helpers for scripts/health-check.mjs. Kept dependency-free so the
// GitHub Actions job runs on a bare Node 22 without installing anything.

const AD_SCRIPT = 'pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';

/** @param {string} xml @returns {string[]} */
export function parseSitemapUrls(xml) {
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
}

/** Evenly spaced sample so every run covers the same spread of page types. */
export function sampleEvenly(items, count) {
  if (items.length <= count) return [...items];
  const step = items.length / count;
  return Array.from({ length: count }, (_, i) => items[Math.floor(i * step)]);
}

/** @param {number|null} previous @param {number} current @param {number} pct fraction, 0.1 = 10% */
export function withinTolerance(previous, current, pct) {
  if (previous == null || Number.isNaN(previous)) return true;
  if (previous === 0) return current === 0;
  return Math.abs(current - previous) / previous <= pct;
}

function canonicalHref(html) {
  const tag = [...html.matchAll(/<link\b[^>]*>/gi)].map((m) => m[0]).find((t) => /\brel=["']canonical["']/i.test(t));
  return tag?.match(/\bhref=["']([^"']+)["']/i)?.[1];
}

/**
 * @param {{status:number, finalUrl:string, html:string, host:string, adScript:boolean}} page
 * @returns {string[]} problems, empty when healthy
 */
export function checkPage({ status, finalUrl, html, host, adScript }) {
  const problems = [];
  if (status !== 200) problems.push(`status ${status}`);
  const servedHost = new URL(finalUrl).host;
  if (servedHost !== host) problems.push(`served from ${servedHost}`);
  const canonical = canonicalHref(html);
  if (!canonical) problems.push('no canonical');
  else if (new URL(canonical).host !== host) problems.push(`canonical host ${new URL(canonical).host}`);
  if (adScript && !html.includes(AD_SCRIPT)) problems.push('ad script missing');
  return problems;
}
```

**Step 4: Run test to verify it passes**

Run: `pnpm exec tsx --test tests/scripts/health-check-lib.test.ts && pnpm typecheck`
Expected: PASS, `# pass 6`; tsc exits 0

**Step 5: Commit**

```bash
git add scripts/health-check-lib.mjs tests/scripts/health-check-lib.test.ts
git commit -m "feat(health): pure checks for sitemap, sampling, canonical, ad script"
```

---

### Task 18: Health check runner and weekly GitHub Actions workflow

**Files:**
- Create: `scripts/health-check.mjs`
- Create: `.github/workflows/health-check.yml`

**Step 1: Write the failing check**

Run: `node scripts/health-check.mjs; echo "exit=$?"`
Expected: `Error: Cannot find module '.../scripts/health-check.mjs'` and `exit=1`

**Step 2: Verify the check fails**

Same command; the module-not-found error is the failing state.

**Step 3: Write minimal implementation**

Create `scripts/health-check.mjs`:

```js
#!/usr/bin/env node
// Weekly production check. Requests /ads.txt, /robots.txt, /sitemap.xml and a
// spread of twenty pages, asserts 200, canonical host, ad script presence, and
// a sitemap count within 10% of the last run. Exit 1 on any failure so the
// GitHub Actions job fails and GitHub emails the owner.
//
// Env:
//   SITE_URL           origin to check (default https://www.usmotorcycleclubs.com)
//   HEALTH_STATE_FILE  where the last sitemap count is kept (default .health/sitemap-count)
//   EXPECT_AD_SCRIPT   "false" to skip the AdSense script assertion
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';
import { parseSitemapUrls, sampleEvenly, withinTolerance, checkPage } from './health-check-lib.mjs';

const SITE_URL = (process.env.SITE_URL || 'https://www.usmotorcycleclubs.com').replace(/\/$/, '');
const HOST = new URL(SITE_URL).host;
const SAMPLE_SIZE = 20;
const TOLERANCE = 0.1;
const STATE_FILE = process.env.HEALTH_STATE_FILE || '.health/sitemap-count';
const EXPECT_AD_SCRIPT = process.env.EXPECT_AD_SCRIPT !== 'false';

const failures = [];
const fail = (msg) => { failures.push(msg); console.log(`FAIL ${msg}`); };
const pass = (msg) => console.log(`ok   ${msg}`);

async function get(path) {
  const res = await fetch(`${SITE_URL}${path}`, {
    redirect: 'follow',
    headers: { 'user-agent': 'usmotorcycleclubs-health-check/1.0' },
  });
  return { status: res.status, finalUrl: res.url, text: await res.text() };
}

// 1. Plain files
const ads = await get('/ads.txt');
if (ads.status === 200 && /google\.com,\s*pub-\d+/.test(ads.text)) pass('/ads.txt');
else fail(`/ads.txt status ${ads.status} or publisher line missing`);

const robots = await get('/robots.txt');
if (robots.status === 200 && robots.text.includes(`Sitemap: ${SITE_URL}/sitemap.xml`)) pass('/robots.txt');
else fail(`/robots.txt status ${robots.status} or sitemap line missing`);

const sitemap = await get('/sitemap.xml');
const urls = sitemap.status === 200 ? parseSitemapUrls(sitemap.text) : [];
if (urls.length > 0) pass(`/sitemap.xml (${urls.length} urls)`);
else fail(`/sitemap.xml status ${sitemap.status} or empty`);

const offHost = urls.filter((u) => new URL(u).host !== HOST);
if (offHost.length === 0) pass('sitemap hosts');
else fail(`${offHost.length} sitemap urls on another host, e.g. ${offHost[0]}`);

// 2. Sitemap count against the last run
let previous = null;
try { previous = Number(await readFile(STATE_FILE, 'utf8')); } catch { /* first run */ }
if (withinTolerance(previous, urls.length, TOLERANCE)) pass(`sitemap count ${urls.length} (last run ${previous ?? 'n/a'})`);
else fail(`sitemap count ${urls.length} differs from last run ${previous} by more than ${TOLERANCE * 100}%`);
if (urls.length > 0) {
  await mkdir(dirname(STATE_FILE), { recursive: true });
  await writeFile(STATE_FILE, String(urls.length));
}

// 3. Sample pages
for (const url of sampleEvenly(urls, SAMPLE_SIZE)) {
  const path = new URL(url).pathname;
  try {
    const page = await get(path);
    const problems = checkPage({ status: page.status, finalUrl: page.finalUrl, html: page.text, host: HOST, adScript: EXPECT_AD_SCRIPT });
    if (problems.length === 0) pass(path);
    else fail(`${path}: ${problems.join(', ')}`);
  } catch (err) {
    fail(`${path}: ${err instanceof Error ? err.message : String(err)}`);
  }
}

console.log(failures.length ? `\n${failures.length} failure(s)` : '\nAll checks passed');
process.exit(failures.length ? 1 : 0);
```

Create `.github/workflows/health-check.yml`:

```yaml
name: Weekly health check

on:
  schedule:
    # Mondays 13:17 UTC. Off the hour so it is not delayed by the :00 rush.
    - cron: '17 13 * * 1'
  workflow_dispatch:

permissions:
  contents: read

jobs:
  check:
    runs-on: ubuntu-latest
    timeout-minutes: 10
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 22

      # The last sitemap count lives in the Actions cache. A unique key per run
      # plus a prefix restore-key always hands back the most recent run's file.
      - name: Restore last sitemap count
        uses: actions/cache/restore@v4
        with:
          path: .health
          key: health-${{ github.run_id }}
          restore-keys: |
            health-

      - name: Run checks
        run: node scripts/health-check.mjs

      - name: Save sitemap count
        if: always()
        uses: actions/cache/save@v4
        with:
          path: .health
          key: health-${{ github.run_id }}
```

**Step 4: Run check to verify it passes**

Run: `HEALTH_STATE_FILE=/tmp/claude-0/-home-user-MotorcycleClubsUS/87b99445-e609-5e87-bf28-9786bb845f70/scratchpad/health-count node scripts/health-check.mjs; echo "exit=$?"`
Expected: a line per check starting with `ok` or `FAIL`, then either `All checks passed` with `exit=0`, or specific `FAIL` lines against the live site (any `FAIL` is a real production finding to report, not a script bug). The script must not throw.

Also: `pnpm exec tsx --test tests/scripts/health-check-lib.test.ts` still passes.

**Step 5: Commit**

```bash
git add scripts/health-check.mjs .github/workflows/health-check.yml
git commit -m "feat(health): weekly GitHub Actions check of ads.txt, robots, sitemap, sample pages"
```

---

### Task 19: README and MONETIZATION.md

**Files:**
- Modify: `README.md`
- Modify: `MONETIZATION.md`

**Step 1: Write the failing check**

Run: `grep -c "RESEND_API_KEY\|CONTACT_TO_EMAIL\|health-check" README.md MONETIZATION.md`
Expected: `README.md:0` and `MONETIZATION.md:0`

**Step 2: Verify the check fails**

Same command; zeros are the failing state.

**Step 3: Write minimal implementation**

Replace `README.md` entirely:

```markdown
# US Motorcycle Clubs

Directory of motorcycle clubs across the United States. Next.js 16 on Vercel, fully prerendered from JSON data, ad-supported, no database and no user accounts.

**Live site:** https://www.usmotorcycleclubs.com

## How it works

- **Data:** `data/clubs.json`, `data/cities.json`, `data/states.json`, `data/images.json`. Read at build time only.
- **Rendering:** every public page is prerendered at build, including all 2,100+ club pages. There are no runtime data calls.
- **Forms:** `/contact` and `/submit` post to `POST /api/contact`, which validates, drops honeypot hits, and emails the owner through Resend. Nothing is stored.
- **Ads:** `lib/ads.ts` defines two fixed placements (`inline`, `sidebar`) with reserved heights. `components/AdSlot.tsx` renders them. Auto ads stay on in AdSense.
- **Affiliate links:** `lib/affiliates.ts` holds the Amazon tag, product list, and link builder. `components/AffiliateSection.tsx` only renders it.
- **Content:** `lib/guides.ts` (articles) and `lib/state-intros.ts` (state editorial) are data files.
- **Monitoring:** `.github/workflows/health-check.yml` runs `scripts/health-check.mjs` weekly.

## Project structure

```
app/
  page.tsx                      Home
  states/page.tsx               All states
  state/[code]/page.tsx         State hub (intro, cities, clubs, FAQ)
  cities/page.tsx               All indexable cities
  city/[state]/[city]/page.tsx  City listing
  clubs/[slug]/page.tsx         Club page (all prerendered)
  guides/                       Rider guides
  contact/, submit/             Forms (email only)
  api/contact/route.ts          The one API route
  sitemap.ts, robots.ts, ads.txt/route.ts
components/                     UI; AdSlot and AffiliateSection are the monetization pieces
lib/
  data.ts, images.ts, utils.ts  Data access and helpers
  ads.ts, affiliates.ts         Monetization config
  contact.ts, email.ts          Form validation and Resend sender
  guides.ts, state-intros.ts    Editorial content
data/                           JSON data files
scripts/                        Scrapers, image tooling, health check
tests/                          node:test suites run with tsx
```

## Development

Requires Node 22 and pnpm 10.

```bash
pnpm install
pnpm dev          # http://localhost:3000
pnpm test         # unit tests (tsx --test)
pnpm typecheck    # tsc --noEmit
pnpm lint:app     # eslint app components lib
pnpm build        # full static build, prerenders every page
```

## Environment variables

Set in Vercel → Project → Settings → Environment Variables.

| Variable | Required | Purpose |
|---|---|---|
| `NEXT_PUBLIC_ADSENSE_ID` | yes | AdSense publisher ID (digits, or `pub-…`). Enables the script tag and `/ads.txt`. |
| `NEXT_PUBLIC_AD_SLOT_INLINE` | for ads | Ad unit ID for in-content and in-feed placements. |
| `NEXT_PUBLIC_AD_SLOT_SIDEBAR` | for ads | Ad unit ID for the sticky sidebar placement. |
| `RESEND_API_KEY` | yes | Resend API key for form email. |
| `CONTACT_TO_EMAIL` | yes | Inbox that receives contact and submission email. |
| `CONTACT_FROM_EMAIL` | no | Sender address on a Resend-verified domain. Defaults to `onboarding@resend.dev`. |
| `NEXT_PUBLIC_AMAZON_AFFILIATE_TAG` | no | Amazon Associates tag. Defaults to the value in `lib/affiliates.ts`. |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | no | Google Analytics 4 measurement ID. |
| `NEXT_PUBLIC_SITE_URL` | no | Canonical origin. Defaults to `https://www.usmotorcycleclubs.com`. |

Ad placements render nothing in production until the publisher ID and the matching slot ID both exist.

## Updating data

Quarterly session, in order:

1. `pnpm scrape:all` (and the `scrape:riderclubs:all` / `scrape:ridersinfo:all` variants as needed), then review `git diff data/`.
2. `pnpm images:manifest` after adding photos under `public/images/clubs`.
3. Add guides to `lib/guides.ts` and refresh intros in `lib/state-intros.ts`.
4. `pnpm test && pnpm build`, commit, push. Vercel deploys from `main`.

See [MONETIZATION.md](MONETIZATION.md) for the operator checklist.

## Health check

`pnpm health` runs the same script the weekly workflow runs: it fetches `/ads.txt`, `/robots.txt`, `/sitemap.xml`, and twenty sample pages, and asserts status 200, canonical host, ad script presence, and a sitemap count within 10% of the previous run. Pass `SITE_URL=https://preview-url` to check a preview deployment and `EXPECT_AD_SCRIPT=false` when the preview has no AdSense ID.

## License

Unlicense. See [LICENSE](LICENSE).
```

Replace `MONETIZATION.md` entirely:

```markdown
# Monetization and operations checklist

Operator steps that cannot be done from the codebase. Work top to bottom once, then follow the quarterly and weekly sections.

## 1. Vercel

- **Plan:** the project is on Vercel Pro. Hobby prohibits commercial use, so this must stay Pro while ads run.
- **Web Analytics:** Project → Analytics → Enable.
- **Environment variables (Production):**
  - Keep: `NEXT_PUBLIC_ADSENSE_ID`, `NEXT_PUBLIC_GA_MEASUREMENT_ID`, `RESEND_API_KEY`.
  - Add: `CONTACT_TO_EMAIL` (the inbox that receives every form), `NEXT_PUBLIC_AD_SLOT_INLINE`, `NEXT_PUBLIC_AD_SLOT_SIDEBAR`.
  - Optional: `CONTACT_FROM_EMAIL` once a sending domain is verified in Resend; `NEXT_PUBLIC_AMAZON_AFFILIATE_TAG`.
  - Remove (no longer read by any code): every `AUTH_*`, `NEXTAUTH_URL`, `GOOGLE_CLIENT_*`, `DATABASE_URL`, `POSTGRES_*`, `SUPABASE_*`, `NEXT_PUBLIC_SUPABASE_*`, `NEXT_PUBLIC_AD_SLOT_BANNER`.
  - Redeploy after changing variables.
- **Integrations:** the "Instarank" integration provisioned the old Supabase database. Nothing reads it any more. Remove the integration from the project when convenient.

## 2. Resend

1. Confirm `CONTACT_TO_EMAIL` is the address that owns the Resend account, or verify a sending domain (Resend → Domains → Add `usmotorcycleclubs.com`, add the DNS records) and set `CONTACT_FROM_EMAIL` to an address on it, e.g. `US Motorcycle Clubs <forms@usmotorcycleclubs.com>`.
2. Test: submit `/contact` and `/submit` on production. Both emails should arrive within a minute with the sender's address in Reply-To.

## 3. Google AdSense

1. Publisher ID `pub-3750726644611991` is set as `NEXT_PUBLIC_ADSENSE_ID`.
2. **Sites:** `usmotorcycleclubs.com` listed and approved against the canonical host `www.usmotorcycleclubs.com`.
3. **ads.txt:** served at `/ads.txt`; AdSense should show *Authorized*.
4. **Ads → By ad unit → Display ads:** two responsive units, `inline` and `sidebar`. Put their `data-ad-slot` values in `NEXT_PUBLIC_AD_SLOT_INLINE` and `NEXT_PUBLIC_AD_SLOT_SIDEBAR`. Until both exist production renders no fixed ad containers.
5. **Auto ads:** on. The fixed units are in addition.
6. **Privacy & messaging:** GDPR and US state regulations messages published (Google's certified CMP, no code).

Fixed placements in the code:

| Placement | Where | Reserved height |
|---|---|---|
| `inline` | After the intro on state pages; after the second section on guide pages; in-feed every 12 cards on state and city grids | 250px |
| `sidebar` | Sticky on desktop, last block of the sidebar on guide, club, and city pages | 600px |

Home, `/states`, `/cities`, `/guides`, and `/search` carry no fixed units; Auto ads cover them.

## 4. Google Search Console

- Domain property `usmotorcycleclubs.com` verified; sitemap `https://www.usmotorcycleclubs.com/sitemap.xml` submitted.
- Email alerts left on.
- Removed routes (`/login`, `/register`, `/dashboard/*`, `/admin/*`, `/claim/*`, `/submit-club`) now 404 and were always `noindex` or disallowed; no redirects needed.

## 5. Amazon Associates

- Tag `usamotorcycle-20` lives in `lib/affiliates.ts`. Links are search URLs, no prices shown.
- Amazon closes accounts without a qualifying sale within 180 days of approval. Check the dashboard date each quarter.
- At roughly 20,000 monthly pageviews, add a gear retailer through Impact or AvantLink. Only `lib/affiliates.ts` changes.

## 6. Later ad networks (traffic gated)

| Network | Entry bar | Source |
|---|---|---|
| Raptive | 25,000 monthly pageviews, half from US/UK/CA/AU/NZ, domain 6+ months old, GA4 installed | https://help.raptive.com/hc/en-us/articles/360032840891 |
| Mediavine Journey | ~1,000 monthly sessions, Grow script installed 30 days | https://www.mediavine.com |

## 7. Weekly health check

`.github/workflows/health-check.yml` runs every Monday 13:17 UTC and on demand (Actions → Weekly health check → Run workflow). It checks `/ads.txt`, `/robots.txt`, `/sitemap.xml`, and twenty sample pages for status 200, canonical host, the AdSense script, and a sitemap count within 10% of the previous run.

- GitHub emails the workflow's author on failure by default. Confirm under GitHub → Settings → Notifications → Actions that "Only notify for failed workflows" is on.
- A failing count check after a deliberate data change is expected once; the next run uses the new baseline.
- Success criterion after launch: four consecutive green weeks.

## 8. Quarterly session

1. `pnpm scrape:all` and `pnpm images:manifest`; review the diff.
2. Add five to ten guides to `lib/guides.ts` (state route guides for the ten largest states, regional event calendars, gear guides tied to affiliate categories).
3. In Search Console, find pages losing clicks and refresh their intros in `lib/state-intros.ts`.
4. Confirm `/ads.txt`, the AdSense consent messages, and the Vercel plan are still correct.
5. `pnpm test && pnpm build`, commit, push.

## 9. Indexing rules

- Club pages are indexed and linked only when they score 3 or more on public detail (`MIN_CLUB_SCORE_FOR_INDEX` in `lib/data.ts`). Others are `noindex`, out of the sitemap, and listed as unlinked text.
- City pages are indexed only with two or more listed clubs.
- Non-club categories (dealers, venues, bars, churches) are never listed.
- Every state page carries an original intro plus data-driven counts and an FAQ.

## 10. Open items

- 340 image files in `public/images/clubs` belong to clubs no longer in `data/clubs.json`. Safe to delete after confirming with `pnpm images:manifest` output.
```

**Step 4: Run check to verify it passes**

Run: `grep -c "RESEND_API_KEY\|CONTACT_TO_EMAIL\|health-check" README.md MONETIZATION.md`
Expected: both counts greater than `0`

**Step 5: Commit**

```bash
git add README.md MONETIZATION.md
git commit -m "docs: README and MONETIZATION for the no-database site"
```

---

### Task 20: Full verification and push

**Files:**
- None new. Verification only.

**Step 1: Run the full suite**

```bash
pnpm test && pnpm typecheck && pnpm lint:app
```

Expected: all tests pass (`# fail 0`), tsc exits 0, eslint exits 0.

**Step 2: Production build**

```bash
pnpm build 2>&1 | tee /tmp/claude-0/-home-user-MotorcycleClubsUS/87b99445-e609-5e87-bf28-9786bb845f70/scratchpad/build.log | tail -60
```

Expected:
- Build succeeds.
- Route table shows `/clubs/[slug]` as a static (`●` SSG) route with no `ƒ` (dynamic) pages other than `/api/contact`.
- No "Missing Suspense boundary" error for `/contact`.

Confirm the club page count:

```bash
grep -o "/clubs/[^ ]*" /tmp/claude-0/-home-user-MotorcycleClubsUS/87b99445-e609-5e87-bf28-9786bb845f70/scratchpad/build.log | head -3
ls .next/server/app/clubs | grep -c "\.html$"
```

Expected: the second command prints `2102`.

**Step 3: Local smoke of the contact route**

```bash
RESEND_API_KEY=x CONTACT_TO_EMAIL=owner@example.com pnpm start &
sleep 5
curl -s -X POST http://localhost:3000/api/contact -H 'Content-Type: application/json' -d '{"name":"a","email":"a@b.co","subject":"s","message":"m","website":"bot"}'
curl -s -X POST http://localhost:3000/api/contact -H 'Content-Type: application/json' -d '{"name":"a","email":"bad","subject":"s","message":"m"}'
curl -s -o /dev/null -w '%{http_code}\n' http://localhost:3000/login
curl -s -o /dev/null -w '%{http_code}\n' http://localhost:3000/clubs/not-a-real-slug
kill %1
```

Expected, in order: `{"success":true}` (honeypot), `{"error":"Please enter a valid email"}`, `404`, `404`.

**Step 4: Confirm nothing references removed env vars or routes**

```bash
grep -rn "AUTH_\|NEXTAUTH\|DATABASE_URL\|SUPABASE\|AD_SLOT_BANNER" app components lib scripts --include=*.ts --include=*.tsx --include=*.mjs | wc -l
```

Expected: `0`

**Step 5: Push**

```bash
git status --short     # expect clean
git push origin main
```

After Vercel deploys: set `CONTACT_TO_EMAIL` and the two slot IDs in Vercel (section 1 of MONETIZATION.md), submit `/contact` once, confirm the email arrives, then trigger the health check workflow manually from the Actions tab.

---

## Task summary

| # | Task | Type |
|---|---|---|
| 1 | Test harness (`pnpm test` via `tsx --test`) | new |
| 2 | `lib/ads.ts` placements, reserved heights, in-feed helper | new + tests |
| 3 | `components/AdSlot.tsx` | new + tests |
| 4 | `lib/affiliates.ts`, AffiliateSection consumes it | new + tests |
| 5 | `lib/contact.ts` validation and correction prefill | new + tests |
| 6 | `lib/email.ts` Resend sender | new + tests |
| 7 | `POST /api/contact` emails instead of storing | rewrite + tests |
| 8 | Contact page prefill, copy | rewrite |
| 9 | Header without sessions | rewrite |
| 10 | Layout and footer: drop SessionProvider, newsletter | edit + delete |
| 11 | Club page: prerender all, correction link, sticky sidebar ad | rewrite + test |
| 12 | State page ad placements | edit |
| 13 | City page ad placements | edit |
| 14 | Guide page placements, remove banners, delete AdPlaceholder | edit + delete |
| 15 | Robots, about, privacy, terms, submit copy | edit |
| 16 | Delete auth/db routes, components, prisma, scripts, packages | delete |
| 17 | Health check library | new + tests |
| 18 | Health check runner and workflow | new |
| 19 | README and MONETIZATION.md | rewrite |
| 20 | Full verification, build, push | verify |

## Out of scope (by design)

- Vercel env-var deletion and Resend domain verification (operator steps, documented).
- Deleting the 340 orphaned club images.
- Any change to scrapers beyond removing the Prisma-dependent sync and image-download scripts.
- Raptive/Impact/AvantLink integrations (traffic gated).
