'use client';

import React from 'react';
import { PlayerProfile } from '@/types/brawlstars';
import { TrophyCounter } from './ui/TrophyCounter';
import { SoundToggle } from './ui/SoundToggle';
import { Shield, RefreshCw, Zap } from 'lucide-react';
import { soundManager } from '@/lib/sound-manager';

interface NavbarProps {
  profile: PlayerProfile | null;
  loading: boolean;
  onRefresh: () => void;
  lastUpdated?: Date | null;
}

export function Navbar({ profile, loading, onRefresh, lastUpdated }: NavbarProps) {
  const handleRefreshClick = () => {
    soundManager.playTap();
    onRefresh();
  };

  const formattedTime = lastUpdated
    ? lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : 'À l\'instant';

  return (
    <header className="sticky top-0 z-40 w-full bg-[#12183b]/95 backdrop-blur-md border-b-3 border-[#070b16] shadow-[0_4px_0_#070b16]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-b from-[#ffea55] to-[#ffaa00] border-3 border-[#070b16] shadow-[0_4px_0_#070b16] text-[#070b16] shrink-0">
              <Zap className="w-6 h-6 fill-[#070b16]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-cartoon text-xl tracking-wider text-white text-stroke-sm">
                  BS HELPER
                </span>
                <span className="px-2 py-0.5 rounded-lg text-[10px] font-cartoon uppercase bg-[#ffc700] text-[#070b16] border-2 border-[#070b16] shadow-[0_2px_0_#070b16]">
                  PRO
                </span>
              </div>
              <p className="text-[11px] font-bold text-slate-300 hidden sm:block">
                Coach & Statistiques de Trophées
              </p>
            </div>
          </div>

          {/* Player Bar & Controls */}
          {profile && (
            <div className="flex items-center gap-2.5 sm:gap-4">
              {/* Trophies Counter */}
              <div className="bg-[#18214a] px-3 py-1.5 rounded-2xl border-2 border-[#070b16] shadow-[0_3px_0_#070b16]">
                <TrophyCounter value={profile.trophies} size="sm" />
              </div>

              {/* Ranked Tier */}
              {profile.rankedRankName && (
                <div className="hidden lg:flex items-center gap-2 bg-[#18214a] px-3 py-1.5 rounded-2xl border-2 border-[#070b16] shadow-[0_3px_0_#070b16]">
                  <Shield className="w-4 h-4 text-[#c084fc]" />
                  <div className="text-left">
                    <span className="font-cartoon text-xs text-[#c084fc] block leading-none">
                      {profile.rankedRankName}
                    </span>
                    <span className="text-[10px] font-bold text-slate-300">
                      {profile.rankedElo ? `${profile.rankedElo} Elo` : 'Actif'}
                    </span>
                  </div>
                </div>
              )}

              {/* Player Avatar Pill */}
              <div className="flex items-center gap-2 bg-[#18214a] pl-1.5 pr-3 py-1 rounded-2xl border-2 border-[#070b16] shadow-[0_3px_0_#070b16]">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-b from-[#42eeff] to-[#00b8db] border-2 border-[#070b16] flex items-center justify-center font-cartoon text-[#070b16] text-xs">
                  {profile.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="text-left hidden sm:block">
                  <span
                    className="font-cartoon text-sm text-white block leading-none"
                    style={{ color: profile.nameColor ? `#${profile.nameColor.slice(4)}` : undefined }}
                  >
                    {profile.name}
                  </span>
                  <span className="text-[9px] font-black text-slate-400 font-mono">
                    {profile.tag}
                  </span>
                </div>
              </div>

              {/* Sound Toggle */}
              <SoundToggle />

              {/* Refresh Button */}
              <button
                onClick={handleRefreshClick}
                disabled={loading}
                title={`Actualiser (Dernière synchro : ${formattedTime})`}
                className="brawl-btn brawl-btn-yellow min-w-[40px] min-h-[40px] px-2.5 py-1.5 rounded-xl"
              >
                <RefreshCw className={`w-4 h-4 text-[#070b16] ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
