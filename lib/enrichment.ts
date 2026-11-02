import type { Club, ClubEnrichment, ClubDiscovery, EnrichmentField } from './types';
import { CLUB_KINDS, RIDING_ACTIVITIES } from './types';
import { applyReviewedLocation, isReviewedCity } from './club-geography';
import { getStateName } from './utils';

const discoveryFields = ['kind', 'activities', 'membershipEligibility', 'bikeRequirements', 'guestParticipation', 'contactUrl'];
const fields = ['description', 'website', 'phone', 'listingStatus', 'name', 'location', ...discoveryFields.map(field => `discovery.${field}`)];
const changeFields = ['description', 'website', 'phone', 'name', 'location', 'discovery'];
const object = (v: unknown): v is Record<string, unknown> => v !== null && typeof v === 'object' && !Array.isArray(v);
const text = (v: unknown): v is string => typeof v === 'string' && v.trim().length > 0;
function validUrl(v: unknown): boolean {
  if (!text(v)) return false;
  try {
    const url = new URL(v);
    return ['https:', 'http:'].includes(url.protocol) && !!url.hostname && !url.username && !url.password;
  } catch { return false; }
}
function validDate(v: unknown): v is string {
  if (typeof v !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(v)) return false;
  const date = new Date(`${v}T00:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === v && v <= new Date().toISOString().slice(0, 10);
}

// Resolve against original canonical rows, before approved names or locations change.
function resolveEnrichmentRecord(records: Club[], entry: Record<string, unknown>): { record?: Club; error?: string } {
  const guards = ['recordNamespace', 'expectedSlug', 'expectedState'];
  const supplied = guards.filter(key => Object.hasOwn(entry, key));
  if (supplied.length && supplied.length !== guards.length) return { error: 'recordNamespace, expectedSlug and expectedState must be supplied together' };
  if (supplied.length && (entry.recordNamespace !== 'clubs.json' || !text(entry.expectedSlug) || !text(entry.expectedState))) {
    return { error: 'identity guards require clubs.json namespace and nonempty exact slug and state' };
  }
  const byId = records.filter(record => record.place_id === entry.placeId);
  if (!byId.length) return { error: 'orphan placeId' };
  const matches = supplied.length ? byId.filter(record => record.slug === entry.expectedSlug && record.State === entry.expectedState) : byId;
  if (!matches.length) return { error: 'identity selectors do not match a canonical record' };
  if (matches.length !== 1) return { error: 'ambiguous record placeId' };
  if (matches[0].name !== entry.expectedName) return { error: 'expectedName does not match exactly' };
  return { record: matches[0] };
}

// Approved JSON is an external data boundary: inspect every shape before using it.
export function validateEnrichments(records: Club[], entries: unknown): string[] {
  const errors: string[] = [];
  if (!Array.isArray(entries)) return ['Approved enrichments must be an array'];
  const seen = new Set<Club>();
  entries.forEach((value: unknown, index) => {
    const fail = (message: string) => { errors.push(`Entry ${index}: ${message}`); };
    if (!object(value)) { fail('must be an object'); return; }
    const allowed = ['placeId', 'expectedName', 'recordNamespace', 'expectedSlug', 'expectedState', 'listingStatus', 'changes', 'evidence', 'verifiedAt', 'reviewNote'];
    for (const key of Object.keys(value)) if (!allowed.includes(key)) fail(`unsupported field ${key}`);
    for (const key of ['placeId', 'expectedName', 'reviewNote']) if (!text(value[key])) fail(`${key} must be a nonempty string`);
    const resolved = resolveEnrichmentRecord(records, value);
    if (resolved.error) fail(resolved.error);
    if (resolved.record) {
      if (seen.has(resolved.record)) fail('duplicate approved record target');
      seen.add(resolved.record);
    }
    if (!['confirmed-club', 'excluded'].includes(value.listingStatus as string)) fail('invalid listingStatus');
    if (!validDate(value.verifiedAt)) fail('verifiedAt must be a real, nonfuture YYYY-MM-DD date');
    const changes = object(value.changes) ? value.changes : {};
    if (!object(value.changes)) fail('changes must be an object');
    for (const [field, changed] of Object.entries(changes)) {
      if (!changeFields.includes(field)) fail(`unsupported change ${field}`);
      // An explicit blank website removes a corroborated unrelated or parked
      // domain. Omitted fields still preserve legacy data, and evidence is
      // required below for removals just as it is for replacements.
      if (field === 'website') {
        if (changed !== '' && !validUrl(changed)) fail('website must be an HTTP(S) URL without credentials, or an explicit empty string');
      } else if (field === 'location') {
        if (!object(changed)) { fail('location must be an object'); continue; }
        if (Object.keys(changed).some(key => !['city', 'state', 'address'].includes(key))) fail('unsupported location field');
        if (!text(changed.state) || !/^[a-z]{2}$/.test(changed.state) || getStateName(changed.state) === changed.state.toUpperCase()) fail('location state must be a known lowercase code');
        if (!text(changed.city) || !isReviewedCity(changed.city, String(changed.state))) fail('location city must be an actual city');
        if (changed.address !== undefined && !text(changed.address)) fail('location address must be nonempty when supplied');
      } else if (field === 'discovery') {
        if (!object(changed) || !Object.keys(changed).length) { fail('discovery must contain published facts'); continue; }
        for (const [key, fact] of Object.entries(changed)) {
          if (!discoveryFields.includes(key)) fail(`unsupported discovery field ${key}`);
          if (key === 'kind') { if (!(CLUB_KINDS as readonly unknown[]).includes(fact)) fail('invalid discovery kind'); }
          else if (key === 'activities') {
            if (!Array.isArray(fact) || !fact.length || fact.some(activity => !(RIDING_ACTIVITIES as readonly unknown[]).includes(activity)) || new Set(fact).size !== fact.length) fail('invalid discovery activities');
          } else if (key === 'contactUrl') { if (!validUrl(fact)) fail('discovery contactUrl must be safe HTTP(S)'); }
          else if (!text(fact)) fail(`discovery ${key} must be nonempty`);
        }
      } else if (!text(changed)) fail(`${field} must be a nonempty string`);
    }
    if (value.listingStatus === 'excluded' && Object.keys(changes).length) fail('excluded records must have empty changes');
    if (!Array.isArray(value.evidence)) { fail('evidence must be an array'); return; }
    for (const item of value.evidence) {
      if (!object(item)) { fail('evidence entry must be an object'); continue; }
      for (const key of Object.keys(item)) if (!['url', 'checkedAt', 'fields', 'factNotes'].includes(key)) fail(`unsupported evidence field ${key}`);
      if (!validUrl(item.url)) fail('evidence URL must be HTTP(S) without credentials');
      if (!validDate(item.checkedAt)) fail('checkedAt must be a real, nonfuture YYYY-MM-DD date');
      else if (validDate(value.verifiedAt) && item.checkedAt > value.verifiedAt) fail('checkedAt must not follow verifiedAt');
      if (!Array.isArray(item.fields) || !item.fields.length || item.fields.some(f => !fields.includes(f)) || new Set(item.fields).size !== item.fields.length) fail('evidence fields must be unique supported fields');
      if (!Array.isArray(item.factNotes) || !item.factNotes.length || item.factNotes.some(n => !text(n))) fail('factNotes must contain nonempty strings');
    }
    const changedFields = Object.keys(changes).filter(f => changeFields.includes(f)).flatMap(field => field === 'discovery'
      ? Object.keys(object(changes.discovery) ? changes.discovery : {}).map(key => `discovery.${key}`) : [field]);
    for (const field of ['listingStatus', ...changedFields]) {
      const supported = value.evidence.some(item => object(item) && Array.isArray(item.fields) && item.fields.includes(field) && Array.isArray(item.factNotes) && item.factNotes.every(text) && new Set(item.factNotes.map(n => (n as string).trim().toLowerCase())).size >= (field === 'description' ? 3 : 1));
      if (!supported) fail(`missing attributed evidence for ${field}${field === 'description' ? ' with three distinct factual notes' : ''}`);
    }
  });
  return errors;
}

export function applyApprovedEnrichments(records: Club[], entries: unknown): Club[] {
  const errors = validateEnrichments(records, entries);
  if (errors.length) throw new Error(`Invalid approved enrichments:\n${errors.join('\n')}`);
  // The complete runtime contract has passed; narrow only after validation.
  const validated = entries as ClubEnrichment[];
  const approved = new Map(validated.map(entry => [resolveEnrichmentRecord(records, { ...entry }).record!, entry]));
  return records.map(record => {
    let result = structuredClone(record);
    const entry = approved.get(record);
    // Discovery fields from an unreviewed import are never approved facts.
    delete result.discovery;
    if (entry) {
      const { location, discovery, ...changes } = structuredClone(entry.changes);
      Object.assign(result, changes, { editorial: structuredClone(entry) });
      if (location) result = applyReviewedLocation(result, location);
      if (discovery) result.discovery = discovery;
    }
    return result;
  });
}

// Recheck provenance at public boundaries in case effective data changes after review.
export function approvedDiscoveryFacts(club: Club): ClubDiscovery {
  const result: Record<string, unknown> = {};
  const review = club.editorial;
  if (review?.listingStatus !== 'confirmed-club' || !club.discovery) return result;
  for (const key of discoveryFields as (keyof ClubDiscovery)[]) {
    const fact = club.discovery[key];
    if (fact !== undefined && JSON.stringify(fact) === JSON.stringify(review.changes.discovery?.[key])
      && review.evidence.some(source => source.fields.includes(`discovery.${key}` as EnrichmentField))) result[key] = structuredClone(fact);
  }
  return result as ClubDiscovery;
}
