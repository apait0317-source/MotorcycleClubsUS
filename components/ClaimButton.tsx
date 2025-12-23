'use client';

import Link from 'next/link';

interface ClaimButtonProps {
  clubSlug: string;
  isVerified?: boolean;
  isClaimed?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function ClaimButton({
  clubSlug,
  isVerified = false,
  isClaimed = false,
  size = 'md',
}: ClaimButtonProps) {
  if (isVerified || isClaimed) {
    return (
      <div className={`flex items-center gap-2 ${
        size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-base' : 'text-sm'
      }`}>
        <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
        </svg>
        <span className="text-blue-600 font-medium">Verified</span>
      </div>
    );
  }

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  return (
    <Link
      href={`/claim/${clubSlug}`}
      className={`inline-flex items-center gap-1.5 ${sizeClasses[size]} border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition`}
    >
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M14.4 6L14 4H5v17h2v-7h5.6l.4 2h7V6h-5.6z" />
      </svg>
      Claim This Club
    </Link>
  );
}
