'use client';

import React from 'react';
import Image from 'next/image';
import { GameModeMeta } from '@/types/brawlstars';
import { resolveGameMode } from '@/lib/gamemodes-service';
import { Swords, Compass } from 'lucide-react';

interface GameModeBadgeProps {
  mode: string;
  dictionary?: Record<string, GameModeMeta> | null;
  size?: 'sm' | 'md' | 'lg';
  showIconOnly?: boolean;
  className?: string;
}

export function GameModeBadge({
  mode,
  dictionary,
  size = 'md',
  showIconOnly = false,
  className = '',
}: GameModeBadgeProps) {
  const meta = resolveGameMode(mode, dictionary);

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1.5',
    md: 'text-xs px-2.5 py-1 gap-2',
    lg: 'text-sm px-3 py-1.5 gap-2.5',
  }[size];

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24,
  }[size];

  return (
    <div
      className={`inline-flex items-center rounded-xl font-cartoon uppercase select-none border-2 border-[#070b16] shadow-[0_2px_0_#070b16] ${
        meta.color
          ? 'text-white'
          : 'bg-[#ffc700] text-[#070b16]'
      } ${sizeClasses} ${className}`}
      style={{
        backgroundColor: meta.bgColor || (meta.color ? `${meta.color}dd` : undefined),
      }}
      title={meta.description || meta.name}
    >
      {/* Icon: official CDN image or neutral fallback */}
      {meta.imageUrl ? (
        <div
          className="relative shrink-0 flex items-center justify-center"
          style={{ width: iconSizes, height: iconSizes }}
        >
          <Image
            src={meta.imageUrl}
            alt={meta.name}
            width={iconSizes}
            height={iconSizes}
            className="object-contain"
            unoptimized
          />
        </div>
      ) : (
        <div className="shrink-0 flex items-center justify-center">
          {mode.toLowerCase().includes('showdown') ? (
            <Compass className="w-3.5 h-3.5" />
          ) : (
            <Swords className="w-3.5 h-3.5" />
          )}
        </div>
      )}

      {!showIconOnly && <span className="leading-none tracking-wide">{meta.name}</span>}
    </div>
  );
}
