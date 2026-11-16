'use client';

import React from 'react';
import { BarChart3, Trophy, Compass, Swords, BotMessageSquare } from 'lucide-react';

export type TabType = 'overview' | 'trophies' | 'maps' | 'battles' | 'coach';

interface BottomNavProps {
  currentTab: TabType;
  onChangeTab: (tab: TabType) => void;
  easyCount?: number;
}

export function BottomNav({ currentTab, onChangeTab, easyCount = 0 }: BottomNavProps) {
  const tabs = [
    { id: 'overview', label: 'Stats', icon: BarChart3 },
    { id: 'trophies', label: 'Rush', icon: Trophy, badge: easyCount > 0 ? easyCount : undefined },
    { id: 'maps', label: 'Maps', icon: Compass },
    { id: 'battles', label: 'Matchs', icon: Swords },
    { id: 'coach', label: 'Coach IA', icon: BotMessageSquare, highlight: true },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-[#090d16]/95 backdrop-blur-xl border-t border-white/10 px-2 py-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))]">
      <div className="flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onChangeTab(tab.id as TabType)}
              className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all cursor-pointer ${
                isActive
                  ? 'text-yellow-400 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform ${
                    isActive ? 'scale-110' : ''
                  } ${tab.highlight && !isActive ? 'text-cyan-400' : ''}`}
                />
                {tab.badge && (
                  <span className="absolute -top-1 -right-2 bg-yellow-500 text-black text-[9px] font-black px-1.2 py-0.2 rounded-full leading-tight animate-pulse">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-1">{tab.label}</span>
              {isActive && (
                <span className="absolute bottom-0 w-6 h-0.5 bg-yellow-400 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
