'use client';

import React, { useState } from 'react';
import { PlayerProfile, BattleLogSummary } from '@/types/brawlstars';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { CoachMascot } from '../ui/CoachMascot';
import { BrawlerAvatar } from '../ui/BrawlerAvatar';
import { TrophyCounter } from '../ui/TrophyCounter';
import { triggerTrophyConfetti } from '../ui/Confetti';
import {
  Trophy,
  Users,
  Flame,
  Award,
  TrendingUp,
  Sparkles,
  ArrowRight,
  PartyPopper,
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
  progression: Array<{ date: string; trophies: number; rankedElo?: number | null; fullDate?: string }>;
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
  const [period, setPeriod] = useState<'24h' | '7d' | 'all'>('all');
  const topTip = coachTips[0];

  // Filter progression according to period
  const filterProgressionData = () => {
    if (progression.length <= 1) {
      return [
        { date: 'Début', trophies: Math.max(0, profile.trophies - 40) },
        { date: 'Maintenant', trophies: profile.trophies },
      ];
    }
    if (period === '24h') {
      return progression.slice(-10);
    }
    if (period === '7d') {
      return progression.slice(-25);
    }
    return progression;
  };

  const chartData = filterProgressionData();

  const handleHeroCelebration = () => {
    triggerTrophyConfetti();
  };

  return (
    <div className="space-y-6">
      {/* Hero Action Banner with Coach Bitz Mascot */}
      <div className="brawl-card p-5 sm:p-6 bg-gradient-to-r from-[#2a1d68] via-[#1a2356] to-[#12193e] border-3 border-[#070b16] relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 relative z-10">
          <div className="flex items-start gap-4">
            <CoachMascot
              mood={battleSummary.winRate < 45 ? 'tilt' : profile.trophies >= profile.highestTrophies ? 'proud' : 'pumped'}
              size={68}
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-lg text-[10px] font-cartoon uppercase bg-[#ffc700] text-[#070b16] border-2 border-[#070b16] shadow-[0_2px_0_#070b16]">
                  Coach Bitz
                </span>
                <span className="text-xs font-bold text-yellow-300">
                  {battleSummary.winRate >= 60 ? '🔥 Session en feu' : '🎯 Objectif Trophées'}
                </span>
              </div>
              <h3 className="font-cartoon text-lg sm:text-2xl text-white mt-1 text-stroke-sm">
                {topTip ? topTip.title : `Bienvenue, ${profile.name} !`}
              </h3>
              <p className="text-xs sm:text-sm text-slate-200 mt-1 max-w-xl font-medium leading-relaxed">
                {topTip
                  ? topTip.message
                  : `Tu as ${profile.trophies.toLocaleString()} trophées. Consulte tes opportunités de rush pour continuer de monter !`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <Button
              variant="yellow"
              size="md"
              icon={<Sparkles className="w-4 h-4" />}
              onClick={onGoToCoach}
              className="flex-1 sm:flex-none"
            >
              Parler à Bitz
            </Button>
            <button
              onClick={handleHeroCelebration}
              title="Célébrer !"
              className="brawl-btn brawl-btn-cyan min-h-[44px] min-w-[44px] px-3"
            >
              <PartyPopper className="w-5 h-5 text-[#070b16]" />
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Trophies KPI */}
        <Card topHighlight={true} className="flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-cartoon text-slate-300 uppercase tracking-wide">
              Trophées
            </span>
            <div className="p-1.5 rounded-xl bg-[#ffc700] border-2 border-[#070b16] text-[#070b16]">
              <Trophy className="w-4 h-4 fill-[#070b16]" />
            </div>
          </div>
          <div className="mt-3">
            <TrophyCounter value={profile.trophies} size="md" showIcon={false} />
            <span className="text-[11px] font-bold text-yellow-400/90 block mt-1">
              Record : {profile.highestTrophies.toLocaleString()} 🏆
            </span>
          </div>
        </Card>

        {/* Winrate KPI */}
        <Card topHighlight={true} className="flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-cartoon text-slate-300 uppercase tracking-wide">
              Winrate Récent
            </span>
            <div
              className={`p-1.5 rounded-xl border-2 border-[#070b16] text-white ${
                battleSummary.winRate >= 55 ? 'bg-[#22c55e]' : 'bg-[#ef4444]'
              }`}
            >
              <Flame className="w-4 h-4 fill-white" />
            </div>
          </div>
          <div className="mt-3">
            <span
              className={`font-cartoon text-2xl sm:text-3xl text-stroke-sm leading-none ${
                battleSummary.winRate >= 55 ? 'text-[#4ade80]' : 'text-[#f87171]'
              }`}
            >
              {battleSummary.winRate}%
            </span>
            <span className="text-[11px] font-bold text-slate-300 block mt-1">
              {battleSummary.victories}V - {battleSummary.defeats}D ({battleSummary.trophyDelta > 0 ? '+' : ''}
              {battleSummary.trophyDelta} tr)
            </span>
          </div>
        </Card>

        {/* 3v3 Wins */}
        <Card topHighlight={true} className="flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-cartoon text-slate-300 uppercase tracking-wide">
              Victoires 3v3
            </span>
            <div className="p-1.5 rounded-xl bg-[#00d9ff] border-2 border-[#070b16] text-[#070b16]">
              <Users className="w-4 h-4 stroke-[2.5px]" />
            </div>
          </div>
          <div className="mt-3">
            <span className="font-cartoon text-2xl sm:text-3xl text-white text-stroke-sm leading-none">
              {profile['3vs3Victories'].toLocaleString()}
            </span>
            <span className="text-[11px] font-bold text-[#00d9ff] block mt-1">
              Solo: {profile.soloVictories} | Duo: {profile.duoVictories}
            </span>
          </div>
        </Card>

        {/* Ranked Tier */}
        <Card topHighlight={true} className="flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-cartoon text-slate-300 uppercase tracking-wide">
              Ligue Classée
            </span>
            <div className="p-1.5 rounded-xl bg-[#a855f7] border-2 border-[#070b16] text-white">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="font-cartoon text-xl sm:text-2xl text-[#c084fc] text-stroke-sm leading-none truncate block">
              {profile.rankedRankName || 'DIAMOND I'}
            </span>
            <span className="text-[11px] font-bold text-[#c084fc] block mt-1">
              {profile.rankedElo ? `${profile.rankedElo} Elo` : 'En compétition'}
            </span>
          </div>
        </Card>
      </div>

      {/* Progression Recharts Graph with Period Selector */}
      <Card topHighlight={true} className="p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#ffc700] border-2 border-[#070b16] text-[#070b16]">
              <TrendingUp className="w-5 h-5 stroke-[2.5px]" />
            </div>
            <div>
              <h3 className="font-cartoon text-base sm:text-lg text-white">
                Progression des Trophées
              </h3>
              <p className="text-xs text-slate-300 font-medium">
                Historique réel enregistré par votre helper
              </p>
            </div>
          </div>

          {/* Period selector */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#0b1029] border-2 border-[#070b16]">
            {(['24h', '7d', 'all'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1 rounded-lg font-cartoon text-xs transition-all cursor-pointer ${
                  period === p
                    ? 'bg-[#ffc700] text-[#070b16] shadow-[0_2px_0_#070b16]'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                {p === '24h' ? '24h' : p === '7d' ? '7 Jours' : 'Tout'}
              </button>
            ))}
          </div>
        </div>

        <div className="h-64 sm:h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="cartoonTrophyGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ffc700" stopOpacity={0.45} />
                  <stop offset="95%" stopColor="#ffc700" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis
                stroke="#94a3b8"
                fontSize={11}
                tickLine={false}
                domain={['dataMin - 60', 'dataMax + 60']}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#12183b',
                  borderColor: '#070b16',
                  borderWidth: '3px',
                  borderRadius: '16px',
                  color: '#ffffff',
                  fontFamily: 'var(--font-nunito)',
                  boxShadow: '0 4px 0 #070b16',
                }}
                formatter={(value: unknown) => [`${Number(value).toLocaleString()} 🏆`, 'Trophées']}
              />
              <Area
                type="monotone"
                dataKey="trophies"
                stroke="#ffc700"
                strokeWidth={4}
                fillOpacity={1}
                fill="url(#cartoonTrophyGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Top Brawlers Collection Grid */}
      <Card topHighlight={true} className="p-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-cartoon text-lg text-white">Vos Brawlers Vedettes</h3>
            <p className="text-xs text-slate-300">Vos plus hauts trophées actuels</p>
          </div>
          <Button
            variant="cyan"
            size="sm"
            onClick={onGoToRush}
            icon={<ArrowRight className="w-4 h-4" />}
          >
            Rush Trophées
          </Button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {profile.brawlers
            .slice()
            .sort((a, b) => b.trophies - a.trophies)
            .slice(0, 6)
            .map((brawler) => (
              <div
                key={brawler.id}
                className="brawl-card p-3 flex flex-col items-center text-center group hover:-translate-y-1 transition-transform"
              >
                <BrawlerAvatar
                  id={brawler.id}
                  name={brawler.name}
                  power={brawler.power}
                  hasHypercharge={Boolean(brawler.hyperCharges && brawler.hyperCharges.length > 0)}
                  size="md"
                  className="mb-2"
                />
                <span className="font-cartoon text-xs text-white truncate max-w-full">
                  {brawler.name}
                </span>
                <span className="font-cartoon text-xs text-[#ffc700] mt-0.5">
                  {brawler.trophies} 🏆
                </span>
                {brawler.currentWinStreak && brawler.currentWinStreak > 0 ? (
                  <span className="text-[10px] text-[#4ade80] font-black mt-1 bg-[#22c55e]/15 px-1.5 py-0.2 rounded border border-[#22c55e]/30">
                    🔥 {brawler.currentWinStreak} win streak
                  </span>
                ) : null}
              </div>
            ))}
        </div>
      </Card>
    </div>
  );
}
