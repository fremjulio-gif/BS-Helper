import {
  PlayerProfile,
  PlayerBrawler,
  ActiveEvent,
  BattleItem,
  BattleLogSummary,
  StrategyRecommendation,
} from '@/types/brawlstars';

// Brawler recommendations by mode archetypes
const MODE_RECOMMENDATIONS: Record<string, string[]> = {
  brawlBall: ['FRANK', 'BUZZ', 'SHELLY', 'STU', 'FANG', 'SURGE', 'MORTIS', 'TARA', 'MAX'],
  heist: ['COLT', 'SPIKE', 'BULL', 'CHUCK', 'COLETTE', 'JESSIE', 'CROW', 'DYNAMIKE'],
  gemGrab: ['GENE', 'TARA', 'POCO', 'JESSIE', 'SPIKE', 'SANDY', 'BO', 'SQUEAK'],
  knockout: ['PIPER', 'BROCK', 'BYRON', 'ANGELO', 'NANI', 'MANDY', 'BELLE', 'GUS'],
  bounty: ['PIPER', 'NANI', 'BROCK', 'BYRON', 'MANDY', 'ANGELO', 'TICK'],
  soloShowdown: ['EDGAR', 'KIT', 'BUZZ', 'LEON', 'CORDELIUS', 'SURGE', 'SPIKE'],
  duoShowdown: ['SQUEAK', 'EDGAR', 'BYRON', 'BUZZ', 'SPIKE', 'KIT', 'COLT', 'MAX'],
  megaDuoShowdown: ['SQUEAK', 'EDGAR', 'BUZZ', 'SPIKE', 'KIT', 'SHELLY', 'COLT'],
  megaShowdown: ['EDGAR', 'KIT', 'BUZZ', 'SHELLY', 'SURGE', 'SPIKE'],
  hotZone: ['LOU', 'EMZ', 'PENNY', 'JESSIE', 'SANDY', 'SQUEAK', 'AMBER'],
  wipeout: ['PIPER', 'BROCK', 'BELLE', 'NANI', 'ANGELO', 'BYRON'],
};

/**
 * Detects easy trophy opportunities:
 * - Low trophy brawlers (< 300 / < 500) with decent power level
 * - Tilted brawlers that dropped from their highest mark
 */
export function getEasyTrophyOpportunities(brawlers: PlayerBrawler[]): StrategyRecommendation[] {
  const recommendations: StrategyRecommendation[] = [];

  for (const brawler of brawlers) {
    const trophyDeficit = brawler.highestTrophies - brawler.trophies;

    // 1. Tilt Recovery (lost 25+ trophies from record)
    if (trophyDeficit >= 25 && brawler.highestTrophies >= 400) {
      recommendations.push({
        type: 'tilt_recovery',
        title: `Récupération de Tilt : ${brawler.name}`,
        brawlerName: brawler.name,
        brawlerId: brawler.id,
        power: brawler.power,
        currentTrophies: brawler.trophies,
        targetTrophies: brawler.highestTrophies,
        reason: `Vous avez perdu ${trophyDeficit} trophées par rapport à votre record (${brawler.highestTrophies}). Ces trophées sont faciles à regagner !`,
        difficulty: trophyDeficit > 50 ? 'Modéré' : 'Facile',
      });
    }

    // 2. High Power with Low Trophies (Easy Farm)
    if (brawler.power >= 7 && brawler.trophies < 300) {
      recommendations.push({
        type: 'easy_trophies',
        title: `Boost Express : ${brawler.name}`,
        brawlerName: brawler.name,
        brawlerId: brawler.id,
        power: brawler.power,
        currentTrophies: brawler.trophies,
        targetTrophies: 500,
        reason: `Niveau ${brawler.power} avec seulement ${brawler.trophies} trophées ! Le matchmaking sera très avantageux jusqu'à 500 trophées.`,
        difficulty: 'Très Facile',
      });
    } else if (brawler.trophies < 100) {
      // 3. Almost fresh brawlers (bot matchmaking)
      recommendations.push({
        type: 'easy_trophies',
        title: `Trophées Gratuits : ${brawler.name}`,
        brawlerName: brawler.name,
        brawlerId: brawler.id,
        power: brawler.power,
        currentTrophies: brawler.trophies,
        targetTrophies: 300,
        reason: `Moins de 100 trophées (${brawler.trophies}). Matchmaking 100% sécurisé avec gain maximal par victoire.`,
        difficulty: 'Très Facile',
      });
    }
  }

  // Sort: 'Très Facile' first, then 'Facile'
  const diffOrder = { 'Très Facile': 0, Facile: 1, Modéré: 2 };
  return recommendations.sort((a, b) => {
    return diffOrder[a.difficulty] - diffOrder[b.difficulty];
  });
}

