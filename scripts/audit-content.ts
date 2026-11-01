import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { auditContent } from '../lib/content-audit';
import { getAllClubs } from '../lib/data';

const report = auditContent(getAllClubs());
const directory = resolve('.content-reports');
mkdirSync(directory, { recursive: true });
writeFileSync(resolve(directory, 'content-audit.json'), `${JSON.stringify(report, null, 2)}\n`);
const columns = ['placeId', 'expectedName', 'slug', 'state', 'score', 'descriptionPoints', 'website', 'missingFields', 'potentialScoreAfterDescription'] as const;
const csvCell = (value: unknown) => `"${String(Array.isArray(value) ? value.join(';') : value).replaceAll('"', '""')}"`;
writeFileSync(resolve(directory, 'content-candidates.csv'), [
  columns.join(','), ...report.candidates.map(row => columns.map(key => csvCell(row[key])).join(',')),
].join('\n') + '\n');
const { records, candidates, ...summary } = report;
console.log(JSON.stringify({ ...summary, candidateCount: candidates.length, reports: directory }, null, 2));
