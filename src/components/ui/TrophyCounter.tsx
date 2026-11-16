'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Trophy, ArrowUp, ArrowDown } from 'lucide-react';
import { AnimatePresence, m } from 'motion/react';
import { useSettings } from '@/lib/settings-context';
import { springBouncy } from '@/lib/motion-tokens';

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
  const { reduceMotion } = useSettings();
  const [displayValue, setDisplayValue] = useState(value);
  const [floatingDelta, setFloatingDelta] = useState<number | null>(null);
  const prevValueRef = useRef(value);
  const deltaTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const start = prevValueRef.current;
    const end = value;

    if (start !== end) {
      const diff = end - start;

      // Add to running delta or start new one
      setFloatingDelta((prev) => (prev !== null ? prev + diff : diff));

      // Reset timer to auto-hide delta after 3.2s
      if (deltaTimeoutRef.current) clearTimeout(deltaTimeoutRef.current);
      deltaTimeoutRef.current = setTimeout(() => {
        setFloatingDelta(null);
      }, 3200);
    }

    if (reduceMotion) {
      setDisplayValue(value);
      prevValueRef.current = value;
      return;
    }

    if (start === end) return;

    const duration = 750; // ms
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

    return () => {
      if (deltaTimeoutRef.current) clearTimeout(deltaTimeoutRef.current);
    };
  }, [value, reduceMotion]);

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
    <div className={`relative inline-flex items-center gap-2 ${className}`}>
      {showIcon && (
        <div className="p-1.5 rounded-xl bg-[#ffc700] border-2 border-[#070b16] shadow-[0_3px_0_#070b16] text-[#070b16] shrink-0">
          <Trophy className={`${iconSize} fill-[#070b16]`} />
        </div>
      )}
      <div className="flex flex-col relative">
        {label && (
          <span className="text-[10px] font-black uppercase tracking-wider text-yellow-300/80 leading-none">
            {label}
          </span>
        )}
        <span
          className={`font-cartoon text-[#ffc700] text-stroke-sm tracking-wide leading-none ${sizeClasses}`}
        >
          {displayValue.toLocaleString()}
        </span>

        {/* Floating delta pill */}
        <AnimatePresence>
          {floatingDelta !== null && floatingDelta !== 0 && (
            <m.div
              initial={
                reduceMotion
                  ? { opacity: 0 }
                  : { opacity: 0, y: 10, scale: 0.8 }
              }
              animate={{ opacity: 1, y: -24, scale: 1 }}
              exit={
                reduceMotion
                  ? { opacity: 0 }
                  : { opacity: 0, y: -36, scale: 0.85 }
              }
              transition={reduceMotion ? { duration: 0.15 } : springBouncy}
              className={`absolute -top-3 right-0 z-30 flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-cartoon border-2 border-[#070b16] shadow-[0_2px_0_#070b16] select-none ${
                floatingDelta > 0
                  ? 'bg-[#22c55e] text-[#070b16]'
                  : 'bg-[#ef4444] text-white'
              }`}
            >
              {floatingDelta > 0 ? (
                <ArrowUp className="w-3 h-3 stroke-[3px]" />
              ) : (
                <ArrowDown className="w-3 h-3 stroke-[3px]" />
              )}
              <span>
                {floatingDelta > 0 ? `+${floatingDelta}` : floatingDelta}
              </span>
            </m.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
