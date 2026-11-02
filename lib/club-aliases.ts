import type { Club } from './types';

export interface ClubAlias {
  aliasSlug: string;
  canonicalSlug: string;
  sources: { url: string; checkedAt: string }[];
  reviewNote: string;
}

export function validateClubAliases(records: Club[], entries: unknown): string[] {
  if (!Array.isArray(entries)) return ['Club aliases must be an array'];
  const errors: string[] = [];
  const bySlug = new Map(records.map(club => [club.slug, club]));
  const aliases = new Set<string>();
  const object = (value: unknown): value is Record<string, unknown> => value !== null && typeof value === 'object' && !Array.isArray(value);
  for (const entry of entries) {
    if (!object(entry)) { errors.push('Alias must be an object'); continue; }
    if (Object.keys(entry).some(key => !['aliasSlug', 'canonicalSlug', 'sources', 'reviewNote'].includes(key))) errors.push('Unsupported alias field');
    for (const key of ['aliasSlug', 'canonicalSlug']) {
      if (typeof entry[key] !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(entry[key] as string) || !bySlug.has(entry[key] as string)) errors.push(`Invalid alias ${key}`);
    }
    if (entry.aliasSlug === entry.canonicalSlug) errors.push('Alias cannot target itself');
    if (aliases.has(entry.aliasSlug as string)) errors.push('Duplicate alias');
    aliases.add(entry.aliasSlug as string);
    const target = bySlug.get(entry.canonicalSlug as string);
    if (!target?.editorial || target.editorial.listingStatus !== 'confirmed-club'
      || !target.editorial.changes.description?.trim() || target.editorial.changes.description !== target.description
      || !target.editorial.evidence.some(source => source.fields.includes('description'))) errors.push('Alias target must have a source-reviewed description');
    if (typeof entry.reviewNote !== 'string' || !entry.reviewNote.trim()) errors.push('Alias needs a review note');
    if (!Array.isArray(entry.sources) || !entry.sources.length) errors.push('Alias needs reviewed sources');
    else for (const source of entry.sources) {
      if (!object(source)) { errors.push('Alias source must be an object'); continue; }
      try {
        const url = new URL(String(source.url));
        if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) throw new Error();
      } catch { errors.push('Alias source must be safe HTTP(S)'); }
      const date = String(source.checkedAt);
      const parsed = new Date(`${date}T00:00:00Z`);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== date || date > new Date().toISOString().slice(0, 10)) errors.push('Alias source needs a real nonfuture date');
    }
  }
  for (const entry of entries) if (object(entry) && aliases.has(entry.canonicalSlug as string)) errors.push('Alias chains and cycles are not supported');
  return errors;
}

export function resolveClubSlug(slug: string, aliases: readonly ClubAlias[]): string {
  return aliases.find(alias => alias.aliasSlug === slug)?.canonicalSlug ?? slug;
}

export function buildAliasRedirects(aliases: readonly ClubAlias[]): { source: string; destination: string; permanent: true }[] {
  return aliases.map(alias => ({ source: `/clubs/${alias.aliasSlug}`, destination: `/clubs/${alias.canonicalSlug}`, permanent: true }));
}
