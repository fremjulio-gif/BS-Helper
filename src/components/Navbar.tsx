'use client';

import React from 'react';
import { PlayerProfile } from '@/types/brawlstars';
import { Trophy, Shield, RefreshCw, Zap } from 'lucide-react';

interface NavbarProps {
  profile: PlayerProfile | null;
  loading: boolean;
  onRefresh: () => void;
}

export function Navbar({ profile, loading, onRefresh }: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#090d16]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-yellow-500 to-amber-300 shadow-lg shadow-yellow-500/20 text-black font-black text-xl">
              <Zap className="w-6 h-6 fill-black" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg tracking-wider text-white">BS HELPER</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                  PRO
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">Stats & Stratégies Trophées</p>
            </div>
          </div>

          {/* Player Quick Info */}
          {profile && (
            <div className="flex items-center gap-3 sm:gap-6">
              {/* Trophies badge */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                <Trophy className="w-4 h-4 text-yellow-400 fill-yellow-400/20" />
                <div className="text-right">
                  <span className="font-black text-sm sm:text-base text-yellow-400">
                    {profile.trophies.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-yellow-500/80 block leading-none">
                    Max {profile.highestTrophies.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Ranked badge */}
              {profile.rankedRankName && (
                <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20">
                  <Shield className="w-4 h-4 text-purple-400" />
                  <div className="text-left">
                    <span className="font-bold text-xs text-purple-300 block uppercase">
                      {profile.rankedRankName}
                    </span>
                    <span className="text-[10px] text-purple-400/80 block leading-none">
                      {profile.rankedElo} Elo
                    </span>
                  </div>
                </div>
              )}

              {/* Player Tag & Name */}
              <div className="flex items-center gap-2.5 pl-2 border-l border-white/10">
                <div className="w-8 h-8 rounded-full bg-slate-800 border border-yellow-500/40 flex items-center justify-center font-bold text-yellow-400 text-xs shadow-inner">
                  {profile.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="hidden sm:block text-left">
                  <span
                    className="font-extrabold text-sm block leading-tight text-white"
                    style={{ color: profile.nameColor ? `#${profile.nameColor.slice(4)}` : undefined }}
                  >
                    {profile.name}
                  </span>
                  <span className="text-[10px] text-slate-400 block font-mono">{profile.tag}</span>
                </div>
              </div>

              {/* Refresh button */}
              <button
                onClick={onRefresh}
                disabled={loading}
                title="Actualiser les statistiques"
                className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-white/10 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-yellow-400' : ''}`} />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
