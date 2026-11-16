'use client';

import React from 'react';
import { TabType } from './BottomNav';
import { BarChart3, Trophy, Compass, Swords, BotMessageSquare } from 'lucide-react';
import { m } from 'motion/react';
import { useSettings } from '@/lib/settings-context';
import { springSnappy } from '@/lib/motion-tokens';
import { soundManager } from '@/lib/sound-manager';
import { GlassSurface } from './ui/GlassSurface';

interface DesktopNavProps {
  currentTab: TabType;
  onChangeTab: (tab: TabType) => void;
  easyCount?: number;
}

export function DesktopNav({ currentTab, onChangeTab, easyCount = 0 }: DesktopNavProps) {
  const { sound, haptics, reduceMotion } = useSettings();

  const tabs = [
    { id: 'overview', label: "Vue d'ensemble", icon: BarChart3 },
    {
      id: 'trophies',
      label: 'Brawlers',
      icon: Trophy,
      badge: easyCount > 0 ? `${easyCount} dispo` : undefined,
    },
    { id: 'maps', label: 'Rotation des Maps', icon: Compass },
    { id: 'battles', label: 'Journal (25 Matchs)', icon: Swords },
    { id: 'coach', label: 'Coach Bitz IA', icon: BotMessageSquare, isAi: true },
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
    <div className="hidden md:block mb-8">
      <GlassSurface
        level="subtle"
        className="p-1.5 rounded-2xl inline-flex items-center gap-1.5 shadow-[0_6px_24px_rgba(0,0,0,0.3)] max-w-full overflow-x-auto"
      >
        <div className="flex items-center gap-1.5">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id as TabType)}
                className={`relative min-h-[44px] px-4 py-2 rounded-xl font-cartoon text-sm tracking-wider uppercase cursor-pointer flex items-center gap-2.5 select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 transition-colors whitespace-nowrap ${
                  isActive
                    ? 'text-[#070b16]'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                {/* Animated active pill with unique desktop layoutId */}
                {isActive && (
                  <m.div
                    layoutId="desktopNavActiveIndicator"
                    transition={reduceMotion ? { duration: 0.1 } : springSnappy}
                    className="absolute inset-0 bg-gradient-to-b from-[#ffdc2e] to-[#ffaa00] border-2 border-[#070b16] shadow-[0_3px_0_#070b16] rounded-xl -z-10"
                  />
                )}

                <m.div
                  animate={
                    isActive && !reduceMotion
                      ? { scale: [1, 1.15, 1] }
                      : { scale: 1 }
                  }
                  transition={springSnappy}
                  className="flex items-center"
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive
                        ? 'text-[#070b16] stroke-[2.5px]'
                        : tab.isAi
                        ? 'text-[#00d9ff]'
                        : 'text-slate-300'
                    }`}
                  />
                </m.div>

                <span>{tab.label}</span>

                {tab.badge && (
                  <span
                    className={`px-1.5 py-0.5 rounded-lg text-[10px] font-black border-2 border-[#070b16] tabular-nums ${
                      isActive ? 'bg-[#070b16] text-[#ffc700]' : 'bg-[#ef4444] text-white'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}

                {tab.isAi && !isActive && (
                  <span className="w-2 h-2 rounded-full bg-[#00d9ff] animate-pulse" />
                )}
              </button>
            );
          })}
        </div>
      </GlassSurface>
    </div>
  );
}
