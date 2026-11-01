import { readFileSync, mkdirSync, writeFileSync, appendFileSync } from 'node:fs';
import { sourceReportEntry, observeSource, type SourceBaseline, type SourceReportEntry } from '../lib/source-check';
import { canonicalClubRecords } from '../lib/canonical-clubs';
import { validateEnrichments } from '../lib/enrichment';
import type { Club, ClubEnrichment } from '../lib/types';

const read = (path: string): unknown => JSON.parse(readFileSync(path, 'utf8'));
function validUrl(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  try { const url = new URL(value); return ['http:', 'https:'].includes(url.protocol) && !url.username && !url.password; } catch { return false; }
}
async function main() {
  const approved = read('data/club-enrichment.json');
  const errors = validateEnrichments(canonicalClubRecords(read('data/clubs.json') as Club[]), approved);
  if (errors.length) throw new Error(errors.join('\n'));
  const input = read('data/content-source-baselines.json');
  if (!Array.isArray(input)) throw new Error('Baselines must be an array');
  const seen = new Set<string>();
  for (const value of input) {
    if (!value || typeof value !== 'object' || Object.keys(value).some(key => !['url', 'reviewedAt', 'contentHash'].includes(key)) || !validUrl(value.url) || typeof value.reviewedAt !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value.reviewedAt) || !Number.isFinite(Date.parse(value.reviewedAt)) || new Date(value.reviewedAt).toISOString().slice(0,10) !== value.reviewedAt || value.reviewedAt > new Date().toISOString().slice(0,10) || typeof value.contentHash !== 'string' || !/^[a-f0-9]{64}$/.test(value.contentHash) || seen.has(value.url)) throw new Error('Invalid or duplicate source baseline');
    seen.add(value.url);
  }
  const baselines = new Map((input as SourceBaseline[]).map(value => [value.url, value]));
  const urls = [...new Set((approved as ClubEnrichment[]).flatMap(entry => entry.evidence.map(evidence => evidence.url)))].sort();
  const entries: SourceReportEntry[] = [];
  // Global sequential requests also guarantee sequential requests per host.
  for (const url of urls) {
    const observation = await observeSource(url);
    const baseline = baselines.get(url);
    entries.push(sourceReportEntry(baseline, observation));
  }
  mkdirSync('.content-reports', { recursive: true });
  writeFileSync('.content-reports/source-check.json', JSON.stringify({ checkedAt: new Date().toISOString(), note: 'Review hints only. No approved evidence, dates, descriptions, scores, or club statuses were updated. Proposed hashes require manual review.', entries }, null, 2) + '\n');
  const columns = ['url', 'checkedAt', 'status', 'finalUrl', 'contentHash', 'state', 'baselineMissing', 'reason', 'error'] as const;
  const csv = (value: unknown) => '"' + String(value ?? '').replace(/"/g, '""') + '"';
  writeFileSync('.content-reports/source-check.csv', [columns.join(','), ...entries.map(entry => columns.map(key => csv(entry[key as keyof typeof entry])).join(','))].join('\n') + '\n');
  const summary = `# Monthly source review\n\nChecked ${entries.length} distinct approved evidence URLs.\n\n${['unchanged', 'changed', 'redirected', 'unavailable', 'needs-baseline'].map(state => `- ${state}: ${entries.filter(entry => entry.state === state).length}`).join('\n')}\n\nAccess failures do not establish closure. Review JSON/CSV manually during the quarterly session. No approved data was updated.\n`;
  writeFileSync('.content-reports/summary.md', summary);
  if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, summary);
  console.log(summary);
}
main().catch(error => { console.error(error); process.exitCode = 1; });