/**
 * Cross-references active events with the player's available Brawlers
 */
export function getMapRecommendations(
  events: ActiveEvent[],
  brawlers: PlayerBrawler[]
): { event: ActiveEvent; recommendedBrawlers: PlayerBrawler[] }[] {
  const brawlerMap = new Map(brawlers.map((b) => [b.name.toUpperCase(), b]));

  return events.slice(0, 8).map((evt) => {
    const modeKey = evt.event.mode;
    const metaBrawlerNames = MODE_RECOMMENDATIONS[modeKey] || [
      'SPIKE',
      'COLT',
      'SHELLY',
      'JESSIE',
      'BUZZ',
    ];

    const matchedBrawlers: PlayerBrawler[] = [];
    for (const name of metaBrawlerNames) {
      const brawler = brawlerMap.get(name);
      if (brawler && brawler.power >= 7) {
        matchedBrawlers.push(brawler);
      }
    }

    // Sort matched brawlers by power and winstreak
    matchedBrawlers.sort((a, b) => b.power - a.power || (b.currentWinStreak || 0) - (a.currentWinStreak || 0));

    return {
      event: evt,
      recommendedBrawlers: matchedBrawlers.slice(0, 3),
    };
  });
}

/**
 * Analyzes the user's last 25 battles
 */
export function analyzeBattleLog(battles: BattleItem[], myTag: string): BattleLogSummary {
  const normalizedMyTag = myTag.trim().toUpperCase().replace('#', '');

  let victories = 0;
  let defeats = 0;
  let draws = 0;
  let starPlayerCount = 0;
  let trophyDelta = 0;

  const modeStats: Record<string, { total: number; wins: number; winRate: number }> = {};
  const brawlerPerformance: Record<
    string,
    { played: number; wins: number; winRate: number; trophyDelta: number }
  > = {};

  for (const item of battles) {
    const battle = item.battle;
    const mode = item.event.mode || battle.mode || 'unknown';

    if (!modeStats[mode]) {
      modeStats[mode] = { total: 0, wins: 0, winRate: 0 };
    }
    modeStats[mode].total += 1;

    // Check if player won
    let isWin = false;
    let myBrawlerName = 'Unknown';

    // Check in teams
    if (battle.teams) {
      for (const team of battle.teams) {
        for (const player of team) {
          if (player.tag.replace('#', '') === normalizedMyTag) {
            myBrawlerName = player.brawler.name;
          }
        }
      }
    }

    // Check in single players list
    if (battle.players) {
      for (const player of battle.players) {
        if (player.tag.replace('#', '') === normalizedMyTag) {
          myBrawlerName = player.brawler.name;
        }
      }
    }

    // Determine victory by result or rank
    if (battle.result === 'victory') {
      isWin = true;
    } else if (battle.result === 'draw') {
      draws += 1;
    } else if (typeof battle.rank === 'number') {
      // In Showdown / Duo Showdown: rank 1 to 4 is considered a win / positive
      if (battle.mode === 'duoShowdown' || battle.mode === 'megaDuoShowdown') {
        isWin = battle.rank <= 2;
      } else {
        isWin = battle.rank <= 4;
      }
    }

    if (isWin) {
      victories += 1;
      modeStats[mode].wins += 1;
    } else if (battle.result !== 'draw') {
      defeats += 1;
    }

    // Trophy change
    if (typeof battle.trophyChange === 'number') {
      trophyDelta += battle.trophyChange;
    }

    // Star player
    if (battle.starPlayer && battle.starPlayer.tag.replace('#', '') === normalizedMyTag) {
      starPlayerCount += 1;
    }

    // Brawler stats
    if (!brawlerPerformance[myBrawlerName]) {
      brawlerPerformance[myBrawlerName] = { played: 0, wins: 0, winRate: 0, trophyDelta: 0 };
    }
    brawlerPerformance[myBrawlerName].played += 1;
    if (isWin) brawlerPerformance[myBrawlerName].wins += 1;
    if (typeof battle.trophyChange === 'number') {
      brawlerPerformance[myBrawlerName].trophyDelta += battle.trophyChange;
    }
  }

  // Calculate percentages
  const totalBattles = battles.length;
  const winRate = totalBattles > 0 ? Math.round((victories / totalBattles) * 100) : 0;
  const starPlayerRate = totalBattles > 0 ? Math.round((starPlayerCount / totalBattles) * 100) : 0;

  for (const m in modeStats) {
    modeStats[m].winRate = Math.round((modeStats[m].wins / modeStats[m].total) * 100);
  }
  for (const b in brawlerPerformance) {
    brawlerPerformance[b].winRate = Math.round(
      (brawlerPerformance[b].wins / brawlerPerformance[b].played) * 100
    );
  }

  return {
    totalBattles,
    victories,
    defeats,
    draws,
    winRate,
    starPlayerCount,
    starPlayerRate,
    trophyDelta,
    modeStats,
    brawlerPerformance,
  };
}

