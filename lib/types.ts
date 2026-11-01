export type EnrichmentField = 'description' | 'website' | 'phone' | 'listingStatus';

export interface ClubEvidence {
  url: string;
  checkedAt: string;
  fields: EnrichmentField[];
  factNotes: string[];
}

export interface ClubEnrichment {
  placeId: string;
  expectedName: string;
  listingStatus: 'confirmed-club' | 'excluded';
  // An evidenced empty website removes an unrelated former contact domain.
  changes: { description?: string; website?: string; phone?: string };
  evidence: ClubEvidence[];
  verifiedAt: string;
  reviewNote: string;
}

export interface Image {
  id: string;
  clubId: string;
  url: string;
  filename: string;
  isPrimary: boolean;
  displayOrder: number;
  imageType: string | null;
  width: number | null;
  height: number | null;
  fileSize: number | null;
  createdAt: Date;
  updatedAt: Date;
}

// Lightweight reference to a locally hosted club photo (from data/images.json).
export interface ClubImageRef {
  filename: string;
  isPrimary: boolean;
  displayOrder: number;
}

export interface Club {
  editorial?: ClubEnrichment;
  place_id: string;
  name: string;
  description: string;
  reviews: number;
  rating: number;
  website: string;
  phone: string;
  featured_image: string;
  featured_image_original?: string;
  main_category: string;
  categories: string;
  closed_on: string;
  address: string;
  link: string;
  query: string;
  "query-02": string;
  City: string;
  State: string;
  stateName: string;
  citySlug: string;
  slug: string;
  images?: ClubImageRef[];
}

export interface State {
  code: string;
  name: string;
  slug: string;
  clubCount: number;
  cityCount: number;
}

export interface City {
  name: string;
  slug: string;
  state: string;
  stateName: string;
  clubCount: number;
}
