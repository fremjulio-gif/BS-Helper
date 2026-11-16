'use client';

import React from 'react';
import { m } from 'motion/react';
import { useSettings } from '@/lib/settings-context';
import { springGentle, reducedTransition } from '@/lib/motion-tokens';

interface RevealProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  yOffset?: number;
}

export function Reveal({
  children,
  delay = 0,
  className = '',
  yOffset = 16,
}: RevealProps) {
  const { reduceMotion } = useSettings();

  return (
    <m.div
      initial={
        reduceMotion
          ? { opacity: 0 }
          : { opacity: 0, y: yOffset }
      }
      animate={{ opacity: 1, y: 0 }}
      transition={
        reduceMotion
          ? { ...reducedTransition, delay }
          : { ...springGentle, delay }
      }
      className={className}
    >
      {children}
    </m.div>
  );
}
