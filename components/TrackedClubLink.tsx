'use client';

import Link from 'next/link';
import type { AnchorHTMLAttributes, MouseEvent } from 'react';
import { emitClubInteraction, type ClubInteraction } from '@/lib/analytics';

interface Props extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  interaction: ClubInteraction;
}

export default function TrackedClubLink({ href, interaction, onClick, ...props }: Props) {
  const track = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    if (!event.defaultPrevented) emitClubInteraction(interaction);
  };
  return href.startsWith('/') ? <Link {...props} href={href} onClick={track} /> : <a {...props} href={href} onClick={track} />;
}
