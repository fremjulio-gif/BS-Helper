'use client';

import React, { useState } from 'react';
import { PlayerBrawler, StrategyRecommendation } from '@/types/brawlstars';
import { Trophy, Zap, ArrowUpRight, Shield } from 'lucide-react';

interface TrophiesTabProps {
  brawlers: PlayerBrawler[];
  easyTrophies: StrategyRecommendation[];
}

export function TrophiesTab({ brawlers, easyTrophies }: TrophiesTabProps) {
  const [filter, setFilter] = useState<'all' | 'easy' | 'tilt'>('easy');
  const [search, setSearch] = useState('');

  const tiltList = easyTrophies.filter((r) => r.type === 'tilt_recovery');
  const boostList = easyTrophies.filter((r) => r.type === 'easy_trophies');

  // Filter all brawlers
  const filteredBrawlers = brawlers
    .filter((b) => b.name.toLowerCase().includes(search.toLowerCase()))
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
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-400" />
            Accélérateur de Trophées
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Identifiez instantanément où engranger un maximum de trophées avec le moins de risque.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-white/10 self-stretch sm:self-auto">
          <button
            onClick={() => setFilter('easy')}
            className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filter === 'easy'
                ? 'bg-yellow-500 text-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Trophées Faciles ({boostList.length})
          </button>
          <button
            onClick={() => setFilter('tilt')}
            className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filter === 'tilt'
                ? 'bg-red-500 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Tilt Recovery ({tiltList.length})
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filter === 'all'
                ? 'bg-cyan-500 text-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Tout ({brawlers.length})
          </button>
        </div>
      </div>

      {/* Recommended Strategy Cards */}
      {filter === 'easy' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {boostList.map((rec) => (
            <div
              key={rec.brawlerId}
              className="esport-card rounded-2xl p-4 flex flex-col justify-between border-yellow-500/20 hover:border-yellow-500/50 transition-all"
            >
              <div className="flex items-start gap-3.5">
                <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-slate-800 border border-yellow-500/30 shrink-0">
                  <img
                    src={`https://cdn.brawlify.com/brawlers/borderless/${rec.brawlerId}.png`}
                    alt={rec.brawlerName}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://cdn.brawlify.com/brawlers/emoji/16000000.png';
                    }}
                  />
                  <span className="absolute bottom-0 right-0 bg-yellow-500 text-black font-black text-[9px] px-1 rounded-tl">
                    P{rec.power}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-sm text-white truncate">{rec.brawlerName}</span>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      {rec.difficulty}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-bold text-yellow-400">
                      {rec.currentTrophies} 🏆
                    </span>
                    <span className="text-slate-500 text-xs">&rarr;</span>
                    <span className="text-xs font-bold text-slate-300">
                      Objectif {rec.targetTrophies} 🏆
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                    {rec.reason}
                  </p>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5" /> +
                  {rec.targetTrophies ? rec.targetTrophies - rec.currentTrophies : 200} trophées
                  estimés
                </span>
                <span className="text-[10px] text-slate-500">Bots garantis sous 300 tr</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {filter === 'tilt' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tiltList.length === 0 ? (
            <div className="col-span-full py-12 text-center text-slate-400">
              <Shield className="w-10 h-10 text-emerald-400 mx-auto mb-2 opacity-80" />
              <p className="font-bold text-white">Aucun Brawler en tilt majeur !</p>
              <p className="text-xs mt-1">Tous vos Brawlers sont proches de leur record personnel.</p>
            </div>
          ) : (
            tiltList.map((rec) => {
              const diff = (rec.targetTrophies || 0) - rec.currentTrophies;
              return (
                <div
                  key={rec.brawlerId}
                  className="esport-card rounded-2xl p-4 flex flex-col justify-between border-red-500/20 hover:border-red-500/50 transition-all"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-slate-800 border border-red-500/30 shrink-0">
                      <img
                        src={`https://cdn.brawlify.com/brawlers/borderless/${rec.brawlerId}.png`}
                        alt={rec.brawlerName}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://cdn.brawlify.com/brawlers/emoji/16000000.png';
                        }}
                      />
                      <span className="absolute bottom-0 right-0 bg-red-500 text-white font-black text-[9px] px-1 rounded-tl">
                        P{rec.power}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-black text-sm text-white truncate">
                          {rec.brawlerName}
                        </span>
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-red-500/20 text-red-400 border border-red-500/30">
                          -{diff} tr
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-bold text-red-400">
                          {rec.currentTrophies} 🏆
                        </span>
                        <span className="text-slate-500 text-xs">&rarr;</span>
                        <span className="text-xs font-bold text-yellow-400">
                          Record {rec.targetTrophies} 🏆
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                        {rec.reason}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                    <span className="text-yellow-400 font-bold flex items-center gap-1">
                      <ArrowUpRight className="w-3.5 h-3.5" /> Récupérez {diff} trophées
                    </span>
                    <span className="text-[10px] text-slate-500">Niveau déjà atteint</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* All Brawlers Table/Grid */}
      <div className="esport-card rounded-2xl p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          <h3 className="font-extrabold text-base text-white">
            Roster Complet ({filteredBrawlers.length} Brawlers)
          </h3>
          <input
            type="text"
            placeholder="Rechercher un brawler (ex: Spike, Colt)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-64 px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-yellow-500"
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {filteredBrawlers.map((brawler) => {
            const deficit = brawler.highestTrophies - brawler.trophies;
            return (
              <div
                key={brawler.id}
                className="bg-slate-900/60 border border-white/5 hover:border-yellow-500/30 rounded-xl p-3 flex flex-col items-center text-center transition-all group"
              >
                <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-slate-800 mb-2 border border-white/10">
                  <img
                    src={`https://cdn.brawlify.com/brawlers/borderless/${brawler.id}.png`}
                    alt={brawler.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://cdn.brawlify.com/brawlers/emoji/16000000.png';
                    }}
                  />
                  <span className="absolute bottom-0 right-0 bg-yellow-500 text-black text-[9px] font-black px-1 rounded-tl">
                    P{brawler.power}
                  </span>
                </div>
                <span className="font-bold text-xs text-white truncate max-w-full">
                  {brawler.name}
                </span>
                <span className="text-xs font-black text-yellow-400 mt-0.5">
                  {brawler.trophies} 🏆
                </span>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="text-[10px] text-slate-400">
                    Max: {brawler.highestTrophies}
                  </span>
                  {deficit > 0 && (
                    <span className="text-[10px] font-bold text-red-400">
                      (-{deficit})
                    </span>
                  )}
                </div>
                {brawler.currentWinStreak && brawler.currentWinStreak > 0 ? (
                  <span className="text-[9px] text-emerald-400 font-bold mt-1 bg-emerald-500/10 px-1.5 py-0.2 rounded">
                    🔥 {brawler.currentWinStreak} win streak
                  </span>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
