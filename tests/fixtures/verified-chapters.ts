import type { VerifiedChapterOrg } from '@/lib/verified-chapters';

export function reviewedOrg(): VerifiedChapterOrg {
  return {
    slug: 'example-mc', name: 'Example Motorcycle Club', short: 'Example MC',
    website: 'https://example.org/',
    about: ['Example MC publishes a public chapter directory for its US chapters.', 'Chapter links provide public contact information; confirm arrangements directly before visiting.'],
    sources: [{ url: 'https://example.org/chapters', checkedAt: '2026-11-01', notes: 'Public chapter roster and organization context.' }],
    coverageNotes: ['This list covers chapters supported by the sources below; it is not a complete membership roster.'],
    chapters: [{ id: 'austin', name: 'Austin Chapter', city: 'Austin', state: 'tx', sourceUrl: 'https://example.org/chapters', evidence: 'Roster lists Austin, Texas.' }],
  };
}
