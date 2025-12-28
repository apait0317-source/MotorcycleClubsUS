import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Breadcrumbs from '@/components/Breadcrumbs';
import ClubCard from '@/components/ClubCard';
import SchemaMarkup from '@/components/SchemaMarkup';
import AdPlaceholder from '@/components/AdPlaceholder';
import AffiliateSection from '@/components/AffiliateSection';
import { getAllCities, getCityBySlug, getClubsByCity, getStateByCode, filterClubsWithImages, isMotorcycleClub } from '@/lib/data';
import { capitalizeCity, SITE_URL } from '@/lib/utils';
import { prisma } from '@/lib/db';

interface PageProps {
  params: Promise<{ state: string; city: string }>;
}

export async function generateStaticParams() {
  const cities = getAllCities();
  return cities.map((city) => ({
    state: city.state,
    city: city.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { state, city: citySlug } = await params;
  const city = getCityBySlug(state, citySlug);

  if (!city) {
    return { title: 'City Not Found' };
  }

  const cityName = capitalizeCity(city.name);

  return {
    title: `Motorcycle Clubs in ${cityName}, ${city.stateName}`,
    description: `Find ${city.clubCount} motorcycle clubs in ${cityName}, ${city.stateName}. Browse local motorcycle clubs and connect with riders in your area.`,
    openGraph: {
      title: `Motorcycle Clubs in ${cityName}, ${city.stateName}`,
      description: `Find ${city.clubCount} motorcycle clubs in ${cityName}, ${city.stateName}.`,
      url: `${SITE_URL}/city/${city.state}/${city.slug}`,
    },
  };
}

export default async function CityPage({ params }: PageProps) {
  const { state: stateCode, city: citySlug } = await params;
  const city = getCityBySlug(stateCode, citySlug);
  const state = getStateByCode(stateCode);

  if (!city || !state) {
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

  // Get all clubs for this city, filter to actual motorcycle clubs only
  const allClubs = getClubsByCity(stateCode, citySlug).filter(isMotorcycleClub);

  // Attach image data to clubs that have images (but show ALL clubs)
  const clubs = allClubs.map(club => ({
    ...club,
    images: imagesMap.get(club.place_id) || []
  }));

  const cityName = capitalizeCity(city.name);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumbs
        items={[
          { label: 'States', href: '/states' },
          { label: state.name, href: `/state/${state.code}` },
          { label: cityName },
        ]}
      />

      <SchemaMarkup
        type="breadcrumb"
        items={[
          { name: 'Home', url: '/' },
          { name: 'States', url: '/states' },
          { name: state.name, url: `/state/${state.code}` },
          { name: cityName, url: `/city/${city.state}/${city.slug}` },
        ]}
      />

      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Motorcycle Clubs in {cityName}, {city.stateName}
        </h1>
        <p className="text-lg text-gray-600">
          Discover {clubs.length} motorcycle clubs in {cityName}. Connect with local riders and find your community.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-3">
          <AdPlaceholder size="banner" className="mb-8" />

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {clubs.map((club, index) => (
              <React.Fragment key={club.place_id}>
                <ClubCard club={club} />
                {/* Insert ad every 6 clubs */}
                {(index + 1) % 6 === 0 && index < clubs.length - 1 && (
                  <div className="col-span-full">
                    <AdPlaceholder size="inline" />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>

          {clubs.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No motorcycle clubs found in {cityName}.</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <AdPlaceholder size="sidebar" />
          <AffiliateSection />
        </div>
      </div>

      <AdPlaceholder size="banner" className="mt-8" />
    </div>
  );
}
