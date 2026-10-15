import { Club } from '@/lib/types';
import { SITE_NAME, SITE_URL, SITE_DESCRIPTION } from '@/lib/utils';
import { getPrimaryImagePath } from '@/lib/images';

interface OrganizationSchemaProps {
  type: 'organization';
}

interface WebSiteSchemaProps {
  type: 'website';
}

interface ClubSchemaProps {
  // Kept as "localBusiness" for call-site compatibility; emits an Organization.
  type: 'localBusiness' | 'club';
  club: Club;
}

interface BreadcrumbSchemaProps {
  type: 'breadcrumb';
  items: { name: string; url: string }[];
}

interface ItemListSchemaProps {
  type: 'itemList';
  items: { name: string; url: string; position: number }[];
  name: string;
}

interface FaqSchemaProps {
  type: 'faq';
  items: { question: string; answer: string }[];
}

type SchemaMarkupProps =
  | OrganizationSchemaProps
  | WebSiteSchemaProps
  | ClubSchemaProps
  | BreadcrumbSchemaProps
  | ItemListSchemaProps
  | FaqSchemaProps;

const absolute = (url: string) => (url.startsWith('http') ? url : `${SITE_URL}${url}`);

export default function SchemaMarkup(props: SchemaMarkupProps) {
  let schema: object;

  switch (props.type) {
    case 'organization':
      schema = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        '@id': `${SITE_URL}/#organization`,
        name: SITE_NAME,
        url: SITE_URL,
        description: SITE_DESCRIPTION,
        logo: `${SITE_URL}/logo.png`,
      };
      break;

    case 'website':
      schema = {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        name: SITE_NAME,
        url: SITE_URL,
        publisher: { '@id': `${SITE_URL}/#organization` },
        potentialAction: {
          '@type': 'SearchAction',
          target: { '@type': 'EntryPoint', urlTemplate: `${SITE_URL}/search?q={search_term_string}` },
          'query-input': 'required name=search_term_string',
        },
      };
      break;

    case 'localBusiness':
    case 'club': {
      // Clubs are membership organizations, not businesses. Third-party review
      // counts are deliberately not emitted as aggregateRating: Google's review
      // snippet rules only allow ratings collected on the publishing site.
      const { club } = props;
      const image = getPrimaryImagePath(club);
      const hasStreet = club.address && club.address.split(',').length > 2;
      schema = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        '@id': `${SITE_URL}/clubs/${club.slug}#organization`,
        name: club.name,
        description: club.description || `${club.name} is a motorcycle club in ${club.City}, ${club.stateName}.`,
        address: {
          '@type': 'PostalAddress',
          ...(hasStreet && { streetAddress: club.address.split(',')[0].trim() }),
          addressLocality: club.City,
          addressRegion: club.stateName,
          addressCountry: 'US',
        },
        ...(club.phone && { telephone: club.phone }),
        ...(club.website && { url: club.website }),
        ...(image && { image: absolute(image) }),
        ...(club.link && { sameAs: [club.link] }),
      };
      break;
    }

    case 'breadcrumb':
      schema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: props.items.map((item, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: item.name,
          item: absolute(item.url),
        })),
      };
      break;

    case 'itemList':
      schema = {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: props.name,
        itemListElement: props.items.map((item) => ({
          '@type': 'ListItem',
          position: item.position,
          name: item.name,
          url: absolute(item.url),
        })),
      };
      break;

    case 'faq':
      schema = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: props.items.map((item) => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: { '@type': 'Answer', text: item.answer },
        })),
      };
      break;
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
