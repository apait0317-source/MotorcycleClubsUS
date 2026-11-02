# Pilot source monitoring baselines

Eleven existing Bay Area source URLs now have manually reviewed direct-HTML baselines. All 62 earlier baseline entries are preserved, bringing the recorded total to 73. A separate later fetch of each addition returned HTTP 200, the expected final URL and the same normalized text hash.

## Reviewed additions

| Organization | Source pages |
| --- | --- |
| North Bay Motorcycle Club | [Clubhouse and contact](https://northbaymc.org/the-clubhouse/) |
| Oakland Motorcycle Club | [Schedule a visit](https://oaklandmc.org/schedule-a-visit) |
| Timekeepers Motorcycle Club | [Meeting location](https://timekeepersmc.com/), [club history](https://timekeepersmc.com/about/), [contact](https://timekeepersmc.com/contact/) |
| Ghostriders MC | [Club and meeting information](https://www.ghostridersmc.net/), [membership](https://www.ghostridersmc.net/membership) |
| San Jose Dons | [Membership FAQ](https://www.sanjosedonsmc.com/about-1), [contact and address](https://www.sanjosedonsmc.com/contactus) |
| San Francisco Motorcycle Club | [Membership and guest FAQ](https://www.sf-mc.org/faq), [location and contact](https://www.sf-mc.org/find-us) |

Review occurred November 2, 2026. The monitor's normalized text contains the attributed material, including the Campbell meeting locations, Fulton/Oakland contact locations, Dons requirements and SFMC's March–October official ride season. The hashes come from the existing native observation and HTML-normalization functions, not Firecrawl Markdown or a browser-rendered substitute. Existing public facts, evidence dates and profile review dates are unchanged.

## Manual exceptions

Marin County Motorcycle Association's [membership page](https://mcmadirt.com/become-a-member) returned HTTP 200, but the monitor saw only a 141-character site shell/footer. It did not receive the membership policy. No new baseline is approved for that response; review the rendered policy manually during the quarterly session. Individual waitlist names were neither inspected nor retained for this task.

Rip City Riders' [contact page](https://ripcityriders.org/contact/) returned HTTP 202 with no normalized source text. It also remains unbaselined and needs a manual availability check. This response does not establish closure, an invalid contact route or a changed organization fact.

The eight-profile pilot has recorded baselines for 17 of its 19 distinct evidence URLs after this pass. This measures configuration coverage, not complete monitoring of every fact. A source hash may change because of navigation, historical text or other page content. A matching hash cannot establish correctness, current availability of an activity, or unchanged content that the fetcher did not receive.

## Monthly and quarterly operation

The existing [GitHub workflow](https://github.com/apait0317-source/MotorcycleClubsUS/actions/workflows/content-source-check.yml) was verified active at the pre-release check on November 2, 2026, with no recorded runs at that time. It runs on day 1 at 13:23 UTC, supports manual dispatch, uses read-only repository contents permission and retains report artifacts for 90 days. The next configured date is December 1, 2026.

The first hosted manual run, `41383171293`, completed 162 observations: 72 unchanged, one changed, none redirected, 17 unavailable and 72 needing a baseline. Its upload step was marked successful but saved no artifact: the upload action excluded the hidden `.content-reports/` directory and only warned about missing files. The workflow now explicitly allows hidden files for only `source-check.json`, `source-check.csv` and `summary.md`, and fails when no files are found. Confirm the actual downloadable artifact and its three files when validating a run; a green upload step alone is insufficient. This retains no other hidden files or research captures.

During the quarterly session, review the JSON/CSV report, inspect changed or unavailable sources and revisit both manual exceptions. Update a published fact only after editorial review. Monitoring does not rewrite descriptions, classification, dates, scores or source approval. The README now reflects the already approved name, coherent-location and discovery-field editing rules.

## Validation and limits

All 245 tests, TypeScript checks, application lint and a fresh production build pass. A file check confirms valid unique URLs/dates/SHA256 values and preserves the original 62 entries. All eleven additions match separate later native observations. The change adds no application behavior or new market and changes no raw records, prose, public review dates, indexing or ad gates.

Independent review found no Critical, Important or Minor issue. It checked the eleven editorial source matches, dates, unchanged earlier entries, exact hashes recomputed from retained normalized text and later replay timestamps. It did not refetch live sources, inspect waitlist content, judge future stability or establish hosted workflow/deployment success. The capture script's use of native observation/normalization was inspected; original raw responses were not retained. Runtime proxy configuration was needed only for this execution environment.

Release verification exposed the Important artifact-retention defect described above. The empty first-run artifact listing and the upload warning reproduce it. The fix follows the upload action's documented hidden-file and missing-file inputs, with paths restricted to the three reports. Hosted rerun and archive inspection are the integration check for this fix; source observations remain review hints and do not change facts.

Research observations, names-free review text and replay evidence are retained under ignored `work/market-depth/source-baselines/`. No traffic, ranking, AdSense approval or revenue improvement is inferred from this maintenance work.
