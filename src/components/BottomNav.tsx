'use client';

import React from 'react';
import { BarChart3, Trophy, Compass, Swords, BotMessageSquare } from 'lucide-react';
import { m } from 'motion/react';
import { useSettings } from '@/lib/settings-context';
import { springSnappy } from '@/lib/motion-tokens';
import { soundManager } from '@/lib/sound-manager';
import { GlassSurface } from './ui/GlassSurface';

export type TabType = 'overview' | 'trophies' | 'maps' | 'battles' | 'coach';

interface BottomNavProps {
  currentTab: TabType;
  onChangeTab: (tab: TabType) => void;
  easyCount?: number;
}

export function BottomNav({ currentTab, onChangeTab, easyCount = 0 }: BottomNavProps) {
  const { sound, haptics, reduceMotion } = useSettings();

  const tabs = [
    { id: 'overview', label: 'Stats', icon: BarChart3 },
    { id: 'trophies', label: 'Rush', icon: Trophy, badge: easyCount > 0 ? easyCount : undefined },
    { id: 'maps', label: 'Maps', icon: Compass },
    { id: 'battles', label: 'Matchs', icon: Swords },
    { id: 'coach', label: 'Coach', icon: BotMessageSquare, highlight: true },
  ];

  const handleTabClick = (tabId: TabType) => {
    if (sound) {
      soundManager.playTap();
    }
    if (haptics && typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      // Future haptic hook point
    }
    onChangeTab(tabId);
  };

  return (
    <div className="fixed bottom-[max(0.75rem,env(safe-area-inset-bottom))] left-3 right-3 z-50 md:hidden pointer-events-none flex justify-center">
      <GlassSurface
        level="subtle"
        floating
        className="w-full max-w-md px-2 py-1.5 rounded-3xl pointer-events-auto shadow-[0_8px_32px_rgba(0,0,0,0.45)]"
      >
        <nav className="flex items-center justify-around relative">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id as TabType)}
                className={`relative flex flex-col items-center justify-center py-1.5 px-2.5 rounded-2xl min-h-[46px] min-w-[54px] cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 transition-colors ${
                  isActive ? 'text-[#070b16]' : 'text-slate-300 hover:text-white'
                }`}
              >
                {/* Animated active pill with unique mobile layoutId */}
                {isActive && (
                  <m.div
                    layoutId="bottomNavActiveIndicator"
                    transition={reduceMotion ? { duration: 0.1 } : springSnappy}
                    className="absolute inset-0 bg-gradient-to-b from-[#ffdc2e] to-[#ffaa00] border-2 border-[#070b16] shadow-[0_2px_0_#070b16] rounded-2xl -z-10"
                  />
                )}

                {/* Bouncing icon on tab switch */}
                <m.div
                  animate={
                    isActive && !reduceMotion
                      ? { scale: [1, 1.2, 1], y: [0, -2, 0] }
                      : { scale: 1, y: 0 }
                  }
                  transition={springSnappy}
                  className="relative flex items-center justify-center"
                >
                  <Icon
                    className={`w-5 h-5 ${
                      isActive
                        ? 'stroke-[2.5px] text-[#070b16]'
                        : tab.highlight
                        ? 'text-[#00d9ff]'
                        : 'text-slate-300'
                    }`}
                  />
                  {tab.badge && !isActive && (
                    <span className="absolute -top-1.5 -right-2.5 bg-[#ef4444] text-white text-[10px] font-black font-cartoon px-1.5 py-0.2 rounded-full border-2 border-[#070b16] shadow-[0_2px_0_#070b16] tabular-nums">
                      {tab.badge}
                    </span>
                  )}
                </m.div>

                <span
                  className={`text-[11px] font-cartoon mt-0.5 tracking-wide leading-none ${
                    isActive ? 'text-[#070b16]' : 'text-slate-300'
                  }`}
                >
                  {tab.label}
                </span>
              </button>
            );
          })}
        </nav>
      </GlassSurface>
    </div>
  );
}
