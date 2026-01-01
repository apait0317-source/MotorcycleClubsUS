'use client';

import Image from 'next/image';

// Set your Amazon affiliate tag here
// Sign up at: https://affiliate-program.amazon.com/
const AMAZON_AFFILIATE_TAG = process.env.NEXT_PUBLIC_AMAZON_AFFILIATE_TAG || 'usamotorcycle-20';

interface AffiliateProduct {
  name: string;
  description: string;
  price: string;
  amazonAsin: string;
  category: string;
}

const defaultProducts: AffiliateProduct[] = [
  {
    name: 'Shoei RF-1400 Helmet',
    description: 'Premium full-face helmet with superior ventilation and noise reduction',
    price: '$599.99',
    amazonAsin: 'B08T6JDC4H',
    category: 'Helmets',
  },
  {
    name: 'Alpinestars Leather Jacket',
    description: 'CE-certified protection with premium leather construction',
    price: '$449.95',
    amazonAsin: 'B07BHQF6TK',
    category: 'Jackets',
  },
  {
    name: 'Held Touring Gloves',
    description: 'Waterproof and breathable with knuckle protection',
    price: '$129.00',
    amazonAsin: 'B07J5Y9P8H',
    category: 'Gloves',
  },
  {
    name: 'Sena 50S Bluetooth',
    description: 'Mesh 2.0 intercom with HD speakers and 8km range',
    price: '$349.00',
    amazonAsin: 'B08CXQ7GZF',
    category: 'Communication',
  },
];

const categoryIcons: Record<string, React.ReactNode> = {
  Helmets: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
  Jackets: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
    </svg>
  ),
  Gloves: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
    </svg>
  ),
  Communication: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.14 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
    </svg>
  ),
};

interface AffiliateSectionProps {
  title?: string;
  products?: AffiliateProduct[];
  className?: string;
}

export default function AffiliateSection({
  title = 'Recommended Gear',
  products = defaultProducts,
  className = '',
}: AffiliateSectionProps) {
  const getAmazonUrl = (asin: string) => {
    return `https://www.amazon.com/dp/${asin}?tag=${AMAZON_AFFILIATE_TAG}`;
  };

  return (
    <div className={`bg-gray-50 rounded-xl p-6 ${className}`}>
      <h3 className="font-semibold text-lg text-gray-900 mb-4">{title}</h3>
      <div className="space-y-3">
        {products.map((product, index) => (
          <a
            key={index}
            href={getAmazonUrl(product.amazonAsin)}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-sm transition group"
          >
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0 text-blue-600 group-hover:bg-blue-100 transition">
              {categoryIcons[product.category] || (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h4 className="font-medium text-gray-900 text-sm truncate group-hover:text-blue-600 transition">
                  {product.name}
                </h4>
                <span className="text-sm font-semibold text-green-600 whitespace-nowrap">
                  {product.price}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                {product.description}
              </p>
              <span className="text-xs text-blue-600 mt-1 inline-flex items-center gap-1 group-hover:underline">
                View on Amazon
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </span>
            </div>
          </a>
        ))}
      </div>
      <p className="text-xs text-gray-400 mt-4 text-center">
        As an Amazon Associate, we earn from qualifying purchases
      </p>
    </div>
  );
}
