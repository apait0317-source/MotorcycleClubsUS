// National organizations whose chapters come from the organization's own
// chapter list. Every such row repeats one organization blurb with a new city,
// so the rows get no indexed page of their own. The organization's hub page,
// /chapters/[slug], carries them instead. Facts below come from the listing
// text in data/clubs.json. Add a fact only after you can source it.

export interface ChapterOrg {
  slug: string;
  /** place_id prefix that marks a row as coming from this organization's chapter list. */
  idPrefix: string;
  name: string;
  short: string;
  /** Organization site, only when every chapter row points to it. */
  website?: string;
  /** Plain-English paragraphs shown above the chapter list. */
  about: string[];
}

export const CHAPTER_ORGS: ChapterOrg[] = [
  {
    slug: 'cvma',
    idPrefix: 'cvma_',
    name: 'Combat Veterans Motorcycle Association',
    short: 'CVMA',
    about: [
      'The Combat Veterans Motorcycle Association (CVMA) is a veterans motorcycle organization. Its chapter listings describe it as a 501(c)(19) charity that supports those who defended the country.',
      'Each entry below is a chapter in its own city. Use the chapter\'s own website or Facebook page, where it has one, to confirm meeting details and membership rules before you visit.',
    ],
  },
  {
    slug: 'wow',
    idPrefix: 'wow_',
    name: 'Women On Wheels',
    short: 'WOW',
    website: 'https://womenonwheels.org/',
    about: [
      'Women On Wheels (WOW) is an international not-for-profit organization founded in 1982. It brings together women motorcyclists of any age or skill level.',
      'Chapters are listed by state. The organization\'s site is the place to confirm current chapter details.',
    ],
  },
  {
    slug: 'sober-riders',
    idPrefix: 'srmc_',
    name: 'Sober Riders Motorcycle Club',
    short: 'SRMC',
    website: 'https://soberridersmc.org/',
    about: [
      'Sober Riders Motorcycle Club (SRMC) began in Tucson, Arizona, in 1991. It is a fellowship of recovering alcoholics and addicts who share a love of motorcycles and sobriety.',
      'Chapters are listed by state. The club\'s site is the place to confirm current chapter details.',
    ],
  },
];

export function getChapterOrg(slug: string): ChapterOrg | undefined {
  return CHAPTER_ORGS.find((org) => org.slug === slug);
}

export function chapterOrgForId(placeId: string): ChapterOrg | undefined {
  return CHAPTER_ORGS.find((org) => placeId.startsWith(org.idPrefix));
}
