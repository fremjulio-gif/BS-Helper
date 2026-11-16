'use client';

import React, { useState } from 'react';
import { BattleLogSummary, BattleItem, BattlePlayer } from '@/types/brawlstars';
import { Card } from '../ui/Card';
import { Chip } from '../ui/Chip';
import { BrawlerAvatar } from '../ui/BrawlerAvatar';
import { Swords, Star, CheckCircle2, XCircle } from 'lucide-react';

interface BattleLogTabProps {
  summary: BattleLogSummary;
  recentBattles: BattleItem[];
  myTag: string;
}

export function BattleLogTab({ summary, recentBattles, myTag }: BattleLogTabProps) {
  const [selectedMode, setSelectedMode] = useState<string>('all');
  const normalizedTag = myTag.trim().toUpperCase().replace('#', '');

  const availableModes = Array.from(
    new Set(recentBattles.map((b) => b.event.mode || b.battle.mode || 'other'))
  );

  const filteredBattles = recentBattles.filter((b) => {
    if (selectedMode === 'all') return true;
    const mode = b.event.mode || b.battle.mode;
    return mode === selectedMode;
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-cartoon text-white flex items-center gap-2.5 text-stroke-sm">
          <div className="p-1.5 rounded-xl bg-[#ffc700] border-2 border-[#070b16] text-[#070b16]">
            <Swords className="w-5 h-5 fill-[#070b16]" />
          </div>
          Journal des 25 Derniers Combats
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 font-medium mt-1">
          Analyse détaillée de votre performance, rentabilité en trophées et distinctions MVP.
        </p>
      </div>

      {/* KPI Overview Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card topHighlight={true} className="p-3.5">
          <span className="text-[10px] font-cartoon text-slate-300 uppercase tracking-wide">
            Victoires
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span
              className={`font-cartoon text-2xl ${
                summary.winRate >= 55 ? 'text-[#4ade80]' : 'text-[#f87171]'
              }`}
            >
              {summary.winRate}%
            </span>
            <span className="text-xs font-bold text-slate-300">
              ({summary.victories}V / {summary.defeats}D)
            </span>
          </div>
        </Card>

        <Card topHighlight={true} className="p-3.5">
          <span className="text-[10px] font-cartoon text-slate-300 uppercase tracking-wide">
            Bilan Trophées
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span
              className={`font-cartoon text-2xl ${
                summary.trophyDelta >= 0 ? 'text-[#ffc700]' : 'text-[#f87171]'
              }`}
            >
              {summary.trophyDelta > 0 ? `+${summary.trophyDelta}` : summary.trophyDelta} 🏆
            </span>
          </div>
        </Card>

        <Card topHighlight={true} className="p-3.5">
          <span className="text-[10px] font-cartoon text-slate-300 uppercase tracking-wide">
            Joueur Étoile (MVP)
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="font-cartoon text-2xl text-[#ffc700]">
              {summary.starPlayerCount} fois
            </span>
            <span className="text-xs font-bold text-slate-300">({summary.starPlayerRate}%)</span>
          </div>
        </Card>

        <Card topHighlight={true} className="p-3.5">
          <span className="text-[10px] font-cartoon text-slate-300 uppercase tracking-wide">
            État Dynamique
          </span>
          <div className="flex items-center gap-1.5 mt-1.5">
            {summary.winRate >= 60 ? (
              <span className="px-2 py-0.5 rounded-lg text-xs font-cartoon bg-[#22c55e] text-[#070b16] border-2 border-[#070b16] shadow-[0_2px_0_#070b16]">
                Momentum 🔥
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-lg text-xs font-cartoon bg-[#ffc700] text-[#070b16] border-2 border-[#070b16] shadow-[0_2px_0_#070b16]">
                Stabilité 🛡️
              </span>
            )}
          </div>
        </Card>
      </div>

      {/* Mode Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <Chip
          label="Tous les modes"
          count={recentBattles.length}
          active={selectedMode === 'all'}
          onClick={() => setSelectedMode('all')}
          tone="cyan"
        />
        {availableModes.map((mode) => (
          <Chip
            key={mode}
            label={mode.replace(/([A-Z])/g, ' $1')}
            count={recentBattles.filter((b) => (b.event.mode || b.battle.mode) === mode).length}
            active={selectedMode === mode}
            onClick={() => setSelectedMode(mode)}
            tone="yellow"
          />
        ))}
      </div>

      {/* Battles Timeline */}
      <Card topHighlight={true} className="p-4 sm:p-6">
        <h3 className="font-cartoon text-lg text-white mb-4">Historique des Combats</h3>
        <div className="space-y-3">
          {filteredBattles.map((item, index) => {
            const battle = item.battle;
            let myPlayer: BattlePlayer | null = null;

            if (battle.teams) {
              for (const team of battle.teams) {
                const found = team.find((p) => p.tag.replace('#', '') === normalizedTag);
                if (found) {
                  myPlayer = found;
                  break;
                }
              }
            } else if (battle.players) {
              myPlayer = battle.players.find((p) => p.tag.replace('#', '') === normalizedTag) || null;
            }

            const isWin =
              battle.result === 'victory' ||
              (typeof battle.rank === 'number' &&
                (battle.mode?.includes('duo') ? battle.rank <= 2 : battle.rank <= 4));
            const isStarPlayer =
              battle.starPlayer && battle.starPlayer.tag.replace('#', '') === normalizedTag;

            return (
              <div
                key={index}
                className={`p-3.5 sm:p-4 rounded-2xl border-3 border-[#070b16] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-[0_4px_0_#070b16] transition-transform hover:-translate-y-0.5 ${
                  isWin
                    ? 'bg-gradient-to-r from-[#173a2a] to-[#122822]'
                    : 'bg-gradient-to-r from-[#381a24] to-[#25131b]'
                }`}
              >
                {/* Left: Avatar + Details */}
                <div className="flex items-center gap-3">
                  {myPlayer && (
                    <BrawlerAvatar
                      id={myPlayer.brawler.id}
                      name={myPlayer.brawler.name}
                      power={myPlayer.brawler.power}
                      size="md"
                    />
                  )}

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-cartoon text-sm text-white capitalize">
                        {item.event.mode || battle.mode}
                      </span>
                      {item.event.map && (
                        <span className="text-xs text-slate-300 font-medium">({item.event.map})</span>
                      )}
                      {isStarPlayer && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-cartoon bg-[#ffc700] text-[#070b16] border-2 border-[#070b16] shadow-[0_2px_0_#070b16] flex items-center gap-1">
                          <Star className="w-3 h-3 fill-[#070b16]" /> MVP
                        </span>
                      )}
                    </div>
                    <span className="font-bold text-xs text-slate-300 mt-0.5 block">
                      {myPlayer ? myPlayer.brawler.name : 'Brawler'}
                      {typeof battle.rank === 'number' ? ` • Rang #${battle.rank}` : ''}
                    </span>
                  </div>
                </div>

                {/* Right: Trophy change + Win/Loss status */}
                <div className="flex items-center gap-3 self-end sm:self-center">
                  {typeof battle.trophyChange === 'number' && (
                    <span
                      className={`font-cartoon text-base text-stroke-sm ${
                        battle.trophyChange > 0
                          ? 'text-[#4ade80]'
                          : battle.trophyChange < 0
                          ? 'text-[#f87171]'
                          : 'text-slate-300'
                      }`}
                    >
                      {battle.trophyChange > 0 ? `+${battle.trophyChange}` : battle.trophyChange} 🏆
                    </span>
                  )}

                  <div
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-2 border-[#070b16] shadow-[0_2px_0_#070b16] font-cartoon text-xs uppercase ${
                      isWin ? 'bg-[#22c55e] text-[#070b16]' : 'bg-[#ef4444] text-white'
                    }`}
                  >
                    {isWin ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 stroke-[2.5px]" />
                        <span>Victoire</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 stroke-[2.5px]" />
                        <span>Défaite</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
