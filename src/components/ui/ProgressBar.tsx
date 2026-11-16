'use client';

import React from 'react';
import { m } from 'motion/react';
import { useSettings } from '@/lib/settings-context';
import { springBouncy, reducedTransition } from '@/lib/motion-tokens';

interface ProgressBarProps {
  value: number; // 0 to 100
  label?: string;
  subLabel?: string;
  color?: 'yellow' | 'cyan' | 'green' | 'purple' | 'red';
  height?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  className?: string;
}

export function ProgressBar({
  value,
  label,
  subLabel,
  color = 'yellow',
  height = 'md',
  animated = true,
  className = '',
}: ProgressBarProps) {
  const { reduceMotion } = useSettings();
  const clampedValue = Math.min(100, Math.max(0, value));

  const heightClasses = {
    sm: 'h-3.5',
    md: 'h-5',
    lg: 'h-6',
  }[height];

  const colorClasses = {
    yellow: 'bg-gradient-to-r from-[#ffdc2e] to-[#ff9900]',
    cyan: 'bg-gradient-to-r from-[#42eeff] to-[#00b8db]',
    green: 'bg-gradient-to-r from-[#4ade80] to-[#16a34a]',
    purple: 'bg-gradient-to-r from-[#c084fc] to-[#9333ea]',
    red: 'bg-gradient-to-r from-[#f87171] to-[#dc2626]',
  }[color];

  return (
    <div className={`w-full ${className}`}>
      {(label || subLabel) && (
        <div className="flex items-center justify-between text-xs font-bold mb-1.5 px-0.5">
          {label && <span className="text-slate-200">{label}</span>}
          {subLabel && <span className="text-yellow-400 font-cartoon">{subLabel}</span>}
        </div>
      )}

      <div
        className={`w-full ${heightClasses} bg-[#0b0f24] rounded-full border-2 border-[#070b16] shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)] overflow-hidden p-0.5 relative`}
      >
        <m.div
          initial={reduceMotion ? { width: `${clampedValue}%` } : { width: 0 }}
          animate={{ width: `${clampedValue}%` }}
          transition={
            reduceMotion
              ? reducedTransition
              : { ...springBouncy, duration: 0.8 }
          }
          className={`h-full rounded-full relative ${colorClasses} ${
            animated && !reduceMotion ? 'brawl-progress-striped' : ''
          }`}
        >
          {/* Top highlight bar */}
          <div className="absolute top-0 left-0 right-0 h-1/3 bg-white/30 rounded-t-full pointer-events-none" />
        </m.div>
      </div>
    </div>
  );
}
