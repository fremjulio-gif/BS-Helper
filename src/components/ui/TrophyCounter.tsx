'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Trophy } from 'lucide-react';

interface TrophyCounterProps {
  value: number;
  label?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showIcon?: boolean;
  className?: string;
}

export function TrophyCounter({
  value,
  label,
  size = 'md',
  showIcon = true,
  className = '',
}: TrophyCounterProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const prevValueRef = useRef(value);

  useEffect(() => {
    // Check prefers-reduced-motion
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDisplayValue(value);
      prevValueRef.current = value;
      return;
    }

    const start = prevValueRef.current;
    const end = value;
    if (start === end) return;

    const duration = 800; // ms
    const startTime = performance.now();

    const update = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      // Ease out cubic
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + (end - start) * ease);
      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        prevValueRef.current = end;
      }
    };

    requestAnimationFrame(update);
  }, [value]);

  const sizeClasses = {
    sm: 'text-base sm:text-lg',
    md: 'text-xl sm:text-2xl',
    lg: 'text-3xl sm:text-4xl',
    xl: 'text-4xl sm:text-5xl',
  }[size];

  const iconSize = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-7 h-7',
    xl: 'w-9 h-9',
  }[size];

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      {showIcon && (
        <div className="p-1.5 rounded-xl bg-[#ffc700] border-2 border-[#070b16] shadow-[0_3px_0_#070b16] text-[#070b16]">
          <Trophy className={`${iconSize} fill-[#070b16]`} />
        </div>
      )}
      <div className="flex flex-col">
        {label && (
          <span className="text-[10px] font-black uppercase tracking-wider text-yellow-300/80 leading-none">
            {label}
          </span>
        )}
        <span className={`font-cartoon text-[#ffc700] text-stroke-sm tracking-wide leading-none ${sizeClasses}`}>
          {displayValue.toLocaleString()}
        </span>
      </div>
    </div>
  );
}
