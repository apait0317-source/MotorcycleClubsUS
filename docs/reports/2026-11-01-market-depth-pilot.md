# Bay Area club discovery pilot

The pilot researches 23 existing records across six stored California city buckets. The approved scope includes cross-cohort matching where needed to select a correct existing entity. This is a local implementation report; production release and performance results are separate.

## Research outcomes

Five cohort records receive supported profiles or updated facts. Four duplicate imports resolve to canonical profiles. Fourteen records remain held from the new comparison. The resulting pilot contains six distinct reviewed organizations in five municipalities because the San Jose Dons canonical profile was outside the cohort, incorrectly filed under Puerto Rico.

The regional-guide gate passes: six distinct organizations, five municipalities, and five entries with supported activity or membership facts plus an official contact route. Rip City Riders has a sourced contact route and event-access information but no inferred riding-activity tag.

Ghostriders and Timekeepers use Campbell as their published meeting location, with that scope stated in their descriptions. It is not a claim that their pizza-restaurant meeting venue is a club-owned clubhouse or the whole riding area. Oakland Motorcycle Club moves from its imported San Francisco label to its official Oakland address. San Jose Dons moves from Puerto Rico to its official San Jose address. Historical profile slugs remain stable.

The extraction fragment for the Norton club is renamed to Northern California Norton Owners Club, with its official website. A rotating regional meeting program is not assigned an invented current city, so this record stays basic and held. Marin County Motorcycle Association retains its prior reviewed summary and remains outside the pilot comparison until geography is reconciled. A failed source never establishes closure.

| Original record | Outcome | Reason |
| --- | --- | --- |
| Hells Angels MC - Daly City | Held / unresolved | Official roster establishes charter/locality, not sufficient local activity or membership detail. |
| Rip City Riders Motorcycle Club | Duplicate resolved | Permanent redirect to rip-city-riders-clubhouse-petaluma-ca |
| Hells Angels MC - Oakland | Held / unresolved | Official roster establishes charter/locality, not sufficient local activity or membership detail. |
| Oakland Motorcycle Club | Duplicate resolved | Permanent redirect to oakland-motorcycle-club-inc-san-francisco-ca |
| Rip City Riders Clubhouse | Supported profile | Official sources support visible facts and reviewed location. |
| 4 Horsemen MC Bay Area | Held / unresolved | Official-looking social lead is unavailable to retrieval; no verified city-specific source. |
| Golden Gate BMW Riders | Held / unresolved | Search returned a BMW car-club namesake; motorcycle identity remains unresolved. |
| It was the first American branch of the Norton Owners Club | Held / unresolved | Official source identifies Northern California Norton Owners Club; name/website corrected. Meetings rotate and a current fixed city was not established. |
| Mongols MC - Old South Bay | Held / unresolved | Official roster names California, not this city/chapter identity. Regional name is not a city. |
| North Bay Motorcycle Club | Held / unresolved | Retrieved official-domain pages do not reconcile the stored San Francisco label with the Fulton address and second Sebastopol import. |
| Oakland Motorcycle Club Inc | Supported profile | Official sources support visible facts and reviewed location. |
| San Francisco Cobras | Held / unresolved | Social retrieval unsupported; search excerpts are insufficient publication evidence. |
| San Francisco Motorcycle Club | Duplicate resolved | Permanent redirect to sfmc-san-francisco-ca |
| Sfmc | Supported profile | Official sources support visible facts and reviewed location. |
| Unlike a Motorcycle Club | Held / unresolved | Imported title is a description fragment. Directory search excerpts do not establish a specific official entity. |
| Ghostriders MC | Supported profile | Official sources support visible facts and reviewed location. |
| Hells Angels MC - San Jose | Held / unresolved | Official roster establishes charter/locality, not sufficient local activity or membership detail. |
| San Jose Dons MC | Duplicate resolved | Permanent redirect to san-jose-dons-motorcycle-club-san-juan-pr |
| Timekeepers Motorcycle Club | Supported profile | Official sources support visible facts and reviewed location. |
| Top Hatters MC Clubhouse | Held / unresolved | Official-looking chapter social source is unsupported; no retrieved source establishes useful profile facts. |
| Vagos MC - San Jose | Held / unresolved | Existing sourced chapter hub retains locality coverage; retrieved map alone does not establish sufficient original local profile facts. Homepage contains unrelated injected commerce copy. |
| Marin County Motorcycle Association | Held / unresolved | Official homepage establishes private events and member contact, but does not resolve the imported city/current club location. Existing reviewed summary retained; held from pilot comparison. |
| The Motor Cycle Club Cafe | Held / unresolved | Raw address is in Pontevedra, Spain. Corroborating third-party search results are not the authoritative identity source required for a new exclusion. |

