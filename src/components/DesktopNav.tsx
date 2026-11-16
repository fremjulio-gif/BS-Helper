'use client';

import React from 'react';
import { TabType } from './BottomNav';
import { BarChart3, Trophy, Compass, Swords, BotMessageSquare } from 'lucide-react';

interface DesktopNavProps {
  currentTab: TabType;
  onChangeTab: (tab: TabType) => void;
  easyCount?: number;
}

export function DesktopNav({ currentTab, onChangeTab, easyCount = 0 }: DesktopNavProps) {
  const tabs = [
    { id: 'overview', label: 'Vue d\'ensemble & Stats', icon: BarChart3 },
    {
      id: 'trophies',
      label: 'Rush Trophées',
      icon: Trophy,
      badge: easyCount > 0 ? `${easyCount} dispo` : undefined,
    },
    { id: 'maps', label: 'Rotation des Maps', icon: Compass },
    { id: 'battles', label: 'Journal de Combat (25)', icon: Swords },
    { id: 'coach', label: 'Coach Tactique IA', icon: BotMessageSquare, isAi: true },
  ];

  return (
    <div className="hidden md:flex items-center gap-2 border-b border-white/10 pb-4 mb-6">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = currentTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => onChangeTab(tab.id as TabType)}
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl font-medium text-sm transition-all cursor-pointer ${
              isActive
                ? 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/30 shadow-lg shadow-yellow-500/5 font-bold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60 border border-transparent'
            }`}
          >
            <Icon
              className={`w-4 h-4 ${
                isActive
                  ? 'text-yellow-400'
                  : tab.isAi
                  ? 'text-cyan-400'
                  : 'text-slate-400'
              }`}
            />
            <span>{tab.label}</span>
            {tab.badge && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-yellow-400/20 text-yellow-300 border border-yellow-400/30">
                {tab.badge}
              </span>
            )}
            {tab.isAi && !isActive && (
              <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                IA
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
