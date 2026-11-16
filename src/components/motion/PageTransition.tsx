'use client';

import React, { useRef, useEffect } from 'react';
import { AnimatePresence, m } from 'motion/react';
import { useSettings } from '@/lib/settings-context';
import { transitionTab, reducedTransition } from '@/lib/motion-tokens';
import { TabType } from '@/components/BottomNav';

interface PageTransitionProps {
  currentTab: TabType;
  direction: number; // +1 if moving forward/right, -1 if moving backward/left, 0 if initial
  children: React.ReactNode;
}

export function PageTransition({
  currentTab,
  direction,
  children,
}: PageTransitionProps) {
  const { reduceMotion } = useSettings();
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollPositionsRef = useRef<Partial<Record<TabType, number>>>({});
  const prevTabRef = useRef<TabType>(currentTab);

  // Manage scroll position restoration & save
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Save previous tab scroll position
    const prevTab = prevTabRef.current;
    if (prevTab && prevTab !== currentTab) {
      scrollPositionsRef.current[prevTab] = window.scrollY;
    }

    // Restore target tab scroll position or scroll to top
    const targetScroll = scrollPositionsRef.current[currentTab] ?? 0;
    window.scrollTo({ top: targetScroll, behavior: 'instant' });

    prevTabRef.current = currentTab;
  }, [currentTab]);

  const variants = {
    initial: (dir: number) => ({
      opacity: 0,
      x: reduceMotion ? 0 : dir >= 0 ? 28 : -28,
    }),
    animate: {
      opacity: 1,
      x: 0,
    },
    exit: (dir: number) => ({
      opacity: 0,
      x: reduceMotion ? 0 : dir >= 0 ? -28 : 28,
    }),
  };

  return (
    <AnimatePresence mode="wait" custom={direction} initial={false}>
      <m.div
        key={currentTab}
        ref={containerRef}
        custom={direction}
        variants={variants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={reduceMotion ? reducedTransition : transitionTab}
        tabIndex={-1}
        onAnimationComplete={() => {
          containerRef.current?.focus({ preventScroll: true });
        }}
        className="w-full focus:outline-none"
      >
        {children}
      </m.div>
    </AnimatePresence>
  );
}
