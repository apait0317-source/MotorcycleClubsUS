export interface QuarterlySponsor {
  name: string;
  href: string;
  message: string;
}

// Set only for a booked partnership; renew or remove during the quarterly review.
export const QUARTERLY_SPONSOR: QuarterlySponsor | null = null;

export function isValidSponsor(sponsor: QuarterlySponsor | null): sponsor is QuarterlySponsor {
  if (!sponsor?.name.trim() || !sponsor.message.trim()) return false;
  try {
    const url = new URL(sponsor.href);
    return url.protocol === 'https:' && Boolean(url.hostname) && !url.username && !url.password;
  } catch {
    return false;
  }
}
