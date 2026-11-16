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
import { CoachMascot } from '@/components/ui/CoachMascot';
import { EmptyState } from '@/components/ui/EmptyState';
import { TagModal } from '@/components/ui/TagModal';
import {
  PlayerProfile,
  StrategyRecommendation,
  ActiveEvent,
  PlayerBrawler,
  BattleLogSummary,
  BattleItem,
  TacticalTip,
  SessionObjective,
  LossPatternReport,
  UpgradePriorityItem,
  MilestoneRoad,
} from '@/types/brawlstars';

export default function HomePage() {
  const [currentTab, setCurrentTab] = useState<TabType>('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Player Tag state (stored in localStorage)
  const [currentTag, setCurrentTag] = useState<string>('#8L80JGJGG');
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);

  const [profile, setProfile] = useState<PlayerProfile | null>(null);
  const [easyTrophies, setEasyTrophies] = useState<StrategyRecommendation[]>([]);
  const [mapRecommendations, setMapRecommendations] = useState<
    Array<{ event: ActiveEvent; recommendedBrawlers: PlayerBrawler[] }>
  >([]);
  const [battleSummary, setBattleSummary] = useState<BattleLogSummary | null>(null);
  const [tacticalTips, setTacticalTips] = useState<TacticalTip[]>([]);
  const [sessionObjectives, setSessionObjectives] = useState<SessionObjective[]>([]);
  const [lossReport, setLossReport] = useState<LossPatternReport | null>(null);
  const [upgradePriorities, setUpgradePriorities] = useState<UpgradePriorityItem[]>([]);
  const [milestoneRoad, setMilestoneRoad] = useState<MilestoneRoad | null>(null);
  const [progression, setProgression] = useState<
    Array<{ date: string; trophies: number; rankedElo?: number | null; fullDate?: string }>
  >([]);
  const [recentBattles, setRecentBattles] = useState<BattleItem[]>([]);

  const loadData = useCallback(async (tagOverride?: string) => {
    setLoading(true);
    setError(null);
    try {
      const activeTag =
        tagOverride ||
        (typeof window !== 'undefined' && localStorage.getItem('bs_player_tag')) ||
        '#8L80JGJGG';
      const res = await fetch(`/api/dashboard?tag=${encodeURIComponent(activeTag)}`);
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Erreur lors de la récupération des données.');
      }
      setProfile(data.profile);
      setEasyTrophies(data.easyTrophies || []);
      setMapRecommendations(data.mapRecommendations || []);
      setBattleSummary(data.battleSummary);
      setTacticalTips(data.tips || []);
      setSessionObjectives(data.sessionObjectives || []);
      setLossReport(data.lossReport || null);
      setUpgradePriorities(data.upgradePriorities || []);
      setMilestoneRoad(data.milestoneRoad || null);
      setProgression(data.progression || []);
      setRecentBattles(data.recentBattles || []);
      setLastUpdated(new Date());
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Une erreur inattendue est survenue.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load saved tag from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('bs_player_tag');
    if (saved) {
      setCurrentTag(saved);
      loadData(saved);
    } else {
      loadData('#8L80JGJGG');
    }
  }, [loadData]);

  const handleSelectTag = (newTag: string) => {
    setCurrentTag(newTag);
    localStorage.setItem('bs_player_tag', newTag);
    loadData(newTag);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar
        profile={profile}
        loading={loading}
        onRefresh={() => loadData()}
        lastUpdated={lastUpdated}
        onOpenTagModal={() => setIsTagModalOpen(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-12">
        <DesktopNav
          currentTab={currentTab}
          onChangeTab={setCurrentTab}
          easyCount={easyTrophies.length}
        />

        {error && (
          <EmptyState
            title="Connexion interrompue"
            description={error}
            mood="tilt"
            onRetry={() => loadData()}
            retryLabel="Réessayer la connexion"
            className="my-8"
          />
        )}

        {loading && !profile ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <CoachMascot mood="pumped" size={96} className="animate-bounce" />
            <div className="text-center">
              <h3 className="font-cartoon text-xl text-white text-stroke-sm">
                Synchronisation de Brawl Stars...
              </h3>
              <p className="text-xs text-slate-300 font-bold mt-1">
                Coach Bitz analyse vos 25 derniers combats et vos maps
              </p>
            </div>
          </div>
        ) : profile && battleSummary ? (
          <div>
            {currentTab === 'overview' && (
              <OverviewTab
                profile={profile}
                battleSummary={battleSummary}
                progression={progression}
                coachTips={tacticalTips}
                sessionObjectives={sessionObjectives}
                milestoneRoad={milestoneRoad}
                lossReport={lossReport}
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
              <CoachTab
                profile={profile}
                battleSummary={battleSummary}
                coachTips={tacticalTips}
                sessionObjectives={sessionObjectives}
                lossReport={lossReport}
                upgradePriorities={upgradePriorities}
                milestoneRoad={milestoneRoad}
              />
            )}
          </div>
        ) : null}
      </main>

      {/* Mobile Bottom Navigation */}
      <BottomNav
        currentTab={currentTab}
        onChangeTab={setCurrentTab}
        easyCount={easyTrophies.length}
      />

      {/* Tag Switcher Modal */}
      <TagModal
        isOpen={isTagModalOpen}
        onClose={() => setIsTagModalOpen(false)}
        currentTag={currentTag}
        onSelectTag={handleSelectTag}
      />

      {/* Disclaimer Footer (Supercell Fan Content Policy) */}
      <footer className="w-full border-t-2 border-[#070b16]/60 bg-[#0d122c]/90 py-5 text-center px-4 text-xs text-slate-400 font-medium">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[11px] leading-relaxed">
            Ce contenu n&apos;est pas affilié, soutenu, sponsorisé ou spécifiquement approuvé par Supercell
            et Supercell n&apos;en est pas responsable. Pour plus d&apos;informations, consultez le Règlement sur les Contenus de Fans de Supercell.
          </p>
          <a
            href="https://github.com/fremjulio-gif/BS-Helper"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] font-bold text-yellow-400 hover:text-yellow-300 underline shrink-0"
          >
            GitHub fremjulio-gif/BS-Helper
          </a>
        </div>
      </footer>
    </div>
  );
}
