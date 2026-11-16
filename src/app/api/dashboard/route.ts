import { NextRequest, NextResponse } from 'next/server';
import {
  fetchPlayerProfile,
  fetchPlayerBattleLog,
  fetchEventsRotation,
} from '@/lib/brawlstars-api';
import { getGameModesDictionary } from '@/lib/gamemodes-service';
import {
  getEasyTrophyOpportunities,
  getMapRecommendations,
  analyzeBattleLog,
  generateSessionObjectives,
  analyzeLossPatterns,
  detectUpgradePriorities,
  calculateMilestoneRoad,
  generateComprehensiveTacticalTips,
} from '@/lib/strategy-engine';
import {
  recordPlayerSnapshot,
  syncBattleLog,
  getPlayerProgression,
} from '@/lib/stats-recorder';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tag = searchParams.get('tag') || process.env.DEFAULT_PLAYER_TAG || '#8L80JGJGG';

    // 1. Fetch live data concurrently
    const [profile, battleLog, events, gameModes] = await Promise.all([
      fetchPlayerProfile(tag),
      fetchPlayerBattleLog(tag),
      fetchEventsRotation(),
      getGameModesDictionary(),
    ]);

    // 2. Persist snapshot and battles in DB (non-blocking)
    recordPlayerSnapshot(profile).catch((err) =>
      console.error('Failed to record player snapshot:', err)
    );
    syncBattleLog(profile.tag, battleLog).catch((err) =>
      console.error('Failed to sync battle log:', err)
    );

    // 3. Run strategic analytics & new tactical modules
    const easyTrophies = getEasyTrophyOpportunities(profile.brawlers);
    const mapRecommendations = getMapRecommendations(events, profile.brawlers);
    const battleSummary = analyzeBattleLog(battleLog.items, profile.tag);
    const progression = await getPlayerProgression(profile.tag);

    const sessionObjectives = generateSessionObjectives(profile, battleSummary);
    const lossReport = analyzeLossPatterns(battleLog.items, profile.tag);
    const upgradePriorities = detectUpgradePriorities(profile);
    const milestoneRoad = calculateMilestoneRoad(profile, progression);

    const tips = generateComprehensiveTacticalTips(
      profile,
      battleSummary,
      lossReport,
      upgradePriorities,
      milestoneRoad
    );

    return NextResponse.json({
      success: true,
      profile,
      easyTrophies,
      mapRecommendations,
      battleSummary,
      tips,
      sessionObjectives,
      lossReport,
      upgradePriorities,
      milestoneRoad,
      progression,
      recentBattles: battleLog.items.slice(0, 15),
      gameModes,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Une erreur inconnue est survenue';
    console.error('API /api/dashboard error:', error);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
