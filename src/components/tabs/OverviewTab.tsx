'use client';

import React from 'react';
import { PlayerProfile, BattleLogSummary } from '@/types/brawlstars';
import {
  Trophy,
  Users,
  Flame,
  Award,
  TrendingUp,
  Sparkles,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';

interface OverviewTabProps {
  profile: PlayerProfile;
  battleSummary: BattleLogSummary;
  progression: Array<{ date: string; trophies: number; rankedElo?: number | null }>;
  coachTips: Array<{ title: string; message: string; priority: 'high' | 'medium' | 'low'; icon: string }>;
  onGoToCoach: () => void;
  onGoToRush: () => void;
}

export function OverviewTab({
  profile,
  battleSummary,
  progression,
  coachTips,
  onGoToCoach,
  onGoToRush,
}: OverviewTabProps) {
  const topTip = coachTips[0];

  // If progression has less than 2 items, add current profile as first point for display
  const chartData =
    progression.length > 1
      ? progression
      : [
          { date: 'Initial', trophies: profile.trophies - 30 },
          { date: 'En direct', trophies: profile.trophies },
        ];

  return (
    <div className="space-y-6">
      {/* Coach Action Banner */}
      {topTip && (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-yellow-500/15 via-slate-900 to-cyan-500/10 border border-yellow-500/30 p-4 sm:p-5 shadow-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-xl bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-yellow-400">
                    Conseil Coach Prioritaire
                  </span>
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-yellow-500 text-black">
                    IA
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-black text-white mt-0.5">{topTip.title}</h3>
                <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">{topTip.message}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={onGoToCoach}
                className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-black font-extrabold text-xs sm:text-sm transition-all shadow-lg shadow-yellow-500/20 cursor-pointer text-center"
              >
                Parler au Coach
              </button>
            </div>
          </div>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Trophies Card */}
        <div className="esport-card p-4 sm:p-5 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Trophées</span>
            <div className="p-2 rounded-lg bg-yellow-500/10 text-yellow-400">
              <Trophy className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {profile.trophies.toLocaleString()}
            </span>
            <span className="text-xs text-yellow-500/80 block mt-0.5">
              Record : {profile.highestTrophies.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Winrate 25 Battles */}
        <div className="esport-card p-4 sm:p-5 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Winrate Récent</span>
            <div
              className={`p-2 rounded-lg ${
                battleSummary.winRate >= 60
                  ? 'bg-emerald-500/10 text-emerald-400'
                  : 'bg-red-500/10 text-red-400'
              }`}
            >
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span
              className={`text-2xl sm:text-3xl font-black tracking-tight ${
                battleSummary.winRate >= 60 ? 'text-emerald-400' : 'text-red-400'
              }`}
            >
              {battleSummary.winRate}%
            </span>
            <span className="text-xs text-slate-400 block mt-0.5">
              {battleSummary.victories}V - {battleSummary.defeats}D ({battleSummary.trophyDelta > 0 ? '+' : ''}
              {battleSummary.trophyDelta} tr)
            </span>
          </div>
        </div>

        {/* 3v3 Victories */}
        <div className="esport-card p-4 sm:p-5 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Victoires 3v3</span>
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {profile['3vs3Victories'].toLocaleString()}
            </span>
            <span className="text-xs text-cyan-400/80 block mt-0.5">
              Solo: {profile.soloVictories} | Duo: {profile.duoVictories}
            </span>
          </div>
        </div>

        {/* Ranked Elo / Rank */}
        <div className="esport-card p-4 sm:p-5 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Rang Classé</span>
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-xl sm:text-2xl font-black text-purple-300 uppercase tracking-tight block truncate">
              {profile.rankedRankName || 'DIAMOND I'}
            </span>
            <span className="text-xs text-purple-400/80 block mt-0.5">
              {profile.rankedElo ? `${profile.rankedElo} Elo` : 'Actif cette saison'}
            </span>
          </div>
        </div>
      </div>

      {/* Progression Graph */}
      <div className="esport-card p-4 sm:p-6 rounded-2xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-6">
          <div className="flex items-center gap-2.5">
            <TrendingUp className="w-5 h-5 text-yellow-400" />
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-white">
                Courbe d&apos;Évolution des Trophées
              </h3>
              <p className="text-xs text-slate-400">
                Historique des snapshots enregistrés en base de données
              </p>
            </div>
          </div>
          <button
            onClick={onGoToRush}
            className="text-xs font-bold text-yellow-400 hover:text-yellow-300 flex items-center gap-1 cursor-pointer"
          >
            Découvrir les trophées faciles &rarr;
          </button>
        </div>

        <div className="h-64 sm:h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="trophyGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#facc15" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#facc15" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                domain={['dataMin - 100', 'dataMax + 100']}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: 'rgba(250, 204, 21, 0.3)',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '12px',
                }}
                formatter={(value: unknown) => [`${Number(value).toLocaleString()} 🏆`, 'Trophées']}
              />
              <Area
                type="monotone"
                dataKey="trophies"
                stroke="#facc15"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#trophyGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Roster Summary / Quick Push */}
      <div className="esport-card p-4 sm:p-6 rounded-2xl">
        <h3 className="font-extrabold text-base sm:text-lg text-white mb-4">
          Vos Brawlers les plus forts
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {profile.brawlers
            .slice()
            .sort((a, b) => b.trophies - a.trophies)
            .slice(0, 6)
            .map((brawler) => (
              <div
                key={brawler.id}
                className="relative bg-slate-900/80 border border-white/10 rounded-xl p-3 flex flex-col items-center text-center group hover:border-yellow-500/40 transition-all"
              >
                <div className="w-14 h-14 relative rounded-xl overflow-hidden bg-slate-800 border border-white/10 mb-2">
                  <img
                    src={`https://cdn.brawlify.com/brawlers/borderless/${brawler.id}.png`}
                    alt={brawler.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform"
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
                {brawler.currentWinStreak && brawler.currentWinStreak > 0 ? (
                  <span className="text-[10px] text-emerald-400 font-bold mt-1">
                    🔥 {brawler.currentWinStreak} win streak
                  </span>
                ) : null}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
