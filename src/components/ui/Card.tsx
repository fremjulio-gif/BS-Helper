'use client';

import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  topHighlight?: boolean;
  glow?: 'none' | 'yellow' | 'cyan' | 'purple' | 'red';
  onClick?: () => void;
}

export function Card({
  children,
  className = '',
  topHighlight = true,
  glow = 'none',
  onClick,
}: CardProps) {
  const glowStyle = {
    none: '',
    yellow: 'shadow-[0_6px_0_#070b16,0_0_20px_rgba(255,199,0,0.25)]',
    cyan: 'shadow-[0_6px_0_#070b16,0_0_20px_rgba(0,217,255,0.25)]',
    purple: 'shadow-[0_6px_0_#070b16,0_0_20px_rgba(168,85,247,0.25)]',
    red: 'shadow-[0_6px_0_#070b16,0_0_20px_rgba(239,68,68,0.25)]',
  }[glow];

  return (
    <div
      onClick={onClick}
      className={`brawl-card ${topHighlight ? 'brawl-card-toplight' : ''} ${glowStyle} p-4 sm:p-5 ${
        onClick ? 'cursor-pointer hover:-translate-y-0.5 transition-transform' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
}
