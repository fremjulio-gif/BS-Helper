'use client';

import React from 'react';
import { CoachMascot, MascotMood } from './CoachMascot';
import { Button } from './Button';
import { RotateCcw } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  mood?: MascotMood;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
}

export function EmptyState({
  title,
  description,
  mood = 'neutral',
  onRetry,
  retryLabel = 'Réessayer',
  className = '',
}: EmptyStateProps) {
  return (
    <div
      className={`brawl-card p-8 sm:p-12 flex flex-col items-center text-center max-w-lg mx-auto ${className}`}
    >
      <CoachMascot mood={mood} size={84} className="mb-4" />
      <h3 className="font-cartoon text-xl sm:text-2xl text-white mb-2">{title}</h3>
      <p className="text-sm text-slate-300 max-w-sm mb-6 leading-relaxed">{description}</p>
      {onRetry && (
        <Button variant="yellow" icon={<RotateCcw className="w-4 h-4" />} onClick={onRetry}>
          {retryLabel}
        </Button>
      )}
    </div>
  );
}
