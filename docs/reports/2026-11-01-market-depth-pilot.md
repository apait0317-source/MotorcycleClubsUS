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

At the research boundary, all 216 tests and TypeScript checks pass. Final browser, build, public-artifact and whole-branch review results will be appended after implementation. No Search Console, GA4 or AdSense account data was accessed. Organic traffic, assistant referrals, actual ad approval and revenue remain unmeasured. The first post-release review compares 28-day periods; repeat at 56 and 84 days. Missing access is not zero performance.
