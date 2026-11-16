'use client';

import React, { useState, useMemo } from 'react';
import { BattleLogSummary, BattleItem, BattlePlayer, GameModeMeta } from '@/types/brawlstars';
import { Card } from '../ui/Card';
import { Chip } from '../ui/Chip';
import { BrawlerAvatar } from '../ui/BrawlerAvatar';
import { TabHeader } from '../ui/TabHeader';
import { GameModeBadge } from '../ui/GameModeBadge';
import { GlassSurface } from '../ui/GlassSurface';
import { getBrawlerFrenchName } from '@/lib/brawler-names';
import { resolveGameMode } from '@/lib/gamemodes-service';
import { HistoricalStatsResponse } from '@/lib/stats-recorder';
import { StaggerItem } from '../motion/Stagger';
import {
  Swords,
  Star,
  CheckCircle2,
  XCircle,
  Database,
  Calendar,
  AlertCircle,
  Users,
} from 'lucide-react';
import { m } from 'motion/react';
import { useSettings } from '@/lib/settings-context';

interface BattleLogTabProps {
  summary: BattleLogSummary;
  recentBattles: BattleItem[];
  myTag: string;
  gameModes?: Record<string, GameModeMeta>;
  historicalStats?: HistoricalStatsResponse | null;
}

export function BattleLogTab({
  summary,
  recentBattles,
  myTag,
  gameModes,
  historicalStats,
}: BattleLogTabProps) {
  const { reduceMotion } = useSettings();
  const [selectedMode, setSelectedMode] = useState<string>('all');
  const [selectedResult, setSelectedResult] = useState<'all' | 'victory' | 'defeat'>('all');

  const normalizedTag = myTag.trim().toUpperCase().replace('#', '');

  const availableModes = useMemo(() => {
    return Array.from(
      new Set(recentBattles.map((b) => b.event.mode || b.battle.mode || 'other'))
    );
  }, [recentBattles]);

  const filteredBattles = useMemo(() => {
    return recentBattles.filter((b) => {
      // Filtre mode
      if (selectedMode !== 'all') {
        const mode = b.event.mode || b.battle.mode;
        if (mode !== selectedMode) return false;
      }

      // Filtre résultat
      const isWin =
        b.battle.result === 'victory' ||
        (typeof b.battle.rank === 'number' &&
          (b.battle.mode?.includes('duo') ? b.battle.rank <= 2 : b.battle.rank <= 4));

      if (selectedResult === 'victory' && !isWin) return false;
      if (selectedResult === 'defeat' && isWin) return false;

      return true;
    });
  }, [recentBattles, selectedMode, selectedResult]);

  // Formattage date début du suivi
  const formattedTrackedDate = useMemo(() => {
    if (!historicalStats?.firstTrackedAt) return null;
    const d = new Date(historicalStats.firstTrackedAt);
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }, [historicalStats]);

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Unified Tab Header */}
      <TabHeader
        icon={Swords}
        title="Journal des Combats & Historique"
        subtitle="Analyse détaillée de vos matchs récents, rentabilité en trophées et persistance en base"
        badge={`${summary.victories}V - ${summary.defeats}D`}
      />

      {/* Bannière de persistance Neon PostgreSQL */}
      {historicalStats && historicalStats.totalCount > 0 && (
        <GlassSurface level="subtle" className="p-4 rounded-2xl border border-white/10 bg-[#0c1228]/80">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                <Database className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-black uppercase text-white tracking-wide block">
                  Historique Persistant (Neon PostgreSQL)
                </span>
                <p className="text-[11px] text-slate-300">
                  {formattedTrackedDate ? `Suivi depuis le ${formattedTrackedDate} • ` : ''}
                  <span className="font-bold text-cyan-300">
                    {historicalStats.totalCount.toLocaleString('fr-FR')} combats
                  </span>{' '}
                  enregistrés (Plafond automatique : 1 500)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto text-[11px] font-bold text-slate-400">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Dédoublonnage &amp; timestamps UTC</span>
            </div>
          </div>
        </GlassSurface>
      )}

      {/* KPI Overview Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <Card topHighlight={true} className="p-3.5 sm:p-4">
          <span className="text-xs font-cartoon text-slate-300 uppercase tracking-wide">
            Victoires
          </span>
          <div className="flex items-baseline gap-2 mt-1 tabular-nums">
            <span
              className={`font-cartoon text-2xl ${
                summary.winRate >= 55 ? 'text-[#4ade80]' : 'text-[#f87171]'
              }`}
            >
              {summary.winRate}%
            </span>
            <span className="text-xs font-bold text-slate-300 tabular-nums">
              ({summary.victories}V / {summary.defeats}D)
            </span>
          </div>
        </Card>

        <Card topHighlight={true} className="p-3.5 sm:p-4">
          <span className="text-xs font-cartoon text-slate-300 uppercase tracking-wide">
            Bilan Trophées
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span
              className={`font-cartoon text-2xl tabular-nums ${
                summary.trophyDelta >= 0 ? 'text-[#ffc700]' : 'text-[#f87171]'
              }`}
            >
              {summary.trophyDelta > 0 ? `+${summary.trophyDelta}` : summary.trophyDelta} 🏆
            </span>
          </div>
        </Card>

        <Card topHighlight={true} className="p-3.5 sm:p-4">
          <span className="text-xs font-cartoon text-slate-300 uppercase tracking-wide">
            Joueur Étoile (MVP)
          </span>
          <div className="flex items-baseline gap-2 mt-1 tabular-nums">
            <span className="font-cartoon text-2xl text-[#ffc700] tabular-nums">
              {summary.starPlayerCount} fois
            </span>
            <span className="text-xs font-bold text-slate-300 tabular-nums">({summary.starPlayerRate}%)</span>
          </div>
        </Card>

        <Card topHighlight={true} className="p-3.5 sm:p-4">
          <span className="text-xs font-cartoon text-slate-300 uppercase tracking-wide">
            État Dynamique
          </span>
          <div className="flex items-center gap-1.5 mt-1.5">
            {summary.winRate >= 60 ? (
              <span className="px-2.5 py-0.5 rounded-lg text-xs font-cartoon bg-[#22c55e] text-[#070b16] border-2 border-[#070b16] shadow-[0_2px_0_#070b16]">
                Momentum 🔥
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-lg text-xs font-cartoon bg-[#ffc700] text-[#070b16] border-2 border-[#070b16] shadow-[0_2px_0_#070b16]">
                Stabilité 🛡️
              </span>
            )}
          </div>
        </Card>
      </div>

      {/* Cartes de représentativité des échantillons si données historiques disponibles */}
      {historicalStats && Object.keys(historicalStats.modeStats).length > 0 && (
        <Card topHighlight={true} className="p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-black uppercase text-slate-300 tracking-wider flex items-center gap-1.5">
              Fiabilité des Statistiques par Mode (Historique)
            </h4>
            <span className="text-[11px] text-slate-400">Échantillon minimal : 10 matchs</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
            {Object.entries(historicalStats.modeStats).map(([modeKey, stat]) => {
              const modeMeta = resolveGameMode(modeKey, gameModes);
              return (
                <div
                  key={modeKey}
                  className="p-2.5 rounded-xl bg-black/30 border border-white/5 flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-xs font-bold text-white truncate">{modeMeta.name}</span>
                    <span
                      className={`text-xs font-black tabular-nums ${
                        stat.winRate >= 50 ? 'text-emerald-400' : 'text-red-400'
                      }`}
                    >
                      {stat.winRate}%
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[10px] mt-1 pt-1 border-t border-white/5">
                    <span className="text-slate-400 tabular-nums">{stat.total} matchs</span>
                    {stat.isWeakSample ? (
                      <span className="inline-flex items-center gap-0.5 text-amber-400 font-bold" title="Échantillon faible : moins de 10 matchs enregistrés">
                        <AlertCircle className="w-3 h-3" /> Faible
                      </span>
                    ) : (
                      <span className="text-emerald-400 font-bold">✓ Fiable</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Filtres de Mode & Résultat */}
      <div className="space-y-2.5">
        {/* Filtre résultat */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <Chip
            label="Tous les résultats"
            count={recentBattles.length}
            active={selectedResult === 'all'}
            onClick={() => setSelectedResult('all')}
            tone="cyan"
          />
          <Chip
            label="Victoires"
            count={summary.victories}
            active={selectedResult === 'victory'}
            onClick={() => setSelectedResult('victory')}
            tone="purple"
          />
          <Chip
            label="Défaites"
            count={summary.defeats}
            active={selectedResult === 'defeat'}
            onClick={() => setSelectedResult('defeat')}
            tone="red"
          />
        </div>

        {/* Filtre mode */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <Chip
            label="Tous les modes"
            count={recentBattles.length}
            active={selectedMode === 'all'}
            onClick={() => setSelectedMode('all')}
            tone="yellow"
          />
          {availableModes.map((mode) => {
            const modeMeta = resolveGameMode(mode, gameModes);
            return (
              <Chip
                key={mode}
                label={modeMeta.name}
                count={recentBattles.filter((b) => (b.event.mode || b.battle.mode) === mode).length}
                active={selectedMode === mode}
                onClick={() => setSelectedMode(mode)}
                tone="cyan"
              />
            );
          })}
        </div>
      </div>

      {/* Battles Timeline */}
      <Card topHighlight={true} className="p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-cartoon text-lg text-white">
            Combats Référencés ({filteredBattles.length})
          </h3>
          <span className="text-xs text-slate-400">Ordre chronologique inversé</span>
        </div>

        <div className="space-y-3">
          {filteredBattles.map((item, index) => {
            const battle = item.battle;
            let myPlayer: BattlePlayer | null = null;
            let allies: BattlePlayer[] = [];
            let opponents: BattlePlayer[] = [];

            if (battle.teams) {
              for (const team of battle.teams) {
                const found = team.find((p) => p.tag.replace('#', '') === normalizedTag);
                if (found) {
                  myPlayer = found;
                  allies = team.filter((p) => p.tag.replace('#', '') !== normalizedTag);
                } else {
                  opponents.push(...team);
                }
              }
            } else if (battle.players) {
              myPlayer = battle.players.find((p) => p.tag.replace('#', '') === normalizedTag) || null;
              opponents = battle.players.filter((p) => p.tag.replace('#', '') !== normalizedTag);
            }

            const isWin =
              battle.result === 'victory' ||
              (typeof battle.rank === 'number' &&
                (battle.mode?.includes('duo') ? battle.rank <= 2 : battle.rank <= 4));
            const isStarPlayer =
              battle.starPlayer && battle.starPlayer.tag.replace('#', '') === normalizedTag;

            return (
              <StaggerItem key={item.battleTime || index} index={index}>
                <div
                  className={`p-3.5 sm:p-4 rounded-2xl border-3 flex flex-col gap-3 shadow-[0_4px_0_#070b16] transition-transform hover:-translate-y-0.5 ${
                    isStarPlayer
                      ? 'border-[#ffc700] ring-2 ring-[#ffc700]/30 shadow-[0_4px_12px_rgba(255,199,0,0.2)]'
                      : 'border-[#070b16]'
                  } ${
                    isWin
                      ? 'bg-gradient-to-r from-[#173a2a] to-[#122822]'
                      : 'bg-gradient-to-r from-[#381a24] to-[#25131b]'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    {/* Left: Avatar + Details */}
                    <div className="flex items-center gap-3">
                      {myPlayer && (
                        <BrawlerAvatar
                          id={myPlayer.brawler.id}
                          name={getBrawlerFrenchName(myPlayer.brawler.name, myPlayer.brawler.id)}
                          power={myPlayer.brawler.power}
                          size="md"
                        />
                      )}

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <GameModeBadge
                            mode={item.event.mode || battle.mode}
                            dictionary={gameModes}
                            size="sm"
                          />
                          {item.event.map && (
                            <span className="text-xs text-slate-300 font-medium">({item.event.map})</span>
                          )}
                          {isStarPlayer && (
                            <span className="px-2 py-0.5 rounded-md text-xs font-cartoon bg-[#ffc700] text-[#070b16] border-2 border-[#070b16] shadow-[0_2px_0_#070b16] flex items-center gap-1 animate-pulse">
                              <Star className="w-3 h-3 fill-[#070b16]" /> MVP
                            </span>
                          )}
                        </div>
                        <span className="font-bold text-xs text-slate-300 mt-0.5 block">
                          {myPlayer ? getBrawlerFrenchName(myPlayer.brawler.name, myPlayer.brawler.id) : 'Brawler'}
                          {typeof battle.rank === 'number' ? ` • Rang #${battle.rank}` : ''}
                        </span>
                      </div>
                    </div>

                    {/* Right: Trophy change + Win/Loss status */}
                    <div className="flex items-center gap-3 self-end sm:self-center">
                      {typeof battle.trophyChange === 'number' && (
                        <span
                          className={`font-cartoon text-base text-stroke-sm tabular-nums ${
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
                        <m.div
                          animate={!reduceMotion ? { scale: [1, 1.2, 1] } : undefined}
                          transition={{ duration: 0.3 }}
                        >
                          {isWin ? (
                            <CheckCircle2 className="w-4 h-4 stroke-[2.5px]" />
                          ) : (
                            <XCircle className="w-4 h-4 stroke-[2.5px]" />
                          )}
                        </m.div>
                        <span>{isWin ? 'Victoire' : 'Défaite'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Composition des équipes compacte */}
                  {(allies.length > 0 || opponents.length > 0) && (
                    <div className="pt-2 border-t border-white/5 flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
                      {allies.length > 0 && (
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-emerald-400 flex items-center gap-1">
                            <Users className="w-3 h-3" /> Alliés :
                          </span>
                          {allies.map((a) => (
                            <span key={a.tag} className="px-1.5 py-0.2 rounded bg-black/30 border border-white/10 text-slate-300">
                              {getBrawlerFrenchName(a.brawler.name, a.brawler.id)}
                            </span>
                          ))}
                        </div>
                      )}
                      {opponents.length > 0 && (
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-red-400">Adversaires :</span>
                          {opponents.slice(0, 3).map((o) => (
                            <span key={o.tag} className="px-1.5 py-0.2 rounded bg-black/30 border border-white/10 text-slate-300">
                              {getBrawlerFrenchName(o.brawler.name, o.brawler.id)}
                            </span>
                          ))}
                          {opponents.length > 3 && (
                            <span className="text-slate-500 text-[10px]">+{opponents.length - 3}</span>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </StaggerItem>
            );
          })}

          {filteredBattles.length === 0 && (
            <div className="p-8 text-center text-slate-400 text-xs font-bold">
              Aucun match ne correspond aux filtres sélectionnés.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
