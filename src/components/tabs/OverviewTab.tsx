'use client';

import React, { useState, useEffect } from 'react';
import {
  PlayerProfile,
  BattleLogSummary,
  SessionObjective,
  MilestoneRoad,
  LossPatternReport,
  TacticalTip,
} from '@/types/brawlstars';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { CoachMascot } from '../ui/CoachMascot';
import { BrawlerAvatar } from '../ui/BrawlerAvatar';
import { TrophyCounter } from '../ui/TrophyCounter';
import { ProgressBar } from '../ui/ProgressBar';
import { TabHeader } from '../ui/TabHeader';
import { RankingsCard } from '../ui/RankingsCard';
import { triggerTrophyConfetti } from '../ui/Confetti';
import { getBrawlerFrenchName } from '@/lib/brawler-names';
import { StaggerItem } from '../motion/Stagger';
import { useSettings } from '@/lib/settings-context';
import { soundManager } from '@/lib/sound-manager';
import { m } from 'motion/react';
import {
  Trophy,
  Users,
  Flame,
  Award,
  TrendingUp,
  Sparkles,
  ArrowRight,
  PartyPopper,
  Target,
  CheckCircle2,
  AlertTriangle,
  Compass,
  BarChart3,
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
  coachTips: TacticalTip[];
  sessionObjectives?: SessionObjective[];
  milestoneRoad?: MilestoneRoad | null;
  lossReport?: LossPatternReport | null;
  onGoToCoach: () => void;
  onGoToRush: () => void;
}

