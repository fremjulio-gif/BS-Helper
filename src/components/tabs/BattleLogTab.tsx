'use client';

import React from 'react';
import { BattleLogSummary, BattleItem, BattlePlayer } from '@/types/brawlstars';
import { Swords, Star, Trophy } from 'lucide-react';

interface BattleLogTabProps {
  summary: BattleLogSummary;
  recentBattles: BattleItem[];
  myTag: string;
}

export function BattleLogTab({ summary, recentBattles, myTag }: BattleLogTabProps) {
  const normalizedTag = myTag.trim().toUpperCase().replace('#', '');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
          <Swords className="w-6 h-6 text-yellow-400" />
          Analyse des 25 Derniers Combats
        </h2>
        <p className="text-xs sm:text-sm text-slate-400">
          Statistiques de performance, rentabilité en trophées et répartition par mode.
        </p>
      </div>

      {/* Summary KPI Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="esport-card p-4 rounded-xl">
          <span className="text-xs font-bold text-slate-400 uppercase">Taux de Victoire</span>
          <div className="flex items-center gap-2 mt-1.5">
            <span
              className={`text-2xl font-black ${
                summary.winRate >= 55 ? 'text-emerald-400' : 'text-red-400'
              }`}
            >
              {summary.winRate}%
            </span>
            <span className="text-xs text-slate-400">
              ({summary.victories}V / {summary.defeats}D)
            </span>
          </div>
        </div>

        <div className="esport-card p-4 rounded-xl">
          <span className="text-xs font-bold text-slate-400 uppercase">Bilan Trophées</span>
          <div className="flex items-center gap-2 mt-1.5">
            <span
              className={`text-2xl font-black ${
                summary.trophyDelta >= 0 ? 'text-yellow-400' : 'text-red-400'
              }`}
            >
              {summary.trophyDelta > 0 ? `+${summary.trophyDelta}` : summary.trophyDelta} 🏆
            </span>
          </div>
        </div>

        <div className="esport-card p-4 rounded-xl">
          <span className="text-xs font-bold text-slate-400 uppercase">Joueur Étoile (MVP)</span>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-2xl font-black text-amber-300">
              {summary.starPlayerCount} fois
            </span>
            <span className="text-xs text-slate-400">({summary.starPlayerRate}%)</span>
          </div>
        </div>

        <div className="esport-card p-4 rounded-xl">
          <span className="text-xs font-bold text-slate-400 uppercase">Statut Dynamique</span>
          <div className="flex items-center gap-2 mt-1.5">
            {summary.winRate >= 60 ? (
              <span className="px-2 py-0.5 rounded text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Momentum Positif 🔥
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded text-xs font-bold bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                En Récupération 🛡️
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Mode Performance Grid */}
      <div className="esport-card p-5 rounded-2xl">
        <h3 className="font-extrabold text-base text-white mb-3 flex items-center gap-2">
          <Trophy className="w-4 h-4 text-yellow-400" />
          Rendement par Mode de Jeu
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {Object.entries(summary.modeStats).map(([mode, stats]) => (
            <div
              key={mode}
              className="bg-slate-900/80 border border-white/5 rounded-xl p-3 flex items-center justify-between"
            >
              <div>
                <span className="text-xs font-bold text-white capitalize block">
                  {mode.replace(/([A-Z])/g, ' $1')}
                </span>
                <span className="text-[11px] text-slate-400">
                  {stats.wins}V sur {stats.total} parties
                </span>
              </div>
              <div className="text-right">
                <span
                  className={`text-base font-black ${
                    stats.winRate >= 60
                      ? 'text-emerald-400'
                      : stats.winRate >= 40
                      ? 'text-yellow-400'
                      : 'text-red-400'
                  }`}
                >
                  {stats.winRate}%
                </span>
                <span className="text-[9px] text-slate-500 block">winrate</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Battle Items List */}
      <div className="esport-card p-5 rounded-2xl">
        <h3 className="font-extrabold text-base text-white mb-4">Dernières Parties Jouées</h3>
        <div className="space-y-3">
          {recentBattles.map((item, index) => {
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
                className={`p-3.5 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-all ${
                  isWin
                    ? 'bg-emerald-950/20 border-emerald-500/20'
                    : 'bg-red-950/15 border-red-500/20'
                }`}
              >
                {/* Left: Mode, Map, Brawler */}
                <div className="flex items-center gap-3">
                  {myPlayer && (
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-slate-800 border border-white/10 shrink-0">
                      <img
                        src={`https://cdn.brawlify.com/brawlers/borderless/${myPlayer.brawler.id}.png`}
                        alt={myPlayer.brawler.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://cdn.brawlify.com/brawlers/emoji/16000000.png';
                        }}
                      />
                      <span className="absolute bottom-0 right-0 bg-yellow-500 text-black text-[8px] font-black px-1 rounded-tl">
                        P{myPlayer.brawler.power}
                      </span>
                    </div>
                  )}

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white capitalize">
                        {item.event.mode || battle.mode}
                      </span>
                      {item.event.map && (
                        <span className="text-[11px] text-slate-400">({item.event.map})</span>
                      )}
                      {isStarPlayer && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-yellow-500 text-black flex items-center gap-1">
                          <Star className="w-2.5 h-2.5 fill-black" /> MVP
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-300 font-semibold mt-0.5 block">
                      {myPlayer ? myPlayer.brawler.name : 'Brawler'}
                      {typeof battle.rank === 'number' ? ` • Rang #${battle.rank}` : ''}
                    </span>
                  </div>
                </div>

                {/* Right: Trophy Change & Result */}
                <div className="flex items-center gap-3 self-end sm:self-center">
                  {typeof battle.trophyChange === 'number' && (
                    <span
                      className={`text-sm font-black ${
                        battle.trophyChange > 0
                          ? 'text-emerald-400'
                          : battle.trophyChange < 0
                          ? 'text-red-400'
                          : 'text-slate-400'
                      }`}
                    >
                      {battle.trophyChange > 0 ? `+${battle.trophyChange}` : battle.trophyChange} 🏆
                    </span>
                  )}
                  <span
                    className={`px-2.5 py-1 rounded-lg text-xs font-black uppercase ${
                      isWin
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}
                  >
                    {isWin ? 'Victoire' : 'Défaite'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
