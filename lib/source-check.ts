import { createHash } from 'node:crypto';
import { load } from 'cheerio';

export type SourceBaseline = { url: string; reviewedAt: string; contentHash: string };
export type SourceObservation = { url: string; checkedAt: string; status: number | null; finalUrl?: string; contentHash?: string; error?: string };
export function compareSource(baseline: SourceBaseline, observation: SourceObservation): { state: 'unchanged' | 'changed' | 'redirected' | 'unavailable'; reason: string } {
  if (observation.error || observation.status === null || observation.status < 200 || observation.status >= 300 || !observation.contentHash) return { state: 'unavailable', reason: observation.error || `HTTP ${observation.status}; no club status conclusion` };
  if (observation.finalUrl && observation.finalUrl !== baseline.url) return { state: 'redirected', reason: 'Final URL differs; manual review required' };
  return observation.contentHash === baseline.contentHash ? { state: 'unchanged', reason: 'Normalized text hash matches' } : { state: 'changed', reason: 'Text hash differs; review hint only, not proof a club fact changed' };
}
// Prefer the first main element; fall back to body for pages without main.
// Remove navigation and non-content elements before collapsing whitespace.
export function normalizeSourceHtml(html: string): string {
  const $ = load(html);
  $('script, style, nav, noscript, template').remove();
  return ($('main').length ? $('main').first() : $('body')).text().replace(/\s+/g, ' ').trim();
}
export function hashSourceHtml(html: string): string {
  const normalized = normalizeSourceHtml(html);
  if (/just a moment|verify (?:that )?you are human|checking your browser|enable javascript and cookies to continue|attention required.*cloudflare/i.test(normalized)) throw new Error('Possible access challenge; manual review required');
  if (!normalized) throw new Error('No normalized source text');
  return createHash('sha256').update(normalized).digest('hex');
}
export async function observeSource(url: string, options: { fetcher?: typeof fetch; timeoutMs?: number; maxBytes?: number } = {}): Promise<SourceObservation> {
  const observation: SourceObservation = { url, checkedAt: new Date().toISOString(), status: null };
  const controller = new AbortController();
  let timer: ReturnType<typeof setTimeout> | undefined;
  let reader: ReadableStreamDefaultReader<Uint8Array> | undefined;
  const deadline = new Promise<never>((_, reject) => { timer = setTimeout(() => { controller.abort(); reject(new Error('Source timeout')); }, options.timeoutMs ?? 15_000); });
  try {
    return await Promise.race([deadline, (async () => {
      const response = await (options.fetcher ?? fetch)(url, { signal: controller.signal, redirect: 'follow', headers: { 'User-Agent': 'USMotorcycleClubs-SourceReview/1.0' } });
      observation.status = response.status;
      observation.finalUrl = response.url || url;
      if (!response.ok) { await response.body?.cancel(); return observation; }
      const maxBytes = options.maxBytes ?? 2 * 1024 * 1024;
      if (Number(response.headers.get('content-length')) > maxBytes) throw new Error('Response exceeds byte limit');
      if (!response.body) throw new Error('Missing response body');
      reader = response.body.getReader();
      const chunks: Uint8Array[] = []; let size = 0;
      while (true) {
        const chunk = await reader.read();
        if (chunk.done) break;
        size += chunk.value.byteLength;
        if (size > maxBytes) throw new Error('Response exceeds byte limit');
        chunks.push(chunk.value);
      }
      observation.contentHash = hashSourceHtml(Buffer.concat(chunks).toString('utf8'));
      return observation;
    })()]);
  } catch (error) {
    observation.error = error instanceof Error ? error.message : String(error);
    delete observation.contentHash;
    controller.abort();
    void reader?.cancel().catch(() => {});
    return observation;
  } finally { clearTimeout(timer); }
}

export type SourceReportEntry = SourceObservation & {
  state: 'unchanged' | 'changed' | 'redirected' | 'unavailable' | 'needs-baseline';
  reason: string;
  baselineMissing: boolean;
  reviewedAt?: string;
  proposedBaseline?: { url: string; contentHash: string };
};
export function sourceReportEntry(baseline: SourceBaseline | undefined, observation: SourceObservation): SourceReportEntry {
  if (baseline) return { ...observation, ...compareSource(baseline, observation), baselineMissing: false, reviewedAt: baseline.reviewedAt };
  const availability = compareSource({ url: observation.url, reviewedAt: '', contentHash: '' }, observation);
  if (availability.state === 'unavailable') return { ...observation, ...availability, baselineMissing: true };
  return { ...observation, state: 'needs-baseline', reason: 'New recorded source requires a manually reviewed baseline', baselineMissing: true, proposedBaseline: { url: observation.url, contentHash: observation.contentHash! } };
}