export function OverviewTab({
  profile,
  battleSummary,
  progression,
  coachTips,
  sessionObjectives = [],
  milestoneRoad,
  lossReport,
  onGoToCoach,
  onGoToRush,
}: OverviewTabProps) {
  const { reduceMotion } = useSettings();
  const [period, setPeriod] = useState<'24h' | '7d' | 'all'>('all');
  const topTip = coachTips[0];

  // Automatic celebration for new trophy record
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (profile.trophies >= profile.highestTrophies && profile.trophies > 1000) {
      const recordKey = `bs_celebrated_record_${profile.highestTrophies}`;
      if (!localStorage.getItem(recordKey)) {
        localStorage.setItem(recordKey, 'true');
        triggerTrophyConfetti();
        soundManager.playRecord();
      }
    }
  }, [profile.trophies, profile.highestTrophies]);

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
    soundManager.playRecord();
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Unified Tab Header */}
      <TabHeader
        icon={BarChart3}
        title="Vue d'ensemble"
        subtitle="Performances globales, plan de session et progression en direct"
        badge={`${profile.trophies.toLocaleString()} 🏆`}
        rightAction={
          <button
            onClick={handleHeroCelebration}
            title="Célébrer !"
            className="brawl-btn brawl-btn-cyan min-h-[44px] px-3.5 flex items-center gap-2"
          >
            <PartyPopper className="w-4 h-4 text-[#070b16]" />
            <span className="hidden sm:inline text-xs font-cartoon text-[#070b16]">Célébrer</span>
          </button>
        }
      />

      {/* Tilt Warning Banner (if active) */}
      {lossReport?.tiltAlertActive && (
        <m.div
          animate={!reduceMotion ? { x: [-3, 3, -3, 3, 0] } : undefined}
          transition={{ duration: 0.5 }}
          className="brawl-card p-4 sm:p-5 bg-gradient-to-r from-[#45141d] to-[#250d14] border-3 border-[#ef4444] shadow-[0_4px_0_#070b16] flex items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3.5">
            <CoachMascot mood="tilt" size={48} />
            <div>
              <div className="flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-[#ef4444]" />
                <span className="font-cartoon text-sm text-[#ef4444] uppercase tracking-wide">
                  Alerte Tilt Active
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-200 mt-0.5 font-bold">
                {lossReport.cooldownMessage ||
                  `${lossReport.consecutiveLosses} défaites consécutives. Prenez 15 minutes de pause pour réinitialiser le rythme !`}
              </p>
            </div>
          </div>
          <Button variant="red" size="sm" onClick={onGoToCoach}>
            Conseils Anti-Tilt
          </Button>
        </m.div>
      )}

      {/* Hero Action Banner with Coach Bitz Mascot */}
      <div className="brawl-card p-5 sm:p-6 bg-gradient-to-r from-[#2a1d68] via-[#1a2356] to-[#12193e] border-3 border-[#070b16] relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 relative z-10">
          <div className="flex items-start gap-4">
            <CoachMascot
              mood={
                lossReport?.tiltAlertActive
                  ? 'tilt'
                  : battleSummary.winRate >= 60
                  ? 'pumped'
                  : profile.trophies >= profile.highestTrophies
                  ? 'proud'
                  : 'neutral'
              }
              size={68}
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-lg text-xs font-cartoon uppercase bg-[#ffc700] text-[#070b16] border-2 border-[#070b16] shadow-[0_2px_0_#070b16]">
                  Coach Bitz
                </span>
                <span className="text-xs sm:text-sm font-bold text-yellow-300">
                  {battleSummary.winRate >= 60 ? '🔥 Session en feu' : '🎯 Objectif Trophées'}
                </span>
              </div>
              <h3 className="font-cartoon text-lg sm:text-2xl text-white mt-1 text-stroke-sm">
                {topTip ? topTip.title : `Bienvenue, ${profile.name} !`}
              </h3>
              <p className="text-sm text-slate-200 mt-1 max-w-xl font-medium leading-relaxed">
                {topTip
                  ? topTip.action
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
            <span className="text-xs font-bold text-yellow-400/90 block mt-1 tabular-nums">
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
              className={`font-cartoon text-2xl sm:text-3xl text-stroke-sm leading-none tabular-nums ${
                battleSummary.winRate >= 55 ? 'text-[#4ade80]' : 'text-[#f87171]'
              }`}
            >
              {battleSummary.winRate}%
            </span>
            <span className="text-xs font-bold text-slate-300 block mt-1 tabular-nums">
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
            <span className="font-cartoon text-2xl sm:text-3xl text-white text-stroke-sm leading-none tabular-nums">
              {profile['3vs3Victories'].toLocaleString()}
            </span>
            <span className="text-xs font-bold text-[#00d9ff] block mt-1 tabular-nums">
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
            <span className="text-xs font-bold text-[#c084fc] block mt-1 tabular-nums">
              {profile.rankedElo ? `${profile.rankedElo} Elo` : 'En compétition'}
            </span>
          </div>
        </Card>
      </div>

      {/* Surveillance des Classements Officiels Supercell & Objectif Top 200 */}
      <RankingsCard playerTag={profile.tag} />

      {/* Plan de Session & Objectifs Clés */}
      {sessionObjectives.length > 0 && (
        <Card topHighlight={true} className="p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-[#ffc700] border-2 border-[#070b16] text-[#070b16]">
                <Target className="w-5 h-5 fill-[#070b16]" />
              </div>
              <div>
                <h3 className="font-cartoon text-base sm:text-lg text-white">
                  Plan de Session du Jour
                </h3>
                <p className="text-xs text-slate-300 font-medium">
                  3 objectifs concrets calculés à partir de vos statistiques actuelles
                </p>
              </div>
            </div>

            {milestoneRoad && (
              <div className="hidden sm:flex items-center gap-2 bg-[#0d132c] px-3 py-1.5 rounded-xl border-2 border-[#070b16] text-xs">
                <Compass className="w-4 h-4 text-yellow-400" />
                <span className="font-cartoon text-white">{milestoneRoad.rankTitle}</span>
                <span className="text-[11px] text-yellow-400 font-bold">
                  (-{milestoneRoad.trophiesRemaining} tr)
                </span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {sessionObjectives.map((obj) => {
              const progressPct = Math.min(100, Math.round((obj.current / obj.target) * 100));

              return (
                <div
                  key={obj.id}
                  className="brawl-card p-4 bg-[#111634] border-2 border-[#070b16] flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-cartoon text-sm text-white truncate">{obj.title}</span>
                      {obj.completed ? (
                        <CheckCircle2 className="w-4 h-4 text-[#22c55e]" />
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-cartoon bg-[#22c55e]/20 text-[#4ade80] border border-[#22c55e]/40">
                          +{obj.potentialGain} tr
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-300 font-medium mt-1.5 leading-relaxed">
                      {obj.targetDescription}
                    </p>
                  </div>

                  <div className="mt-3 pt-2">
                    <ProgressBar
                      value={progressPct}
                      subLabel={`${obj.current} / ${obj.target} ${obj.unit}`}
                      color={obj.completed ? 'green' : 'yellow'}
                      height="sm"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

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
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="liquid-glass-subtle px-3.5 py-2.5 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] text-xs font-cartoon select-none">
                        <p className="text-slate-300 font-bold mb-1">{label}</p>
                        <p className="text-yellow-400 font-bold flex items-center gap-1.5 tabular-nums">
                          <span className="text-sm">{Number(payload[0].value).toLocaleString()}</span>
                          <span>🏆 Trophées</span>
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="trophies"
                stroke="#ffc700"
                strokeWidth={4}
                fillOpacity={1}
                fill="url(#cartoonTrophyGrad)"
                isAnimationActive={!reduceMotion}
                animationDuration={700}
                activeDot={{
                  r: 6,
                  stroke: '#ffea55',
                  strokeWidth: 3,
                  fill: '#070b16',
                }}
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
            .map((brawler, index) => (
              <StaggerItem key={brawler.id} index={index}>
                <div className="brawl-card p-3 flex flex-col items-center text-center group hover:-translate-y-1 transition-transform">
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
                  {brawler.currentWinStreak && brawler.currentWinStreak > 0 ? (
                    <span className="text-[10px] text-[#4ade80] font-black mt-1 bg-[#22c55e]/15 px-1.5 py-0.2 rounded border border-[#22c55e]/30">
                      🔥 {brawler.currentWinStreak} win streak
                    </span>
                  ) : null}
                </div>
              </StaggerItem>
            ))}
        </div>
      </Card>
    </div>
  );
}
