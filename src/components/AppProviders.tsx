'use client';

import React from 'react';
import { SettingsProvider } from '@/lib/settings-context';
import { MotionRoot } from '@/components/motion/MotionRoot';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <SettingsProvider>
      <MotionRoot>{children}</MotionRoot>
    </SettingsProvider>
  );
}
