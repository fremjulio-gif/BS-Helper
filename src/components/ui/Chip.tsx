'use client';

import React from 'react';
import { Pressable } from '@/components/motion/Pressable';
import { useSettings } from '@/lib/settings-context';
import { soundManager } from '@/lib/sound-manager';

interface ChipProps {
  label: string;
  count?: number | string;
  icon?: React.ReactNode;
  active: boolean;
  onClick: () => void;
  tone?: 'yellow' | 'cyan' | 'red' | 'purple';
  className?: string;
}

export function Chip({
  label,
  count,
  icon,
  active,
  onClick,
  tone = 'yellow',
  className = '',
}: ChipProps) {
  const { sound } = useSettings();

  const activeStyles = {
    yellow: 'bg-gradient-to-b from-[#ffdc2e] to-[#ffaa00] text-[#070b16] border-[#070b16] shadow-[0_4px_0_#070b16]',
    cyan: 'bg-gradient-to-b from-[#42eeff] to-[#00b8db] text-[#070b16] border-[#070b16] shadow-[0_4px_0_#070b16]',
    red: 'bg-gradient-to-b from-[#f87171] to-[#dc2626] text-white border-[#070b16] shadow-[0_4px_0_#070b16]',
    purple: 'bg-gradient-to-b from-[#c084fc] to-[#9333ea] text-white border-[#070b16] shadow-[0_4px_0_#070b16]',
  }[tone];

  const inactiveStyle =
    'bg-[#121838] hover:bg-[#1a234f] text-slate-300 border-2 border-[#070b16] shadow-[0_3px_0_#070b16]';

  const handleClick = () => {
    if (sound) {
      soundManager.playTap();
    }
    onClick();
  };

  return (
    <Pressable
      onClick={handleClick}
      className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs sm:text-sm font-cartoon tracking-wide uppercase flex items-center justify-center gap-2 cursor-pointer ${
        active ? activeStyles : inactiveStyle
      } ${className}`}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{label}</span>
      {count !== undefined && (
        <span
          className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
            active ? 'bg-black/25 text-inherit' : 'bg-white/10 text-slate-300'
          }`}
        >
          {count}
        </span>
      )}
    </Pressable>
  );
}