/**
 * Generate tactical coach recommendations based on player profile and recent battle log
 */
export function generateCoachTips(
  profile: PlayerProfile,
  summary: BattleLogSummary
): { title: string; message: string; priority: 'high' | 'medium' | 'low'; icon: string }[] {
  const tips: { title: string; message: string; priority: 'high' | 'medium' | 'low'; icon: string }[] = [];

  // Tip 1: Winrate & momentum
  if (summary.winRate >= 70) {
    tips.push({
      title: 'Session en Feu 🔥',
      message: `Votre winrate actuel est de ${summary.winRate}% sur les derniers combats (+${summary.trophyDelta} trophées). Profitez de ce momentum avec vos Brawlers favoris !`,
      priority: 'high',
      icon: 'flame',
    });
  } else if (summary.winRate < 45 && summary.totalBattles >= 5) {
    tips.push({
      title: 'Alerte Tilt / Fatigue 🛑',
      message: `Vous êtes à ${summary.winRate}% de victoires récemment (${summary.trophyDelta} trophées). Faites une pause ou basculez sur des Brawlers de bas rang pour retrouver du rythme sans risque.`,
      priority: 'high',
      icon: 'shield-alert',
    });
  }

  // Tip 2: Best performing mode
  let bestMode = '';
  let bestModeWinrate = -1;
  for (const [mode, stat] of Object.entries(summary.modeStats)) {
    if (stat.total >= 3 && stat.winRate > bestModeWinrate) {
      bestMode = mode;
      bestModeWinrate = stat.winRate;
    }
  }
  if (bestMode && bestModeWinrate >= 60) {
    tips.push({
      title: `Domination en ${bestMode} 🎯`,
      message: `Vous affichez ${bestModeWinrate}% de victoire dans ce mode ! C'est votre mode le plus rentable actuellement pour farmer les trophées.`,
      priority: 'medium',
      icon: 'trophy',
    });
  }

  // Tip 3: Star Player Impact
  if (summary.starPlayerRate >= 20) {
    tips.push({
      title: 'Impact MVP Élevé ⭐',
      message: `Vous êtes élu Joueur Étoile dans ${summary.starPlayerRate}% de vos parties. Votre impact individuel est excellent. En équipe coordonnée, votre progression sera encore plus rapide.`,
      priority: 'medium',
      icon: 'star',
    });
  }

  // Tip 4: Top Brawlers to push
  const lowTrophyBrawlers = profile.brawlers.filter((b) => b.trophies < 300);
  if (lowTrophyBrawlers.length > 0) {
    tips.push({
      title: `${lowTrophyBrawlers.length} Brawlers en réserve d'or 🏆`,
      message: `Vous possédez ${lowTrophyBrawlers.length} Brawlers sous les 300 trophées. Monter chacun d'eux à 500 trophées rapporterait plus de ${(lowTrophyBrawlers.length * 200).toLocaleString()} trophées à votre compte global !`,
      priority: 'high',
      icon: 'zap',
    });
  }

  return tips;
}
