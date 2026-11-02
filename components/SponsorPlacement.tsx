import { isValidSponsor, type QuarterlySponsor } from '@/lib/sponsors';

export default function SponsorPlacement({ sponsor }: { sponsor: QuarterlySponsor | null }) {
  if (!isValidSponsor(sponsor)) return null;
  return (
    <aside className="bg-asphalt p-6 text-white" aria-label="Paid sponsorship">
      <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-orange-300">Paid sponsorship</p>
      <h3 className="font-display text-3xl font-bold">{sponsor.name}</h3>
      <p className="my-3 text-base leading-relaxed text-gray-300">{sponsor.message}</p>
      <a className="inline-flex min-h-11 items-center gap-3 underline underline-offset-4" href={sponsor.href} target="_blank" rel="noopener noreferrer sponsored">
        Visit sponsor <span aria-hidden="true">↗</span>
      </a>
    </aside>
  );
}
