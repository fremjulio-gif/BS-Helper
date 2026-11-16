'use client';

import confetti from 'canvas-confetti';

export function triggerTrophyConfetti() {
  if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }

  try {
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#FFC700', '#00D9FF', '#22C55E', '#A855F7', '#FFFFFF'],
      disableForReducedMotion: true,
    });
  } catch {
    // Confetti failure ignored
  }
}
