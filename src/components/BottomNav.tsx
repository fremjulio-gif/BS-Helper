'use client';

import React from 'react';
import { BarChart3, Trophy, Compass, Swords, BotMessageSquare } from 'lucide-react';
import { m } from 'motion/react';
import { useSettings } from '@/lib/settings-context';
import { springSnappy } from '@/lib/motion-tokens';
import { soundManager } from '@/lib/sound-manager';

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
    // Sound & haptics points of attachment
    if (sound) {
      soundManager.playTap();
    }
    if (haptics && typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      // Future haptic hook point (Phase D)
    }
    onChangeTab(tabId);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-[#101636]/95 backdrop-blur-lg border-t-3 border-[#070b16] px-2 py-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))] shadow-[0_-4px_0_#070b16]">
      <div className="flex items-center justify-around relative">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id as TabType)}
              className={`relative flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl min-h-[48px] min-w-[56px] cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 ${
                isActive ? 'text-[#070b16] -translate-y-1' : 'text-slate-300 hover:text-white'
              }`}
            >
              {/* Animated active pill with unique mobile layoutId */}
              {isActive && (
                <m.div
                  layoutId="bottomNavActiveIndicator"
                  transition={reduceMotion ? { duration: 0.1 } : springSnappy}
                  className="absolute inset-0 bg-gradient-to-b from-[#ffdc2e] to-[#ffaa00] border-2 border-[#070b16] shadow-[0_3px_0_#070b16] rounded-2xl -z-10"
                />
              )}

              {/* Bouncing icon on tab switch */}
              <m.div
                animate={
                  isActive && !reduceMotion
                    ? { scale: [1, 1.25, 1], y: [0, -2, 0] }
                    : { scale: 1, y: 0 }
                }
                transition={springSnappy}
                className="relative"
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
                  <span className="absolute -top-1.5 -right-2.5 bg-[#ef4444] text-white text-[9px] font-black font-cartoon px-1.5 py-0.2 rounded-full border-2 border-[#070b16] shadow-[0_2px_0_#070b16]">
                    {tab.badge}
                  </span>
                )}
              </m.div>

              <span
                className={`text-[10px] font-cartoon mt-0.5 tracking-wide leading-none ${
                  isActive ? 'text-[#070b16]' : 'text-slate-300'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
