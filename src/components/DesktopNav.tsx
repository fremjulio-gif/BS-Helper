'use client';

import React from 'react';
import { TabType } from './BottomNav';
import { BarChart3, Trophy, Compass, Swords, BotMessageSquare } from 'lucide-react';
import { m } from 'motion/react';
import { useSettings } from '@/lib/settings-context';
import { springSnappy } from '@/lib/motion-tokens';
import { soundManager } from '@/lib/sound-manager';

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
      label: 'Rush Trophées',
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
      // Future haptic hook point (Phase D)
    }
    onChangeTab(tabId);
  };

  return (
    <div className="hidden md:flex items-center gap-3 border-b-2 border-[#070b16]/60 pb-5 mb-6 overflow-x-auto relative">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = currentTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab.id as TabType)}
            className={`relative min-h-[46px] px-5 py-2.5 rounded-2xl font-cartoon text-sm tracking-wider uppercase cursor-pointer flex items-center gap-2.5 select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 ${
              isActive
                ? 'text-[#070b16] -translate-y-0.5'
                : 'text-slate-200 hover:text-white bg-[#151c3f] hover:bg-[#1e2756] border-3 border-[#070b16] shadow-[0_3px_0_#070b16]'
            }`}
          >
            {/* Animated active pill with unique desktop layoutId */}
            {isActive && (
              <m.div
                layoutId="desktopNavActiveIndicator"
                transition={reduceMotion ? { duration: 0.1 } : springSnappy}
                className="absolute inset-0 bg-gradient-to-b from-[#ffdc2e] to-[#ffaa00] border-3 border-[#070b16] shadow-[0_5px_0_#070b16] rounded-2xl -z-10"
              />
            )}

            <m.div
              animate={
                isActive && !reduceMotion
                  ? { scale: [1, 1.2, 1] }
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
                className={`px-1.5 py-0.5 rounded-lg text-[10px] font-black border-2 border-[#070b16] ${
                  isActive ? 'bg-[#070b16] text-[#ffc700]' : 'bg-[#ef4444] text-white'
                }`}
              >
                {tab.badge}
              </span>
            )}

            {tab.isAi && !isActive && (
              <span className="px-1.5 py-0.2 rounded-md text-[9px] font-cartoon bg-[#00d9ff]/20 text-[#00d9ff] border border-[#00d9ff]/40">
                IA
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
