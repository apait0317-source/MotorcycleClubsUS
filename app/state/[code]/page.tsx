import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Breadcrumbs from '@/components/Breadcrumbs';
import ClubCard from '@/components/ClubCard';
import SchemaMarkup from '@/components/SchemaMarkup';
import AdSlot from '@/components/AdSlot';
import { shouldInsertInFeedAd } from '@/lib/ads';
import { getAllStates, getStateByCode, getCitiesByState, getStateSummary, getCityClubCount, getListableClubsByState, getThinClubsByState, isIndexableCity } from '@/lib/data';
import { getStateIntro } from '@/lib/state-intros';
import { attachImages, sortForDisplay } from '@/lib/images';
import { capitalizeCity, SITE_URL } from '@/lib/utils';

interface PageProps {
  params: Promise<{ code: string }>;
}

export async function generateStaticParams() {
  return getAllStates().map((state) => ({ code: state.code }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { code } = await params;
  const state = getStateByCode(code);
  if (!state) return { title: 'State Not Found' };

  const summary = getStateSummary(code);
  return {
    title: `Motorcycle Clubs in ${state.name} (${summary.clubCount} Clubs)`,
    description: `Directory of ${summary.clubCount} motorcycle clubs in ${state.name} across ${summary.cityCount} cities: veteran MCs, riding clubs, brand chapters, and more, with websites and phone numbers.`,
    alternates: { canonical: `/state/${state.code}` },
    openGraph: {
      title: `Motorcycle Clubs in ${state.name}`,
      description: `Find ${summary.clubCount} motorcycle clubs in ${state.name}.`,
      url: `${SITE_URL}/state/${state.code}`,
    },
  };
}

function joinNames(items: string[]): string {
  if (items.length <= 1) return items.join('');
  return `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`;
}

export default async function StatePage({ params }: PageProps) {
  const { code } = await params;
  const state = getStateByCode(code);
  if (!state) notFound();

  const clubs = attachImages(sortForDisplay(getListableClubsByState(code)));
  const thinClubs = getThinClubsByState(code).sort((a, b) => a.City.localeCompare(b.City) || a.name.localeCompare(b.name));
  // Only cities with their own indexable page are linked from the grid.
  const cities = getCitiesByState(code)
    .filter(isIndexableCity)
    .map((city) => ({ ...city, clubCount: getCityClubCount(city) }))
    .sort((a, b) => b.clubCount - a.clubCount || a.name.localeCompare(b.name));
  const summary = getStateSummary(code);
  const intro = getStateIntro(code);

  const topGroups = summary.groups.slice(0, 3);
  const topCityNames = summary.topCities.slice(0, 3).map((c) => capitalizeCity(c.name));

  const faq = [
    {
      question: `How many motorcycle clubs are in ${state.name}?`,
      answer: `This directory lists ${summary.clubCount} motorcycle clubs in ${state.name} across ${summary.cityCount} cities. ${summary.withWebsite} have a website on file and ${summary.withPhone} list a phone number.`,
    },
    {
      question: `What kinds of motorcycle clubs are in ${state.name}?`,
      answer: topGroups.length
        ? `The largest groups are ${joinNames(topGroups.map((g) => `${g.group.toLowerCase()} (${g.count})`))}. Each listing shows its category so you can tell a traditional MC from a riding club or a brand owners group.`
        : `Listings include traditional MCs, riding clubs, veteran clubs, and brand owners groups.`,
    },
    {
      question: `How do I join a motorcycle club in ${state.name}?`,
      answer: `Pick clubs whose riding style and time commitment match yours, attend a public ride or event, and ask a member how the club brings in new people. Traditional MCs use a hang-around and prospect process. Riding clubs usually accept members directly. See our guide on how to join a motorcycle club.`,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumbs items={[{ label: 'States', href: '/states' }, { label: state.name }]} />

      <SchemaMarkup
        type="breadcrumb"
        items={[
          { name: 'Home', url: '/' },
          { name: 'States', url: '/states' },
          { name: state.name, url: `/state/${state.code}` },
        ]}
      />
      <SchemaMarkup type="faq" items={faq} />

      <div className="mb-8 max-w-4xl">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Motorcycle Clubs in {state.name}
        </h1>
        {intro.map((paragraph, i) => (
          <p key={i} className={i === 0 ? 'text-lg text-gray-700 mb-4 leading-relaxed' : 'text-gray-700 mb-4 leading-relaxed'}>
            {paragraph}
          </p>
        ))}
        <p className="text-gray-600 mb-4">
          {summary.clubCount} motorcycle clubs across {summary.cityCount} cities in {state.name}.
          {topCityNames.length > 0 && <> The most clubs are in {joinNames(topCityNames)}.</>}
        </p>
        {topGroups.length > 0 && (
          <p className="text-gray-600">
            By type, {state.name} listings are led by {joinNames(topGroups.map((g) => `${g.group.toLowerCase()} (${g.count})`))}.
            {' '}Listings are compiled from public sources and club submissions. If you run a club here,{' '}
            <Link href="/contact" className="text-amber-700 hover:underline">send corrections</Link> and we will update the entry.
          </p>
        )}
      </div>

      {/* Fixed unit: after the editorial intro. */}
      <AdSlot placement="inline" className="mb-8" />

      {cities.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Cities in {state.name}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {cities.map((city) => (
              <Link
                key={`${city.state}-${city.slug}`}
                href={`/city/${city.state}/${city.slug}`}
                className="bg-white rounded-lg p-3 border border-gray-200 hover:border-gray-300 hover:shadow-md transition text-center"
              >
                <span className="font-medium text-gray-900 text-sm">{capitalizeCity(city.name)}</span>
                <span className="block text-xs text-gray-500 mt-1">{city.clubCount} {city.clubCount === 1 ? 'club' : 'clubs'}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Clubs in {state.name}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {clubs.map((club, index) => (
            <React.Fragment key={club.place_id}>
              <ClubCard club={club} />
              {shouldInsertInFeedAd(index, clubs.length) && (
                <div className="col-span-full">
                  <AdSlot placement="inline" />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </section>

      {thinClubs.length > 0 && (
        <section className="mt-12">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Other clubs in {state.name}</h2>
          <p className="text-sm text-gray-500 mb-4">
            Clubs we know of in {state.name} with limited public details on file. Where a club publishes a website, the
            name links to it. Club officers can <Link href="/contact" className="text-amber-700 hover:underline">send details</Link> to expand an entry.
          </p>
          <ul className="columns-1 sm:columns-2 lg:columns-3 gap-6 text-sm text-gray-700">
            {thinClubs.map((club) => (
              <li key={club.place_id} className="mb-1 break-inside-avoid">
                {club.website ? (
                  <a href={club.website} target="_blank" rel="noopener noreferrer nofollow" className="hover:text-amber-700">{club.name}</a>
                ) : (
                  <span>{club.name}</span>
                )}
                <span className="text-gray-400"> · {capitalizeCity(club.City)}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-12 max-w-4xl">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Motorcycle Clubs in {state.name}: Questions</h2>
        <dl className="space-y-6">
          {faq.map((item) => (
            <div key={item.question}>
              <dt className="font-semibold text-gray-900">{item.question}</dt>
              <dd className="text-gray-600 mt-1">
                {item.answer}
                {item.question.startsWith('How do I join') && (
                  <> <Link href="/guides/how-to-join-a-motorcycle-club" className="text-amber-700 hover:underline">Read the guide</Link>.</>
                )}
              </dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}
