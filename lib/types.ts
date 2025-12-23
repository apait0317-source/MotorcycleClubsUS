export interface Club {
  place_id: string;
  name: string;
  description: string;
  reviews: number;
  rating: number;
  website: string;
  phone: string;
  featured_image: string;
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
