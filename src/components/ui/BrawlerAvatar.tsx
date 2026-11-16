'use client';

import React, { useState } from 'react';
import Image from 'next/image';

interface BrawlerAvatarProps {
  id: number;
  name: string;
  power?: number;
  rarityColor?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  hasHypercharge?: boolean;
  className?: string;
}

export function BrawlerAvatar({
  id,
  name,
  power,
  rarityColor = '#5AB3FF', // Default Super Rare fallback
  size = 'md',
  hasHypercharge = false,
  className = '',
}: BrawlerAvatarProps) {
  const [imgError, setImgError] = useState(false);

  const sizeClasses = {
    sm: 'w-10 h-10 rounded-xl',
    md: 'w-14 h-14 rounded-2xl',
    lg: 'w-18 h-18 rounded-2xl',
    xl: 'w-24 h-24 rounded-3xl',
  }[size];

  const powerBadgeSize = {
    sm: 'text-[8px] px-1 py-0.2',
    md: 'text-[9px] px-1.5 py-0.5',
    lg: 'text-[11px] px-2 py-0.5',
    xl: 'text-xs px-2.5 py-1',
  }[size];

  const imageSrc = imgError
    ? 'https://cdn.brawlify.com/brawlers/emoji/16000000.png'
    : `https://cdn.brawlify.com/brawlers/borderless/${id}.png`;

  return (
    <div
      style={{ borderColor: rarityColor }}
      className={`relative ${sizeClasses} bg-[#0c1228] border-3 border-[#070b16] shadow-[0_4px_0_#070b16] shrink-0 overflow-hidden flex items-center justify-center ${className}`}
    >
      <Image
        src={imageSrc}
        alt={name}
        fill
        sizes="(max-width: 768px) 64px, 96px"
        onError={() => setImgError(true)}
        className="object-cover select-none pointer-events-none transition-transform duration-200 group-hover:scale-110"
        unoptimized
      />

      {/* Top highlight shine */}
      <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-white/20 to-transparent pointer-events-none z-10" />

      {/* Power Level Badge */}
      {power !== undefined && (
        <span
          className={`absolute bottom-0 right-0 bg-[#070b16] text-[#ffc700] font-cartoon font-black ${powerBadgeSize} rounded-tl-lg border-t-2 border-l-2 border-[#ffc700]/60 z-20`}
        >
          P{power}
        </span>
      )}

      {/* Hypercharge indicator */}
      {hasHypercharge && (
        <span
          title="Hypercharge débloquée"
          className="absolute top-0 right-0 w-3 h-3 bg-[#a855f7] border border-[#070b16] rounded-bl-md shadow-[0_0_6px_#a855f7] z-20"
        />
      )}
    </div>
  );
}
