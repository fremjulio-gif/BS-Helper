'use client';

import React, { useState } from 'react';
import { PlayerBrawler, StrategyRecommendation } from '@/types/brawlstars';
import { Card } from '../ui/Card';
import { Chip } from '../ui/Chip';
import { ProgressBar } from '../ui/ProgressBar';
import { BrawlerAvatar } from '../ui/BrawlerAvatar';
import { TabHeader } from '../ui/TabHeader';
import { getBrawlerFrenchName } from '@/lib/brawler-names';
import { Trophy, Zap, ArrowUpRight, ShieldCheck, Search } from 'lucide-react';

interface TrophiesTabProps {
  brawlers: PlayerBrawler[];
  easyTrophies: StrategyRecommendation[];
}

export function TrophiesTab({ brawlers, easyTrophies }: TrophiesTabProps) {
  const [filter, setFilter] = useState<'easy' | 'tilt' | 'all'>('easy');
  const [search, setSearch] = useState('');

  const tiltList = easyTrophies.filter((r) => r.type === 'tilt_recovery');
  const boostList = easyTrophies.filter((r) => r.type === 'easy_trophies');

  const filteredBrawlers = brawlers
    .filter((b) => {
      const q = search.toLowerCase();
      const fr = getBrawlerFrenchName(b.name, b.id).toLowerCase();
      return b.name.toLowerCase().includes(q) || fr.includes(q);
    })
    .sort((a, b) => {
      if (filter === 'tilt') {
        const tiltA = a.highestTrophies - a.trophies;
        const tiltB = b.highestTrophies - b.trophies;
        return tiltB - tiltA;
      }
      if (filter === 'easy') {
        return a.trophies - b.trophies;
      }
      return b.trophies - a.trophies;
    });

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Unified Tab Header */}
      <TabHeader
        icon={Trophy}
        title="Accélérateur de Trophées"
        subtitle="Repérez instantanément les Brawlers les plus rentables à monter sans résistance"
        badge={`${easyTrophies.length} opportunités`}
      />

      {/* Filter Chips Bar */}
      <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
        <Chip
          label="Trophées Faciles"
          count={boostList.length}
          active={filter === 'easy'}
          onClick={() => setFilter('easy')}
          tone="yellow"
        />
        <Chip
          label="Tilt Recovery"
          count={tiltList.length}
          active={filter === 'tilt'}
          onClick={() => setFilter('tilt')}
          tone="red"
        />
        <Chip
          label="Tout le Roster"
          count={brawlers.length}
          active={filter === 'all'}
          onClick={() => setFilter('all')}
          tone="cyan"
        />
      </div>

      {/* Easy Trophies List */}
      {filter === 'easy' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {boostList.map((rec) => {
            const nextMilestone = rec.currentTrophies < 300 ? 300 : 500;
            const progressPercent = Math.round((rec.currentTrophies / nextMilestone) * 100);

            return (
              <Card
                key={rec.brawlerId}
                topHighlight={true}
                className="flex flex-col justify-between border-3 border-[#070b16]"
              >
                <div>
                  <div className="flex items-start gap-3.5">
                    <BrawlerAvatar
                      id={rec.brawlerId}
                      name={getBrawlerFrenchName(rec.brawlerName, rec.brawlerId)}
                      power={rec.power}
                      size="lg"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-cartoon text-base text-white truncate">
                          {getBrawlerFrenchName(rec.brawlerName, rec.brawlerId)}
                        </span>
                        <span className="px-2 py-0.5 rounded-md text-xs font-cartoon uppercase bg-[#22c55e] text-[#070b16] border-2 border-[#070b16] shadow-[0_2px_0_#070b16]">
                          {rec.difficulty}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="font-cartoon text-sm text-[#ffc700] tabular-nums">
                          {rec.currentTrophies} 🏆
                        </span>
                        <span className="text-slate-400 font-bold text-xs">&rarr;</span>
                        <span className="font-cartoon text-xs text-slate-200 tabular-nums">
                          Palier {nextMilestone} 🏆
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-300 mt-3 font-medium leading-relaxed bg-[#101636] p-2.5 rounded-xl border border-white/5">
                    {rec.reason}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t-2 border-[#070b16]/60">
                  <ProgressBar
                    value={progressPercent}
                    label="Progression vers palier"
                    subLabel={`${progressPercent}%`}
                    color="yellow"
                    height="sm"
                  />
                  <div className="flex items-center justify-between text-xs font-bold text-[#4ade80] mt-2">
                    <span className="flex items-center gap-1 tabular-nums">
                      <Zap className="w-3.5 h-3.5 fill-[#4ade80]" /> +
                      {nextMilestone - rec.currentTrophies} trophées estimés
                    </span>
                    <span className="text-slate-400 text-xs">Matchmaking accessible</span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Tilt Recovery List */}
      {filter === 'tilt' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tiltList.length === 0 ? (
            <div className="col-span-full brawl-card p-10 text-center text-slate-300">
              <ShieldCheck className="w-12 h-12 text-[#22c55e] mx-auto mb-2" />
              <h3 className="font-cartoon text-xl text-white">Aucun Brawler en tilt majeur !</h3>
              <p className="text-xs text-slate-300 mt-1 max-w-sm mx-auto font-medium">
                Félicitations, tous vos Brawlers sont proches de leur niveau record personnel.
              </p>
            </div>
          ) : (
            tiltList.map((rec) => {
              const diff = (rec.targetTrophies || 0) - rec.currentTrophies;
              const progressPercent = Math.round(
                (rec.currentTrophies / (rec.targetTrophies || 1)) * 100
              );

              return (
                <Card
                  key={rec.brawlerId}
                  topHighlight={true}
                  className="flex flex-col justify-between border-3 border-[#070b16]"
                >
                  <div>
                    <div className="flex items-start gap-3.5">
                      <BrawlerAvatar
                        id={rec.brawlerId}
                        name={getBrawlerFrenchName(rec.brawlerName, rec.brawlerId)}
                        power={rec.power}
                        size="lg"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-cartoon text-base text-white truncate">
                            {getBrawlerFrenchName(rec.brawlerName, rec.brawlerId)}
                          </span>
                          <span className="px-2 py-0.5 rounded-md text-xs font-cartoon uppercase bg-[#ef4444] text-white border-2 border-[#070b16] shadow-[0_2px_0_#070b16] tabular-nums">
                            -{diff} tr
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="font-cartoon text-sm text-[#f87171] tabular-nums">
                            {rec.currentTrophies} 🏆
                          </span>
                          <span className="text-slate-400 font-bold text-xs">&rarr;</span>
                          <span className="font-cartoon text-xs text-[#ffc700] tabular-nums">
                            Record {rec.targetTrophies} 🏆
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-300 mt-3 font-medium leading-relaxed bg-[#101636] p-2.5 rounded-xl border border-white/5">
                      {rec.reason}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t-2 border-[#070b16]/60">
                    <ProgressBar
                      value={progressPercent}
                      label="Niveau record"
                      subLabel={`${rec.currentTrophies} / ${rec.targetTrophies}`}
                      color="red"
                      height="sm"
                    />
                    <div className="flex items-center justify-between text-xs font-bold text-[#ffc700] mt-2">
                      <span className="flex items-center gap-1 tabular-nums">
                        <ArrowUpRight className="w-3.5 h-3.5" /> Récupérez {diff} trophées
                      </span>
                      <span className="text-slate-400 text-xs">Palier déjà maîtrisé</span>
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      )}

      {/* Complete Roster Grid */}
      <Card topHighlight={true} className="p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
          <div>
            <h3 className="font-cartoon text-lg text-white">
              Votre Collection ({filteredBrawlers.length} Brawlers)
            </h3>
            <p className="text-xs text-slate-300">Tous vos Brawlers débloqués avec leur palier</p>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Rechercher un brawler (Spike, Colt)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#0e142e] border-2 border-[#070b16] text-xs font-bold text-white placeholder-slate-400 focus:outline-none focus:border-[#ffc700]"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {filteredBrawlers.map((brawler) => {
            const deficit = brawler.highestTrophies - brawler.trophies;
            return (
              <div
                key={brawler.id}
                className="brawl-card p-3 flex flex-col items-center text-center transition-transform hover:-translate-y-1"
              >
                <BrawlerAvatar
                  id={brawler.id}
                  name={getBrawlerFrenchName(brawler.name, brawler.id)}
                  power={brawler.power}
                  hasHypercharge={Boolean(brawler.hyperCharges && brawler.hyperCharges.length > 0)}
                  size="md"
                  className="mb-2"
                />
                <span className="font-cartoon text-xs text-white truncate max-w-full">
                  {getBrawlerFrenchName(brawler.name, brawler.id)}
                </span>
                <span className="font-cartoon text-xs text-[#ffc700] mt-0.5 tabular-nums">
                  {brawler.trophies} 🏆
                </span>
                <div className="flex items-center gap-1 mt-1 text-xs font-bold text-slate-400 tabular-nums">
                  <span>Max: {brawler.highestTrophies}</span>
                  {deficit > 0 && <span className="text-[#f87171]">(-{deficit})</span>}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
