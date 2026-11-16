'use client';

import React from 'react';
import { m } from 'motion/react';
import { useSettings } from '@/lib/settings-context';
import { springSnappy, reducedTransition } from '@/lib/motion-tokens';

interface StaggerProps {
  children: React.ReactNode;
  className?: string;
}

export function Stagger({ children, className = '' }: StaggerProps) {
  return <div className={className}>{children}</div>;
}

interface StaggerItemProps {
  children: React.ReactNode;
  index: number;
  className?: string;
  /** Maximum number of items with staggered delay (default: 8) */
  maxStaggerCount?: number;
  /** Delay per staggered item in seconds (default: 0.035 = 35ms) */
  staggerStep?: number;
}

export function StaggerItem({
  children,
  index,
  className = '',
  maxStaggerCount = 8,
  staggerStep = 0.035,
}: StaggerItemProps) {
  const { reduceMotion } = useSettings();

  // Cap staggered delay to the first maxStaggerCount items (e.g. 8 items * 35ms = 280ms max)
  const effectiveIndex = Math.min(index, maxStaggerCount);
  const delay = reduceMotion ? 0 : effectiveIndex * staggerStep;

  return (
    <m.div
      initial={
        reduceMotion
          ? { opacity: 0 }
          : { opacity: 0, y: 16 }
      }
      animate={{ opacity: 1, y: 0 }}
      transition={
        reduceMotion
          ? { ...reducedTransition, delay: 0 }
          : { ...springSnappy, delay }
      }
      className={className}
    >
      {children}
    </m.div>
  );
}
