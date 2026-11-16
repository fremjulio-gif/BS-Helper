'use client';

import React, { useEffect, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { soundManager } from '@/lib/sound-manager';

export function SoundToggle({ className = '' }: { className?: string }) {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    setEnabled(soundManager.getSoundEnabled());
  }, []);

  const handleToggle = () => {
    const nextState = !enabled;
    soundManager.setSoundEnabled(nextState);
    setEnabled(nextState);
  };

  return (
    <button
      onClick={handleToggle}
      title={enabled ? 'Désactiver les sons' : 'Activer les sons arcade'}
      className={`min-w-[40px] min-h-[40px] px-2.5 py-1.5 rounded-xl border-2 border-[#070b16] shadow-[0_3px_0_#070b16] transition-transform active:translate-y-1 flex items-center justify-center cursor-pointer ${
        enabled
          ? 'bg-[#22c55e] text-[#070b16]'
          : 'bg-[#182046] hover:bg-[#202b5e] text-slate-400'
      } ${className}`}
    >
      {enabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
    </button>
  );
}