## Sources and maintenance

Field-attributed approval evidence is in `data/club-enrichment.json`; reviewed duplicate evidence is in `data/club-aliases.json`. `data/market-pilots.json` retains the fixed original cohort and explicit holds. Raw records, ratings, reviews, photos and original IDs are unchanged. No new source baseline hash was invented from Firecrawl Markdown; monitoring reports new URLs as needing a separately reviewed HTML baseline. The existing monthly workflow now includes alias sources.

Official sources used for the six comparison entities include:

- Rip City Riders: https://ripcityriders.org/rcr/ and https://ripcityriders.org/contact/
- Oakland Motorcycle Club: https://oaklandmc.org/about and https://oaklandmc.org/schedule-a-visit
- San Francisco Motorcycle Club: https://www.sf-mc.org/faq and https://www.sf-mc.org/find-us
- San Jose Dons: https://www.sanjosedonsmc.com/about-1 and https://www.sanjosedonsmc.com/contactus
- Ghostriders: https://www.ghostridersmc.net/ and https://www.ghostridersmc.net/membership
- Timekeepers: https://timekeepersmc.com/ , https://timekeepersmc.com/about/ and https://timekeepersmc.com/contact/

The elapsed research-and-implementation window from the first retained source capture to this outcome ledger is 8.6 minutes. It includes interleaved coding and validation, so it is not an active-research-only duration or a per-profile capacity estimate. Source attempts, captures and unresolved reasons are retained under ignored `work/market-depth/`.

## Verification and measurement

The final implementation passes 232 tests through the normal `pnpm test` command, TypeScript checks, application lint and production build using Node 22.23.4 and pnpm 10.28.0. The build prerenders 3,444 pages. A generated-output check scans 32,210 public HTML/RSC/text/body and client JavaScript files with no internal review fields found. Server-only implementation bundles are excluded from that public scan. Independent review reproduced a JSON-LD script-escaping vulnerability and identified a lost SFMC seasonal qualification. Both are fixed as described below. No Search Console, GA4 or AdSense account data was accessed. Organic traffic, assistant referrals, actual ad approval and revenue remain unmeasured. The first post-release review compares 28-day periods; repeat at 56 and 84 days. Missing access is not zero performance.


## Production-build browser evidence

Chromium checks against the local production server confirm the six-row initial comparison, all six rows without JavaScript, two off-road filter results, keyboard selection of four MC results, combined empty state, reset, mobile table scrolling without page overflow, and zero page errors. The regional guide links through a canonical profile to its official membership/contact anchor. Two representative historical URLs return HTTP 308, including the San Jose Dons redirect to the corrected canonical profile outside the original cohort.

A development-only fake measurement ID and local sink verify exact filter change/empty/reset events, profile navigation and official-contact actions, with no event on mount. All external browser requests were blocked. Missing and throwing analytics do not interrupt filtering or navigation. The final production build contains no test measurement ID configured by this task. No actual GA4 delivery, ad request, message or contact form submission was used for these checks.

The generated sitemap changes from 122 to 124 URLs. The four alias URLs are excluded; reviewed geography and city eligibility explain the remaining population changes. No production health baseline was reset. Raw club/city/state/image files are unchanged.

## Implementation choices

- Work stays on the provided `work` branch, as required by repository guidance and the approved release boundary. Production remains separate.
- Published skill helper scripts were unavailable; equivalent task briefs, BASEs, logs and ledger records were maintained manually.
- Sandbox subprocess isolation initially reported only file-level test results. Intermediate checks used Node 22 with test isolation disabled to execute all registered assertions. Final `pnpm test` with the required execution permissions ran all 229 tests normally.
- Research effort is the actual elapsed capture-to-outcome window including interleaved implementation, not active-only minutes per profile. Quarterly research capacity remains unproven.


## Independent review and fix verification

The independent reviewer ran the original 229-test suite, checked public-output privacy and all four redirect rules, and requested a JSON-LD escaping fix before integration. The SFMC seasonal qualification was also restored because a first-time guest outside the official ride season needs that distinction.

Three reproducing assertions failed before the fixes: an approved name could create an executable script element, an article title could do the same, and the SFMC guest field omitted the published ride season. The shared JSON-LD serializer now escapes HTML script delimiters while preserving JSON round trips. Both schema and article script emitters use it. The guest field now distinguishes official March–October rides from unofficial year-round rides.

After this single fix pass, all 232 tests, TypeScript checks, application lint, the fresh production build and the 32,210-file public-output checker pass. The production-browser flow was rerun successfully after rebuilding. No Important or Critical review issue remains unresolved; no Minor finding is deferred. This is fix verification by reproducing tests and the full suite, not a claim of a second independent review.
