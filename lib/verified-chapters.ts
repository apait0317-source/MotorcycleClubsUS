import registry from '@/data/verified-chapters.json';
import { CHAPTER_ORGS } from './chapter-orgs';
import { getAllStates, getClubBySlug, isListableClub } from './data';
import type { Club } from './types';

export interface ChapterSource {
  url: string;
  /** Actual date the cited page was reviewed, never a publication date. */
  checkedAt: string;
  /** Editorial context, retained for review rather than printed on the hub. */
  notes: string;
}

export interface VerifiedChapter {
  id: string;
  name: string;
  city: string;
  /** Lowercase US state code. A regional label is not a city. */
  state: string;
  website?: string;
  sourceUrl: string;
  /** What the source establishes, retained for editorial review. */
  evidence: string;
  address?: string;
  /** An actual public Maps listing; never generated from the chapter name. */
  mapsUrl?: string;
  /** Explicit editorial match, never inferred from a similar club name. */
  existingClubSlug?: string;
}

export interface VerifiedChapterOrg {
  /** Namesake organizations must have separate slugs and sources. */
  slug: string;
  name: string;
  short: string;
  website?: string;
  about: string[];
  sources: ChapterSource[];
  coverageNotes: string[];
  chapters: VerifiedChapter[];
  /** A state named by a source without a defensible city location. */
  stateCoverage?: { state: string; sourceUrl: string; evidence: string }[];
}

const object = (value: unknown): value is Record<string, unknown> => value !== null && typeof value === 'object' && !Array.isArray(value);
const text = (value: unknown): value is string => typeof value === 'string' && value.trim().length > 0;
const normalized = (value: string): string => value.trim().replace(/\s+/g, ' ').toLocaleLowerCase('en-US');
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function safeUrl(value: unknown): boolean {
  if (!text(value)) return false;
  try {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol) && Boolean(url.hostname) && !url.username && !url.password;
  } catch { return false; }
}

function checkedDate(value: unknown): boolean {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value && value <= new Date().toISOString().slice(0, 10);
}

// This catches accidental region imports. The cited evidence and human review
// establish the actual city; the existing directory is not a US gazetteer.
function cityLabel(value: unknown): value is string {
  if (!text(value) || !/[a-z]/i.test(value) || /[\d<>/\n]/.test(value)) return false;
  if (/\b(county|region|regional|statewide|state wide|chapter|area|district|unknown|undisclosed)\b/i.test(value)) return false;
  if (/^(midwest|northeast|northwest|southeast|southwest|central|northern|southern|eastern|western)$/i.test(value.trim())) return false;
  const stateNames = getAllStates().map((state) => normalized(state.name));
  const city = normalized(value);
  if (stateNames.includes(city) && !['new york', 'washington'].includes(city)) return false;
  return !stateNames.some((state) => ['north', 'south', 'east', 'west', 'central', 'northern', 'southern', 'eastern', 'western'].some((prefix) => city === `${prefix} ${state}`));
}

