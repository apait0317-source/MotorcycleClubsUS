# Bay Area pilot measurement baseline

Captured November 2, 2026 at 01:38:18 UTC, before publication of the Bay Area discovery pilot. This records available evidence and the measurement gaps. It does not establish search growth, AdSense approval or earnings.

## Available traffic evidence

Vercel Web Analytics was newly installed on the existing production site. The requested reporting window was October 5, 2026 at 01:38:18 UTC through November 2, 2026 at 01:38:18 UTC. The API rounded path/referrer queries to October 5 at 01:00 through November 2 at 02:00 UTC. Its daily query used calendar-day buckets through November 3 at 00:00 UTC.

The report contains six pageviews and two visitors in the November 2 UTC bucket. Earlier empty buckets do not establish that the site had no traffic before tracking was installed. This is an instrumentation starting point, not a usable 28-day performance history.

| Recorded path | Pageviews |
| --- | ---: |
| `/` | 1 |
| `/clubs/american-gold-wing-association-winter-haven-fl` | 1 |
| `/search` | 1 |
| `/state/nc` | 1 |
| `/state/oh` | 1 |
| `/states` | 1 |

The referrer report contains one pageview attributed to `bing.com` and five without a referrer hostname. An empty referrer does not distinguish direct visits, privacy restrictions, applications or unrecognized assistants. The sample cannot support a search trend or an estimate of assistant traffic. No pilot path appears in the returned path report.

These reports count Vercel pageviews. The pilot's `club_profile_open`, `club_official_contact`, `club_filter_change` and `club_filter_empty` events are sent through the existing GA4 integration; Vercel event reports are not a substitute for those GA4 events.

## Missing account evidence

| Source | Needed baseline | Current evidence |
| --- | --- | --- |
| Search Console | Page/query clicks, impressions, CTR, position, indexing and canonical status for pilot URLs | No connected reporting access; unavailable, not zero |
| GA4 | Pilot landing sessions, source/medium, recognizable assistant referrers and the four club events | Event implementation verified locally; no connected property reports or verified production delivery |
| AdSense | Approval status, ad pageviews, revenue and observed page RPM | Approval pending and no revenue, as reported in the project brief; account status and earnings not independently accessed |
| Vercel Web Analytics | Recorded pageviews by path, date and referrer | Six pageviews in newly installed tracking; insufficient history |

Google AI search exposure is assessed through Search Console Web reporting and useful, attributable page content. This baseline has no separate Google AI Overviews or AI Mode segment. Recognizable assistant referrers can be tracked where reported; unattributed visits remain unknown. No ranking or assistant-citation gain is claimed.

## Published cohort to evaluate

Use `sf-bay-area` in `data/market-pilots.json` as the stable original cohort. At initial publication it included six reviewed canonical organizations across five municipalities, with five actionable membership/contact routes. Four aliases consolidated duplicate imports through permanent redirects, and fourteen of the 23 original records remained held from the comparison. Keep that publication snapshot separate from later content changes and traffic growth. The [November 2 location follow-up](2026-11-02-bay-area-location-followup.md) records the subsequent resolution of two holds.

Evaluate the regional guide `/guides/motorcycle-clubs-san-francisco-bay-area`, the California comparison, Campbell's comparison and the six canonical club profiles. Preserve historical slugs, including corrected-location profiles; group aliases with their canonical destination rather than counting them as new organizations.

## Review dates and decisions

Use November 2, 2026 UTC as the publication-day cohort anchor, subject to successful production verification. Retain complete exports and use comparable completed-day windows with the same property timezone. Exclude release QA where identifiable; browser verification blocks tracking and ad delivery.

| Review | Date | Decision supported |
| --- | --- | --- |
| Day 28 | November 30, 2026 | Check discovery/indexing, page/query demand and whether production events are arriving |
| Day 56 | December 28, 2026 | Compare a second 28-day period, qualified visits and club-contact intent; identify specific content gaps |
| Day 84 | January 25, 2027 | Compare a third period, actual upkeep effort and any available revenue before expanding markets |

At each review, record organic clicks and impressions by pilot page/query, landing sessions by source/medium, recognizable assistant referrals and sessions with an official-contact event. Divide sessions with an official-contact event by the corresponding pilot landing sessions only when the same scope and period can be established. A click indicates an attempted next step, not confirmed membership, a lead received or revenue. Report filter empty states with their controlled type/activity values as hints for research, not evidence that an unlisted club offers an activity.

After AdSense approval, calculate revenue using `AdSense pageviews / 1,000 × observed page RPM`. Use AdSense's own denominator and a comparable geography/device/period. No RPM or revenue forecast is supported by this baseline.

Expand to another market only when sources support identity and useful facts, observed demand supports the work, and measured maintenance fits the quarterly budget. Until the missing account reports are available, the next useful work is measurement verification and reconciliation of supported content gaps. No automated reminders, account settings, ad density or outreach were changed for this baseline.

## Evidence

The captured Vercel path, referrer and daily responses are retained in ignored `work/market-depth/` as `baseline-requestPath.json`, `baseline-referrerHostname.json` and `baseline-day.json`, with their requested window in `baseline-window.json`. The implementation and research outcomes are in [the pilot report](2026-11-01-market-depth-pilot.md). Release readiness must be established separately against the merged tree and the live production deployment.
