import type { Club, ClubEnrichment } from '@/lib/types';

export function makeEnrichment(club: Club, changes: ClubEnrichment['changes'] = { description: club.description }): ClubEnrichment {
  return {
    placeId: club.place_id, expectedName: club.name, listingStatus: 'confirmed-club', changes,
    verifiedAt: '2026-01-02', reviewNote: 'PRIVATE NOTE',
    evidence: [{ url: 'https://example.org/about', checkedAt: '2026-01-01',
      fields: ['listingStatus', 'description'], factNotes: ['A local organization', 'Organizes rides', 'Publishes membership guidance'] }],
  };
}

export function makeReviewedClub(overrides: Partial<Club> = {}): Club {
  const club: Club = {
    place_id: 'market-fixture', name: 'Example Riders', slug: 'example-riders-old-town-ca',
    description: 'Example Riders organizes social motorcycle rides and publishes membership guidance for its local organization.',
    reviews: 0, rating: 0, website: 'https://example.org', phone: '', featured_image: '',
    main_category: 'Motorcycle club', categories: '', closed_on: '', address: '1 Main St, Old Town, CA',
    link: '', query: '', 'query-02': '', City: 'Old Town', State: 'ca', stateName: 'California', citySlug: 'old-town',
    ...overrides,
  };
  club.editorial = overrides.editorial ?? makeEnrichment(club);
  return club;
}
