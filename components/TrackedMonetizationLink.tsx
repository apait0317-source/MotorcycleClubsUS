'use client';

import type { AnchorHTMLAttributes, MouseEvent } from 'react';
import { emitMonetizationInteraction, type MonetizationInteraction } from '@/lib/monetization-analytics';

interface Props extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  interaction: MonetizationInteraction;
}

export default function TrackedMonetizationLink({ interaction, onClick, onAuxClick, ...props }: Props) {
  const track = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    if (!event.defaultPrevented && event.button === 0) emitMonetizationInteraction(interaction);
  };
  const trackMiddleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onAuxClick?.(event);
    if (!event.defaultPrevented && event.button === 1) emitMonetizationInteraction(interaction);
  };
  return <a {...props} onClick={track} onAuxClick={trackMiddleClick} />;
}
