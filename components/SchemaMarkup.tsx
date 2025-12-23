import { Club } from '@/lib/types';
import { SITE_NAME, SITE_URL } from '@/lib/utils';

interface OrganizationSchemaProps {
  type: 'organization';
}

interface LocalBusinessSchemaProps {
  type: 'localBusiness';
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

type SchemaMarkupProps =
  | OrganizationSchemaProps
  | LocalBusinessSchemaProps
  | BreadcrumbSchemaProps
  | ItemListSchemaProps;

export default function SchemaMarkup(props: SchemaMarkupProps) {
  let schema: object;

  switch (props.type) {
    case 'organization':
      schema = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: SITE_NAME,
        url: SITE_URL,
        description: 'The most comprehensive directory of motorcycle clubs across the United States.',
        logo: `${SITE_URL}/logo.png`,
      };
      break;

    case 'localBusiness':
      const { club } = props;
      schema = {
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        '@id': `${SITE_URL}/clubs/${club.slug}`,
        name: club.name,
        description: club.description || `${club.name} - Motorcycle club in ${club.City}, ${club.stateName}`,
        address: {
          '@type': 'PostalAddress',
          streetAddress: club.address,
          addressLocality: club.City,
          addressRegion: club.stateName,
          addressCountry: 'US',
        },
        ...(club.phone && { telephone: club.phone }),
        ...(club.website && { url: club.website }),
        ...(club.featured_image && { image: club.featured_image }),
        ...(club.rating > 0 && {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: club.rating,
            reviewCount: club.reviews || 1,
            bestRating: 5,
            worstRating: 1,
          },
        }),
      };
      break;

    case 'breadcrumb':
      schema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: props.items.map((item, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: item.name,
          item: item.url.startsWith('http') ? item.url : `${SITE_URL}${item.url}`,
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
          url: item.url.startsWith('http') ? item.url : `${SITE_URL}${item.url}`,
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
