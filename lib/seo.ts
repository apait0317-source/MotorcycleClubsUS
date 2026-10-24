import type { Metadata } from 'next';
import type { Club } from './types';
import { isTemplateDescription } from './data';
import { capitalizeCity, formatRating, SITE_NAME } from './utils';

/** The layout title template appends this to every title that is not absolute. */
export const TITLE_SUFFIX = ` | ${SITE_NAME}`;
/** Search results cut titles at roughly this many characters. */
export const MAX_TITLE_LENGTH = 60;

const META_MIN = 70;
const META_MAX = 155;

/** A plain string must fit with the site suffix. `{ bare }` must fit without it. */
export type TitleCandidate = string | { bare: string };

/**
 * Walks the candidates in order and returns the first that fits. Put the most
 * descriptive first and the shortest last. Use `{ bare }` to prefer dropping
 * the brand suffix over dropping words that matter, such as a club's city. If
 * nothing fits, the first plain candidate that fits bare is used, then the last.
 */
export function fitTitle(candidates: TitleCandidate[]): NonNullable<Metadata['title']> {
  for (const c of candidates) {
    if (typeof c === 'string') {
      if (c.length + TITLE_SUFFIX.length <= MAX_TITLE_LENGTH) return c;
    } else if (c.bare.length <= MAX_TITLE_LENGTH) {
      return { absolute: c.bare };
    }
  }
  const text = (c: TitleCandidate) => (typeof c === 'string' ? c : c.bare);
  const bare = candidates.map(text).find((t) => t.length <= MAX_TITLE_LENGTH);
  return { absolute: bare ?? text(candidates[candidates.length - 1]) };
}

export function stateTitle(stateName: string, clubCount: number): NonNullable<Metadata['title']> {
  return fitTitle([`Motorcycle Clubs in ${stateName} (${clubCount} Clubs)`, `Motorcycle Clubs in ${stateName}`]);
}

export function cityTitle(cityName: string, stateName: string, stateCode: string): NonNullable<Metadata['title']> {
  const code = stateCode.toUpperCase();
  return fitTitle([
    `Motorcycle Clubs in ${cityName}, ${stateName}`,
    `Motorcycle Clubs in ${cityName}, ${code}`,
    { bare: `Motorcycle Clubs in ${cityName}, ${stateName}` },
    { bare: `Motorcycle Clubs in ${cityName}, ${code}` },
    `Motorcycle Clubs in ${cityName}`,
  ]);
}

/** Keeps the city in every title: the suffix goes before the city or the state name does. */
export function clubTitle(club: Club): NonNullable<Metadata['title']> {
  const city = capitalizeCity(club.City);
  const code = club.State.toUpperCase();
  return fitTitle([
    `${club.name} - ${city}, ${club.stateName}`,
    `${club.name} - ${city}, ${code}`,
    { bare: `${club.name} - ${city}, ${club.stateName}` },
    { bare: `${club.name} - ${city}, ${code}` },
    { bare: `${club.name} - ${city}` },
    `${club.name}, ${code}`,
  ]);
}

/** Cuts at a word boundary and adds "..."; the result never exceeds `max`. */
export function truncateAtWord(text: string, max: number): string {
  if (text.length <= max) return text;
  if (max < 4) return text.slice(0, max);
  let room = text.slice(0, max - 3);
  // Do not split a surrogate pair.
  if (/[\ud800-\udbff]$/.test(room)) room = room.slice(0, -1);
  const lastSpace = room.lastIndexOf(' ');
  const cut = lastSpace > 0 && text[room.length] !== ' ' ? room.slice(0, lastSpace) : room;
  const trimmed = cut.replace(/[\s.,;:\-–—&@(/]+$/, '');
  return `${trimmed || cut.trim()}...`;
}

function withArticle(phrase: string): string {
  return `${/^[aeiou]/i.test(phrase) ? 'an' : 'a'} ${phrase}`;
}

function categoryPhrase(club: Club): string {
  const category = (club.main_category || '').trim();
  // Only labels that name a motorcycle club read well after "is a". Others, such
  // as "Club", "Sports club", or "Association / Organization", fall back.
  if (!/motorcycle club$/i.test(category)) return 'motorcycle club';
  // Lowercase the label but keep acronyms such as "BMW".
  return category
    .split(' ')
    .map((word) => (/^[A-Z]{2,}$/.test(word) ? word : word.toLowerCase()))
    .join(' ');
}

function contactSentence(club: Club): string {
  if (club.website && club.phone) return 'Website and phone number listed.';
  if (club.website) return 'Website listed.';
  if (club.phone) return 'Phone number listed.';
  return '';
}

// Raw links, handles, and phone numbers read badly in a search snippet.
const CONTACT_IN_TEXT = /https?:\/\/|www\.|@\w|\(?\d{3}\)?[-.\s]\d{3}[-.\s]\d{4}/i;

/**
 * Meta description for a club page. Uses the club's own text when it is long
 * enough to be useful and free of raw contact details; otherwise builds one from
 * fields in the data. Ratings are named as Google ratings because that is where
 * every rated row comes from.
 */
export function clubMetaDescription(club: Club): string {
  const own = (club.description || '').replace(/\s+/g, ' ').trim();
  if (own.length >= META_MIN && !isTemplateDescription(own) && !CONTACT_IN_TEXT.test(own)) {
    return truncateAtWord(own, META_MAX);
  }

  const city = capitalizeCity(club.City);
  const parts = [`${club.name} is ${withArticle(categoryPhrase(club))} in ${city}, ${club.stateName}.`];
  if (isTemplateDescription(club.description)) parts.push('It holds a club charter with the American Motorcyclist Association.');
  const contact = contactSentence(club);
  if (contact) parts.push(contact);
  if (club.reviews > 0) {
    parts.push(`Rated ${formatRating(club.rating)} on Google from ${club.reviews} ${club.reviews === 1 ? 'review' : 'reviews'}.`);
  }
  let text = parts.join(' ');
  if (text.length < META_MIN) text += ' See the location, contact details, and nearby clubs.';
  return truncateAtWord(text, META_MAX);
}
