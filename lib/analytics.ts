import { CLUB_KINDS, RIDING_ACTIVITIES, type ClubKind, type RidingActivity } from './types';

type MarketId = 'sf-bay-area';
type Surface = 'comparison' | 'profile' | 'card';
type ClubClick = { clubId: string; marketId?: MarketId; surface: Surface };
type FilterChange = { marketId: MarketId; kind?: ClubKind; activity?: RidingActivity; resultCount: number; surface: 'comparison' };
export type ClubInteraction =
  | ({ name: 'club_profile_open' } & ClubClick)
  | ({ name: 'club_official_contact' } & ClubClick)
  | ({ name: 'club_filter_change' } & FilterChange)
  | ({ name: 'club_filter_empty' } & FilterChange);

export function emitClubInteraction(event: ClubInteraction, send?: (name: string, params: Record<string, string | number>) => void): void {
  if (!event || !['club_profile_open', 'club_official_contact', 'club_filter_change', 'club_filter_empty'].includes(event.name)) return;
  if (!['comparison', 'profile', 'card'].includes(event.surface)) return;
  if (event.marketId !== undefined && event.marketId !== 'sf-bay-area') return;
  const params: Record<string, string | number> = { surface: event.surface };
  if (event.marketId) params.market_id = event.marketId;
  if (event.name === 'club_profile_open' || event.name === 'club_official_contact') {
    if (typeof event.clubId !== 'string' || !/^[a-zA-Z0-9_:-]{1,128}$/.test(event.clubId)) return;
    params.club_id = event.clubId;
  } else {
    if (!event.marketId || event.surface !== 'comparison' || !Number.isInteger(event.resultCount) || event.resultCount < 0 || event.resultCount > 10000) return;
    if (event.name === 'club_filter_empty' && event.resultCount !== 0) return;
    if (event.kind !== undefined && !(CLUB_KINDS as readonly unknown[]).includes(event.kind)) return;
    if (event.activity !== undefined && !(RIDING_ACTIVITIES as readonly unknown[]).includes(event.activity)) return;
    if (event.kind) params.club_kind = event.kind;
    if (event.activity) params.activity = event.activity;
    params.result_count = event.resultCount;
  }
  try {
    if (send) send(event.name, params);
    else if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID) {
      const gtag = (window as Window & { gtag?: (...args: unknown[]) => void }).gtag;
      if (typeof gtag === 'function') gtag('event', event.name, params);
    }
  } catch { /* Measurement must not interrupt a reader's action. */ }
}
