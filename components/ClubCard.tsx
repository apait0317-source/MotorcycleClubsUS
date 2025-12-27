'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Club } from '@/lib/types';
import { formatRating, formatReviews, capitalizeCity } from '@/lib/utils';
import Rating from './Rating';

interface ClubCardProps {
  club: Club;
}

export default function ClubCard({ club }: ClubCardProps) {
  const [imageError, setImageError] = useState(false);

  // Get image from images array if available, otherwise use featured_image
  const primaryImage = club.images?.find(img => img.isPrimary);
  const imageSrc = primaryImage
    ? `/images/clubs/${primaryImage.filename}`
    : club.featured_image;

  const hasImage = imageSrc && !imageError;

  // Check if image is local
  const isLocalImage = imageSrc?.startsWith('/images/');

  return (
    <Link href={`/clubs/${club.slug}`}>
      <article className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-300">
        {/* Image */}
        <div className="relative h-48 bg-gray-100">
          {hasImage ? (
            <Image
              src={imageSrc}
              alt={club.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              onError={() => setImageError(true)}
              unoptimized={!isLocalImage}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
              <svg className="w-16 h-16 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
              </svg>
            </div>
          )}
          {/* Category Badge */}
          {club.main_category && (
            <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-gray-700 text-xs font-medium px-2 py-1 rounded">
              {club.main_category}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-semibold text-lg text-gray-900 mb-1 line-clamp-1">
            {club.name}
          </h3>

          <p className="text-gray-500 text-sm mb-2">
            {capitalizeCity(club.City)}, {club.stateName}
          </p>

          {/* Rating */}
          <div className="flex items-center gap-2">
            <Rating rating={club.rating} />
            <span className="text-sm text-gray-500">
              {formatRating(club.rating)} ({formatReviews(club.reviews)})
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
