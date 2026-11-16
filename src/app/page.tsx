'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Navbar } from '@/components/Navbar';
import { DesktopNav } from '@/components/DesktopNav';
import { BottomNav, TabType } from '@/components/BottomNav';
import { OverviewTab } from '@/components/tabs/OverviewTab';
import { TrophiesTab } from '@/components/tabs/TrophiesTab';
import { MapsTab } from '@/components/tabs/MapsTab';
import { BattleLogTab } from '@/components/tabs/BattleLogTab';
import { CoachTab } from '@/components/tabs/CoachTab';
import {
  PlayerProfile,
  StrategyRecommendation,
  ActiveEvent,
  PlayerBrawler,
  BattleLogSummary,
  BattleItem,
} from '@/types/brawlstars';
import { AlertTriangle } from 'lucide-react';

export default function HomePage() {
  const [currentTab, setCurrentTab] = useState<TabType>('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [profile, setProfile] = useState<PlayerProfile | null>(null);
  const [easyTrophies, setEasyTrophies] = useState<StrategyRecommendation[]>([]);
  const [mapRecommendations, setMapRecommendations] = useState<
    Array<{ event: ActiveEvent; recommendedBrawlers: PlayerBrawler[] }>
  >([]);
  const [battleSummary, setBattleSummary] = useState<BattleLogSummary | null>(null);
  const [coachTips, setCoachTips] = useState<
    Array<{ title: string; message: string; priority: 'high' | 'medium' | 'low'; icon: string }>
  >([]);
  const [progression, setProgression] = useState<
    Array<{ date: string; trophies: number; rankedElo?: number | null }>
  >([]);
  const [recentBattles, setRecentBattles] = useState<BattleItem[]>([]);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/dashboard');
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Erreur lors de la récupération des données.');
      }
      setProfile(data.profile);
      setEasyTrophies(data.easyTrophies || []);
      setMapRecommendations(data.mapRecommendations || []);
      setBattleSummary(data.battleSummary);
      setCoachTips(data.coachTips || []);
      setProgression(data.progression || []);
      setRecentBattles(data.recentBattles || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Une erreur inattendue est survenue.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col selection:bg-yellow-500 selection:text-black">
      <Navbar profile={profile} loading={loading} onRefresh={loadData} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-12">
        <DesktopNav
          currentTab={currentTab}
          onChangeTab={setCurrentTab}
          easyCount={easyTrophies.length}
        />

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-red-950/40 border border-red-500/40 flex items-start gap-3 text-red-200">
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-bold text-sm text-red-300">Erreur de chargement</h4>
              <p className="text-xs text-red-400/90 mt-1">{error}</p>
              <button
                onClick={loadData}
                className="mt-3 px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-xs font-bold text-red-300 transition-all cursor-pointer"
              >
                Réessayer
              </button>
            </div>
          </div>
        )}

        {loading && !profile ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <div className="w-12 h-12 rounded-full border-4 border-yellow-500/20 border-t-yellow-400 animate-spin" />
            <div className="text-center">
              <p className="font-bold text-white text-base">Chargement de votre compte Brawl Stars...</p>
              <p className="text-xs text-slate-400 mt-1">Analyse des 25 derniers combats et des maps actives</p>
            </div>
          </div>
        ) : profile && battleSummary ? (
          <div>
            {currentTab === 'overview' && (
              <OverviewTab
                profile={profile}
                battleSummary={battleSummary}
                progression={progression}
                coachTips={coachTips}
                onGoToCoach={() => setCurrentTab('coach')}
                onGoToRush={() => setCurrentTab('trophies')}
              />
            )}

            {currentTab === 'trophies' && (
              <TrophiesTab brawlers={profile.brawlers} easyTrophies={easyTrophies} />
            )}

            {currentTab === 'maps' && <MapsTab mapRecommendations={mapRecommendations} />}

            {currentTab === 'battles' && (
              <BattleLogTab
                summary={battleSummary}
                recentBattles={recentBattles}
                myTag={profile.tag}
              />
            )}

            {currentTab === 'coach' && (
              <CoachTab profile={profile} battleSummary={battleSummary} coachTips={coachTips} />
            )}
          </div>
        ) : null}
      </main>

      <BottomNav
        currentTab={currentTab}
        onChangeTab={setCurrentTab}
        easyCount={easyTrophies.length}
      />
    </div>
  );
}
