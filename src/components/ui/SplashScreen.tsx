'use client';

import React, { useState, useEffect } from 'react';
import { AnimatePresence, m } from 'motion/react';
import { CoachMascot } from './CoachMascot';
import { Zap } from 'lucide-react';
import { useSettings } from '@/lib/settings-context';
import { springSnappy, reducedTransition } from '@/lib/motion-tokens';

export function SplashScreen() {
  const { reduceMotion } = useSettings();
  const [show, setShow] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Show only once per browser session and never in reduceMotion mode
    const hasShown = sessionStorage.getItem('bs_splash_seen');
    if (!hasShown && !reduceMotion) {
      setShow(true);
      sessionStorage.setItem('bs_splash_seen', 'true');

      // Max 950ms splash screen duration
      const timer = setTimeout(() => {
        setShow(false);
      }, 950);

      return () => clearTimeout(timer);
    }
  }, [reduceMotion]);

  if (!show) return null;

  return (
    <AnimatePresence>
      <m.div
        key="splash"
        initial={{ opacity: 1 }}
        exit={{ opacity: 0, scale: 1.04 }}
        transition={reduceMotion ? reducedTransition : { duration: 0.25, ease: 'easeOut' }}
        onClick={() => setShow(false)}
        className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#101436] p-6 select-none cursor-pointer"
      >
        <m.div
          initial={{ scale: 0.8, y: 15 }}
          animate={{ scale: 1, y: 0 }}
          transition={springSnappy}
          className="flex flex-col items-center space-y-4"
        >
          <div className="relative">
            <CoachMascot mood="pumped" size={100} animated={false} />
            <m.div
              animate={{ rotate: [0, 360] }}
              transition={{ repeat: Infinity, duration: 4, ease: 'linear' }}
              className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-[#ffc700] border-2 border-[#070b16] flex items-center justify-center text-[#070b16]"
            >
              <Zap className="w-4 h-4 fill-[#070b16]" />
            </m.div>
          </div>

          <div className="text-center">
            <h1 className="font-cartoon text-3xl sm:text-4xl text-white tracking-wider text-stroke-sm">
              BS HELPER
            </h1>
            <span className="px-2.5 py-0.5 rounded-lg text-xs font-cartoon uppercase bg-[#ffc700] text-[#070b16] border-2 border-[#070b16] shadow-[0_2px_0_#070b16] inline-block mt-1">
              PRO EDITION
            </span>
          </div>

          {/* Quick loading pill */}
          <div className="w-36 h-2 bg-[#090d1f] rounded-full border border-white/10 overflow-hidden relative">
            <m.div
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 0.9, ease: 'easeInOut' }}
              className="h-full bg-gradient-to-r from-[#ffc700] to-[#42eeff] rounded-full"
            />
          </div>
        </m.div>
      </m.div>
    </AnimatePresence>
  );
}
