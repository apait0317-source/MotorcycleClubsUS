import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Breadcrumbs from '@/components/Breadcrumbs';
import ClubCard from '@/components/ClubCard';
import SchemaMarkup from '@/components/SchemaMarkup';
import AdPlaceholder from '@/components/AdPlaceholder';
import { getAllStates, getStateByCode, getClubsByState, getCitiesByState, filterClubsWithImages } from '@/lib/data';
import { capitalizeCity, SITE_URL } from '@/lib/utils';
import { prisma } from '@/lib/db';

interface PageProps {
  params: Promise<{ code: string }>;
}

export async function generateStaticParams() {
  const states = getAllStates();
  return states.map((state) => ({
    code: state.code,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { code } = await params;
  const state = getStateByCode(code);

  if (!state) {
    return { title: 'State Not Found' };
  }

  return {
    title: `Motorcycle Clubs in ${state.name}`,
    description: `Find ${state.clubCount} motorcycle clubs in ${state.name}. Browse clubs in ${state.cityCount} cities across ${state.name}.`,
    openGraph: {
      title: `Motorcycle Clubs in ${state.name}`,
      description: `Find ${state.clubCount} motorcycle clubs in ${state.name}.`,
      url: `${SITE_URL}/state/${state.code}`,
    },
  };
}

export default async function StatePage({ params }: PageProps) {
  const { code } = await params;
  const state = getStateByCode(code);

  if (!state) {
    notFound();
  }

  // Get clubs with images from database
  let imagesMap = new Map<string, any[]>();
  let clubsWithImagesPlaceIds = new Set<string>();

  if (process.env.NODE_ENV !== 'production' || process.env.VERCEL_ENV === 'production') {
    try {
      const clubsWithImages = await prisma.club.findMany({
        where: {
          images: {
            some: {}
          }
        },
        select: {
          placeId: true,
          images: {
            orderBy: { displayOrder: 'asc' }
          }
        }
      });

      // Create a map of placeId -> images
      clubsWithImages.forEach(club => {
        imagesMap.set(club.placeId, club.images);
        clubsWithImagesPlaceIds.add(club.placeId);
      });
    } catch (error) {
      console.error('Failed to fetch clubs with images:', error);
    }
  }

  // Get all clubs for this state
  const allClubs = getClubsByState(code);

  // Filter to only clubs with images and attach image data
  const clubs = clubsWithImagesPlaceIds.size > 0
    ? filterClubsWithImages(allClubs, clubsWithImagesPlaceIds).map(club => ({
        ...club,
        images: imagesMap.get(club.place_id) || []
      }))
    : allClubs;

  const cities = getCitiesByState(code);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumbs
        items={[
          { label: 'States', href: '/states' },
          { label: state.name },
        ]}
      />

      <SchemaMarkup
        type="breadcrumb"
        items={[
          { name: 'Home', url: '/' },
          { name: 'States', url: '/states' },
          { name: state.name, url: `/state/${state.code}` },
        ]}
      />

      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Motorcycle Clubs in {state.name}
        </h1>
        <p className="text-lg text-gray-600">
          Discover {state.clubCount} motorcycle clubs across {state.cityCount} cities in {state.name}.
        </p>
      </div>

      <AdPlaceholder size="banner" className="mb-8" />

      {/* Cities Section */}
      {cities.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Cities in {state.name}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {cities.map((city) => (
              <Link
                key={`${city.state}-${city.slug}`}
                href={`/city/${city.state}/${city.slug}`}
                className="bg-white rounded-lg p-3 border border-gray-200 hover:border-gray-300 hover:shadow-md transition text-center"
              >
                <span className="font-medium text-gray-900 text-sm">
                  {capitalizeCity(city.name)}
                </span>
                <span className="block text-xs text-gray-500 mt-1">
                  {city.clubCount} clubs
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Clubs Section */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          All Clubs in {state.name}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {clubs.map((club, index) => (
            <React.Fragment key={club.place_id}>
              <ClubCard club={club} />
              {/* Insert ad every 8 clubs */}
              {(index + 1) % 8 === 0 && index < clubs.length - 1 && (
                <div className="col-span-full">
                  <AdPlaceholder size="inline" />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </section>

      <AdPlaceholder size="banner" className="mt-8" />
    </div>
  );
}
