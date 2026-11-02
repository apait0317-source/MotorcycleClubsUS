import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import SchemaMarkup from '@/components/SchemaMarkup';
import HeroSearch from '@/components/HeroSearch';
import AdSenseLoader from '@/components/AdSenseLoader';
import AffiliateSection from '@/components/AffiliateSection';
import SponsorPlacement from '@/components/SponsorPlacement';
import HomeHero from '@/components/home/HomeHero';
import HomeClubList from '@/components/home/HomeClubList';
import { toPublicClub } from '@/lib/club-projection';
import { getAllStates, getIndexableStates, getIndexableClubs, getSiteStats, getListableClubsByState, getStateSummary } from '@/lib/data';
import { guides } from '@/lib/guides';
import { QUARTERLY_SPONSOR, isValidSponsor } from '@/lib/sponsors';

export const metadata: Metadata = { alternates: { canonical: '/' } };

const guideImages: Record<string, string> = {
  'how-to-join-a-motorcycle-club': '/images/home/guide-joining.webp',
  'types-of-motorcycle-clubs': '/images/home/guide-clubs.webp',
  'group-riding-safety': '/images/home/guide-riding.webp',
};
const guideSlugs = Object.keys(guideImages);

export default function HomePage() {
  const searchStates = getAllStates()
    .filter((state) => getStateSummary(state.code).clubCount > 0)
    .map((state) => ({ ...state, clubCount: getListableClubsByState(state.code).length }));
  const gridStates = getIndexableStates()
    .map((state) => ({ ...state, clubCount: getListableClubsByState(state.code).length }))
    .sort((a, b) => b.clubCount - a.clubCount || a.name.localeCompare(b.name))
    .slice(0, 6);
  const stats = getSiteStats();
  const reviewed = getIndexableClubs();
  const exploreClubs = [...reviewed].reverse().map(toPublicClub);
  const hasSponsor = isValidSponsor(QUARTERLY_SPONSOR);
  const homeGuides = guideSlugs.flatMap((slug) => {
    const guide = guides.find((item) => item.slug === slug);
    return guide ? [guide] : [];
  });

  return (
    <>
      <AdSenseLoader />
      <SchemaMarkup type="organization" />
      <SchemaMarkup type="website" />
      <HomeHero>
        <HeroSearch states={searchStates} />
        <p className="mt-4 text-sm leading-relaxed text-gray-700">
          {reviewed.length} source-reviewed profiles. Basic directory entries across {stats.stateCount} states and territories.
        </p>
      </HomeHero>

      <section aria-labelledby="states-heading" className="bg-paper py-12 md:py-16">
        <div className={`site-container ${hasSponsor ? 'grid gap-10 lg:grid-cols-[minmax(0,1fr)_300px]' : ''}`}>
          <div>
            <span className="section-marker" aria-hidden="true" />
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h2 id="states-heading" className="home-heading">Find your state.</h2>
              <Link href="/cities" className="home-link">Browse by city <span aria-hidden="true">→</span></Link>
            </div>
            <ul className={`mt-7 grid gap-x-8 sm:grid-cols-2 ${hasSponsor ? 'xl:grid-cols-3' : 'lg:grid-cols-3'}`}>
              {gridStates.map((state) => (
                <li key={state.code} className="min-w-0 border-b border-gray-300">
                  <Link href={`/state/${state.code}`} className="group flex min-h-24 min-w-0 items-center justify-between gap-4 py-4">
                    <span className="min-w-0 [overflow-wrap:anywhere]"><span className="block font-display text-3xl font-bold group-hover:underline underline-offset-4">{state.name}</span><span className="mt-1 block text-sm text-gray-600">{state.clubCount} reviewed {state.clubCount === 1 ? 'profile' : 'profiles'}</span></span>
                    <span className="shrink-0 text-2xl text-brand-ink" aria-hidden="true">↗</span>
                  </Link>
                </li>
              ))}
            </ul>
            <Link href="/states" className="home-link mt-5">All states and basic coverage <span aria-hidden="true">→</span></Link>
          </div>
          <SponsorPlacement sponsor={QUARTERLY_SPONSOR} />
        </div>
      </section>

      <section aria-labelledby="clubs-heading" className="bg-paper pb-12 md:pb-16">
        <div className="site-container">
          <div className="border-t border-gray-300 pt-10">
            <span className="section-marker" aria-hidden="true" />
            <h2 id="clubs-heading" className="home-heading">Clubs worth getting to know.</h2>
            <p className="mt-4 text-base font-semibold">Source-reviewed club profiles</p>
            <p className="mt-2 mb-7 max-w-3xl text-base leading-relaxed text-gray-700">Original summaries checked against named sources. Review scope is shown on each profile; current details still need confirmation.</p>
            <HomeClubList clubs={exploreClubs} />
          </div>
        </div>
      </section>

      <section aria-labelledby="guides-heading" className="bg-asphalt py-12 text-white md:py-16">
        <div className="site-container">
          <span className="section-marker" aria-hidden="true" />
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <h2 id="guides-heading" className="home-heading">Before you pull up.</h2>
            <Link href="/guides" className="inline-flex min-h-11 items-center gap-3 font-semibold text-orange-300 hover:underline">All rider guides <span aria-hidden="true">→</span></Link>
          </div>
          <div className="grid gap-10 md:grid-cols-3 md:gap-7">
            {homeGuides.map((guide) => (
              <article key={guide.slug}>
                <Link href={`/guides/${guide.slug}`} className="group block">
                  <div className="relative mb-5 aspect-[3/2] overflow-hidden bg-gray-800"><Image src={guideImages[guide.slug]} alt="" fill sizes="(max-width: 767px) 100vw, 33vw" className="object-cover transition-transform duration-300 group-hover:scale-105 motion-reduce:transform-none" /></div>
                  <p className="mb-2 text-sm text-gray-300">{guide.readingMinutes} min read</p>
                  <h3 className="font-display text-3xl font-bold group-hover:underline underline-offset-4">{guide.shortTitle}</h3>
                  <p className="mt-3 text-base leading-relaxed text-gray-300">{guide.description}</p>
                  <span className="mt-3 inline-flex min-h-11 items-center gap-3 font-semibold text-orange-300">Read guide <span aria-hidden="true">→</span></span>
                </Link>
              </article>
            ))}
          </div>
          <p className="mt-6 text-sm text-gray-400">Guide images are illustrative, not photos of listed clubs.</p>
        </div>
      </section>

      <AffiliateSection variant="strip" />

      <section aria-labelledby="directory-heading" className="bg-paper py-12 md:py-16">
        <div className="site-container grid gap-10 lg:grid-cols-[1.5fr_1fr] lg:gap-20">
          <div>
            <h2 id="directory-heading" className="font-display text-3xl font-bold sm:text-4xl">Choose the riding. Compare the commitment.</h2>
            <p className="mt-4 text-base leading-relaxed text-gray-700">A name, patch or Google rating cannot tell you whether a club fits your life. Start with the riding you want to do, then compare published activities, membership rules and the time you can commit.</p>
            <p className="mt-4 text-base leading-relaxed text-gray-700">Full profiles have source-reviewed summaries. Basic entries have not completed that review and may be incomplete or outdated. Neither is an endorsement or an invitation to a private clubhouse. A reviewed summary does not mean every address, phone number or Google rating has been reverified.</p>
            <div className="mt-4 flex flex-col items-start gap-1">
              <Link href="/about" className="home-link">How information is checked <span aria-hidden="true">→</span></Link>
              <Link href="/guides/how-to-verify-a-motorcycle-club" className="home-link">Check the club and chapter <span aria-hidden="true">→</span></Link>
              <Link href="/guides/how-to-join-a-motorcycle-club" className="home-link">First-contact checklist <span aria-hidden="true">→</span></Link>
            </div>
          </div>
          <div className="border-t border-gray-300 pt-7 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-10">
            <span className="section-marker" aria-hidden="true" />
            <h2 className="font-display text-3xl font-bold sm:text-4xl">Your club belongs here.</h2>
            <p className="mt-4 text-base leading-relaxed text-gray-700">Know a club that&apos;s not listed? Send its name, city, and a website or contact. We review every submission before it goes live. Corrections and basic listings are free.</p>
            <Link href="/submit" className="brand-button mt-6">Submit a club <span aria-hidden="true">↗</span></Link>
            <p className="mt-6 text-sm leading-relaxed text-gray-600">{stats.clubCount.toLocaleString()} directory entries · {stats.cityCount.toLocaleString()} cities on file</p>
          </div>
        </div>
      </section>
    </>
  );
}