/** Validate at the JSON boundary so a bad import cannot silently publish. */
export function validateVerifiedChapters(value: unknown): string[] {
  if (!object(value) || !Array.isArray(value.organizations)) return ['Registry must contain an organizations array'];
  const errors: string[] = [];
  const states = new Set(getAllStates().map((state) => state.code));
  const orgSlugs = new Set(CHAPTER_ORGS.map((org) => org.slug));
  value.organizations.forEach((org: unknown, index) => {
    const fail = (message: string) => { errors.push(`Organization ${index}: ${message}`); };
    if (!object(org)) { fail('must be an object'); return; }
    for (const key of ['slug', 'name', 'short']) if (!text(org[key])) fail(`${key} must be a nonempty string`);
    if (text(org.slug)) {
      if (!slugPattern.test(org.slug)) fail('invalid organization slug');
      if (orgSlugs.has(org.slug)) fail('duplicate organization slug or legacy hub collision');
      orgSlugs.add(org.slug);
    }
    if (org.website !== undefined && !safeUrl(org.website)) fail('website must be a safe HTTP(S) URL');
    if (!Array.isArray(org.about) || org.about.some((p) => !text(p))) fail('about must be an array of nonempty paragraphs');
    if (!Array.isArray(org.coverageNotes) || !org.coverageNotes.length || org.coverageNotes.some((p) => !text(p))) fail('coverageNotes must describe coverage limitations');
    const sourceUrls = new Set<string>();
    if (!Array.isArray(org.sources) || !org.sources.length) fail('sources must contain at least one reviewed source');
    else for (const source of org.sources) {
      if (!object(source)) { fail('source must be an object'); continue; }
      if (!safeUrl(source.url)) fail('source URL must be safe HTTP(S) without credentials');
      if (text(source.url)) {
        if (sourceUrls.has(source.url)) fail('duplicate source URL');
        sourceUrls.add(source.url);
      }
      if (!checkedDate(source.checkedAt)) fail('checkedAt must be a real, nonfuture YYYY-MM-DD date');
      if (!text(source.notes)) fail('source notes must explain the evidence');
    }
    if (org.stateCoverage !== undefined) {
      if (!Array.isArray(org.stateCoverage)) fail('stateCoverage must be an array');
      else {
        const covered = new Set<string>();
        for (const entry of org.stateCoverage) {
          if (!object(entry)) { fail('stateCoverage entry must be an object'); continue; }
          if (!text(entry.state) || !states.has(entry.state)) fail('stateCoverage state must be a lowercase US state code');
          if (text(entry.state)) {
            if (covered.has(entry.state)) fail('duplicate stateCoverage state');
            covered.add(entry.state);
          }
          if (!safeUrl(entry.sourceUrl) || !sourceUrls.has(entry.sourceUrl as string)) fail('stateCoverage sourceUrl must reference a safe reviewed source URL');
          if (!text(entry.evidence)) fail('stateCoverage evidence must explain what the source establishes');
        }
      }
    }
    if (!Array.isArray(org.chapters)) { fail('chapters must be an array'); return; }
    const ids = new Set<string>();
    const identities = new Set<string>();
    for (const [chapterIndex, chapter] of org.chapters.entries()) {
      const chapterFail = (message: string) => fail(`chapter ${chapterIndex}: ${message}`);
      if (!object(chapter)) { chapterFail('must be an object'); continue; }
      if (!text(chapter.id) || !slugPattern.test(chapter.id)) chapterFail('id must be a stable lowercase slug');
      if (text(chapter.id)) {
        if (ids.has(chapter.id)) chapterFail('duplicate chapter id');
        ids.add(chapter.id);
      }
      if (!text(chapter.name)) chapterFail('name must be a nonempty string');
      if (!cityLabel(chapter.city)) chapterFail('city must be an actual city label, not a state or region');
      if (!text(chapter.state) || !states.has(chapter.state)) chapterFail('state must be a lowercase US state code');
      if (text(chapter.name) && text(chapter.city) && text(chapter.state)) {
        const identity = [chapter.name, chapter.city, chapter.state].map(normalized).join('|');
        if (identities.has(identity)) chapterFail('duplicate chapter identity');
        identities.add(identity);
      }
      if (!safeUrl(chapter.sourceUrl) || !sourceUrls.has(chapter.sourceUrl as string)) chapterFail('sourceUrl must reference a safe reviewed source URL');
      if (!text(chapter.evidence)) chapterFail('evidence must explain the sourced city and identity');
      for (const field of ['website', 'mapsUrl']) {
        if (chapter[field] !== undefined && !safeUrl(chapter[field])) chapterFail(`${field} must be a safe HTTP(S) URL`);
      }
      if (chapter.address !== undefined && !text(chapter.address)) chapterFail('address must be nonempty when supplied');
      if (chapter.existingClubSlug !== undefined) {
        const club = text(chapter.existingClubSlug) ? getClubBySlug(chapter.existingClubSlug) : undefined;
        if (!club || !text(chapter.city) || normalized(club.City) !== normalized(chapter.city) || club.State !== chapter.state) chapterFail('existingClubSlug must match an existing profile in the reviewed city and state');
      }
    }
  });
  return errors;
}

const errors = validateVerifiedChapters(registry);
if (errors.length) throw new Error(`Invalid verified chapter registry:\n${errors.join('\n')}`);
const organizations = registry.organizations as VerifiedChapterOrg[];

export function getVerifiedChapterOrgs(): VerifiedChapterOrg[] {
  return organizations;
}

export function getVerifiedChapterOrg(slug: string): VerifiedChapterOrg | undefined {
  return organizations.find((org) => org.slug === slug);
}

export function getVerifiedChapterOrgsForState(stateCode: string, orgs = organizations): VerifiedChapterOrg[] {
  const state = stateCode.toLowerCase();
  return orgs.filter((org) => org.chapters.some((chapter) => chapter.state === state) || org.stateCoverage?.some((entry) => entry.state === state));
}

export function isIndexableVerifiedOrg(org: VerifiedChapterOrg): boolean {
  return org.about.filter((paragraph) => paragraph.trim().length >= 60).length >= 2 && org.sources.length > 0 && org.chapters.length > 0;
}

export function getVerifiedChapterProfile(chapter: VerifiedChapter): Club | undefined {
  const club = chapter.existingClubSlug ? getClubBySlug(chapter.existingClubSlug) : undefined;
  return club && isListableClub(club) && club.State === chapter.state && normalized(club.City) === normalized(chapter.city) ? club : undefined;
}
