'use client';

import React, { useState, useEffect } from 'react';
import { PlayerProfile } from '@/types/brawlstars';
import { TrophyCounter } from './ui/TrophyCounter';
import { SettingsModal } from './ui/SettingsModal';
import { Shield, RefreshCw, Zap, Tag, SlidersHorizontal } from 'lucide-react';
import { soundManager } from '@/lib/sound-manager';
import { m } from 'motion/react';
import { useSettings } from '@/lib/settings-context';
import { springBouncy } from '@/lib/motion-tokens';
import { GlassSurface } from './ui/GlassSurface';

interface NavbarProps {
  profile: PlayerProfile | null;
  loading: boolean;
  onRefresh: () => void;
  lastUpdated?: Date | null;
  onOpenTagModal?: () => void;
}

function getRelativeTime(date?: Date | null): string {
  if (!date) return "À l'instant";
  const diffSec = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diffSec < 45) return "À l'instant";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin <= 1) return 'Il y a 1 min';
  if (diffMin < 60) return `Il y a ${diffMin} min`;
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function Navbar({
  profile,
  loading,
  onRefresh,
  lastUpdated,
  onOpenTagModal,
}: NavbarProps) {
  const { reduceMotion } = useSettings();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [relativeTime, setRelativeTime] = useState<string>(() => getRelativeTime(lastUpdated));

  // Auto-refresh relative timestamp every 20s
  useEffect(() => {
    setRelativeTime(getRelativeTime(lastUpdated));
    const interval = setInterval(() => {
      setRelativeTime(getRelativeTime(lastUpdated));
    }, 20000);
    return () => clearInterval(interval);
  }, [lastUpdated]);

  const handleRefreshClick = () => {
    soundManager.playTap();
    onRefresh();
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full px-3 sm:px-6 pt-2.5 sm:pt-3 pointer-events-none">
        <GlassSurface
          level="subtle"
          floating
          className="max-w-6xl mx-auto px-3.5 sm:px-5 py-2.5 sm:py-3 rounded-2xl sm:rounded-3xl pointer-events-auto"
        >
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            {/* Logo & Brand */}
            <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
              <div className="relative flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-b from-[#ffea55] to-[#ffaa00] border-2 border-[#070b16] shadow-[0_3px_0_#070b16] text-[#070b16] shrink-0">
                <Zap className="w-5 h-5 sm:w-6 sm:h-6 fill-[#070b16]" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-cartoon text-lg sm:text-xl tracking-wider text-white text-stroke-sm">
                    BS HELPER
                  </span>
                  <span className="px-1.5 sm:px-2 py-0.5 rounded-lg text-[9px] sm:text-[10px] font-cartoon uppercase bg-[#ffc700] text-[#070b16] border-2 border-[#070b16] shadow-[0_2px_0_#070b16]">
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
              <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                {/* Trophies Counter */}
                <div className="bg-[#18214a]/90 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-2xl border-2 border-[#070b16] shadow-[0_3px_0_#070b16] flex items-center min-h-[44px]">
                  <TrophyCounter value={profile.trophies} size="sm" />
                </div>

                {/* Ranked Tier */}
                {profile.rankedRankName && (
                  <div className="hidden lg:flex items-center gap-2 bg-[#18214a]/90 px-3 py-1.5 rounded-2xl border-2 border-[#070b16] shadow-[0_3px_0_#070b16] min-h-[44px]">
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

                {/* Player Avatar Pill (Clickable to switch tag) */}
                <button
                  onClick={() => {
                    soundManager.playTap();
                    if (onOpenTagModal) onOpenTagModal();
                  }}
                  title="Changer de compte / tag joueur"
                  className="flex items-center gap-2 bg-[#18214a]/90 hover:bg-[#202b5e] pl-1.5 pr-2.5 sm:pr-3 py-1 rounded-2xl border-2 border-[#070b16] shadow-[0_3px_0_#070b16] cursor-pointer transition-transform active:translate-y-0.5 min-h-[44px]"
                >
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-b from-[#42eeff] to-[#00b8db] border-2 border-[#070b16] flex items-center justify-center font-cartoon text-[#070b16] text-xs shrink-0">
                    {profile.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="text-left hidden sm:block">
                    <span
                      className="font-cartoon text-xs sm:text-sm text-white block leading-none"
                      style={{ color: profile.nameColor ? `#${profile.nameColor.slice(4)}` : undefined }}
                    >
                      {profile.name}
                    </span>
                    <span className="text-[10px] font-black text-slate-400 font-mono flex items-center gap-0.5">
                      <Tag className="w-2.5 h-2.5" />
                      {profile.tag}
                    </span>
                  </div>
                </button>

                {/* Settings Modal Toggle Button */}
                <button
                  onClick={() => {
                    soundManager.playTap();
                    setIsSettingsOpen(true);
                  }}
                  title="Ouvrir les réglages (Sons, Vibrations, Animations, Transparence)"
                  className="w-11 h-11 rounded-2xl bg-[#18214a]/90 hover:bg-[#222d64] border-2 border-[#070b16] shadow-[0_3px_0_#070b16] text-slate-200 hover:text-white cursor-pointer active:translate-y-0.5 flex items-center justify-center shrink-0"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                </button>

                {/* Refresh Button with relative timestamp */}
                <button
                  onClick={handleRefreshClick}
                  disabled={loading}
                  title={`Actualiser (Dernière synchro : ${relativeTime})`}
                  className="brawl-btn brawl-btn-yellow min-w-[44px] min-h-[44px] px-2.5 py-1.5 rounded-2xl flex items-center justify-center gap-1.5 shrink-0"
                >
                  <m.div
                    animate={loading ? { rotate: 360 } : { rotate: 0 }}
                    transition={
                      loading
                        ? { duration: 0.8, repeat: Infinity, ease: 'linear' }
                        : reduceMotion
                        ? { duration: 0.1 }
                        : springBouncy
                    }
                  >
                    <RefreshCw className="w-4 h-4 text-[#070b16]" />
                  </m.div>
                  <span className="text-[11px] font-black text-[#070b16] hidden xl:inline">
                    {relativeTime}
                  </span>
                </button>
              </div>
            )}
          </div>
        </GlassSurface>
      </header>

      {/* Settings Modal */}
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </>
  );
}
