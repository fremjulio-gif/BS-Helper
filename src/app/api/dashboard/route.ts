import { NextRequest, NextResponse } from 'next/server';
import {
  fetchPlayerProfile,
  fetchPlayerBattleLog,
  fetchEventsRotation,
} from '@/lib/brawlstars-api';
import {
  getEasyTrophyOpportunities,
  getMapRecommendations,
  analyzeBattleLog,
  generateCoachTips,
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
    const [profile, battleLog, events] = await Promise.all([
      fetchPlayerProfile(tag),
      fetchPlayerBattleLog(tag),
      fetchEventsRotation(),
    ]);

    // 2. Persist snapshot and battles in DB (non-blocking)
    recordPlayerSnapshot(profile).catch((err) =>
      console.error('Failed to record player snapshot:', err)
    );
    syncBattleLog(profile.tag, battleLog).catch((err) =>
      console.error('Failed to sync battle log:', err)
    );

    // 3. Run strategic analytics
    const easyTrophies = getEasyTrophyOpportunities(profile.brawlers);
    const mapRecommendations = getMapRecommendations(events, profile.brawlers);
    const battleSummary = analyzeBattleLog(battleLog.items, profile.tag);
    const coachTips = generateCoachTips(profile, battleSummary);
    const progression = await getPlayerProgression(profile.tag);

    return NextResponse.json({
      success: true,
      profile,
      easyTrophies,
      mapRecommendations,
      battleSummary,
      coachTips,
      progression,
      recentBattles: battleLog.items.slice(0, 10),
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
