'use client';

import React from 'react';
import { LazyMotion, domAnimation, MotionConfig } from 'motion/react';
import { useSettings } from '@/lib/settings-context';

export function MotionRoot({ children }: { children: React.ReactNode }) {
  const { reduceMotion } = useSettings();

  return (
    <LazyMotion features={domAnimation} strict={false}>
      <MotionConfig reducedMotion={reduceMotion ? 'always' : 'user'}>
        {children}
      </MotionConfig>
    </LazyMotion>
  );
}
