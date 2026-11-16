'use client';

import React from 'react';
import { SettingsProvider } from '@/lib/settings-context';
import { MotionRoot } from '@/components/motion/MotionRoot';
import { ToastProvider } from '@/components/ui/Toast';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <SettingsProvider>
      <MotionRoot>
        <ToastProvider>{children}</ToastProvider>
      </MotionRoot>
    </SettingsProvider>
  );
}
