import Image from 'next/image';
import type { ReactNode } from 'react';

export default function HomeHero({ children }: { children: ReactNode }) {
  return (
    <section aria-label="Find motorcycle clubs" className="bg-asphalt">
      <div className="relative isolate overflow-hidden text-white">
        <Image src="/images/home/motorcycle-hero.webp" alt="" fill priority sizes="100vw" className="-z-20 object-cover object-[62%_48%] md:object-[center_48%]" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black/85 via-black/55 to-black/15 md:via-black/25" />
        <div className="site-container relative py-16 md:py-20 lg:py-24">
          <p className="mb-5 text-sm font-bold uppercase tracking-[0.12em] text-orange-300">The independent club directory</p>
          <h1 className="max-w-3xl font-display text-[clamp(3.4rem,7.8vw,7rem)] leading-[0.91] font-extrabold uppercase tracking-tight">
            Your next<br />ride starts<br />with people.
          </h1>
          <p className="mt-7 max-w-lg text-lg leading-relaxed text-gray-200 md:text-xl">Motorcycle clubs and riding groups. Find one near you.</p>
          <p className="mt-8 text-sm text-gray-300 md:absolute md:right-8 md:bottom-4 md:mt-0">Illustrative image</p>
        </div>
      </div>
      <div className="bg-silver py-6 text-asphalt sm:py-8"><div className="site-container">{children}</div></div>
    </section>
  );
}
