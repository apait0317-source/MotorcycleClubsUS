import { AFFILIATE_PLACEMENTS, AFFILIATE_PRODUCTS, type AffiliateCategory, type AffiliatePlacement } from './affiliates';

export type MonetizationInteraction =
  | { name: 'affiliate_click'; placement: AffiliatePlacement; category: AffiliateCategory }
  | { name: 'sponsor_click'; placement: 'home_sponsor' };

type Send = (name: string, params: Record<string, string>) => void;

// These are outbound intent events, never purchase conversions or ad clicks.
export function emitMonetizationInteraction(event: MonetizationInteraction, send?: Send): void {
  if (!event) return;
  let params: Record<string, string>;
  if (event.name === 'affiliate_click') {
    if (!AFFILIATE_PLACEMENTS.includes(event.placement)
      || !AFFILIATE_PRODUCTS.some(product => product.category === event.category)) return;
    params = { placement: event.placement, category: event.category, merchant: 'amazon' };
  } else if (event.name === 'sponsor_click' && event.placement === 'home_sponsor') {
    params = { placement: event.placement };
  } else return;

  try {
    if (send) send(event.name, params);
    else if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID) {
      const gtag = (window as Window & { gtag?: (...args: unknown[]) => void }).gtag;
      if (typeof gtag === 'function') gtag('event', event.name, params);
    }
  } catch { /* Analytics must never prevent following a shopping or sponsor link. */ }
}
