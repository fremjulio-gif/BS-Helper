import {
  PlayerProfile,
  PlayerBrawler,
  ActiveEvent,
  BattleItem,
  BattleLogSummary,
  StrategyRecommendation,
  TacticalTip,
  SessionObjective,
  LossPatternReport,
  UpgradePriorityItem,
  MilestoneRoad,
} from '@/types/brawlstars';
import { MODE_TACTICAL_RULES, DID_YOU_KNOW_TRIVIA } from './tips-content';

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
 * - Low trophy brawlers (< 300 / < 500)
 * - Tilted brawlers that dropped from their highest mark
 */
export function getEasyTrophyOpportunities(brawlers: PlayerBrawler[]): StrategyRecommendation[] {
  const recommendations: StrategyRecommendation[] = [];

  for (const brawler of brawlers) {
    const trophyDeficit = brawler.highestTrophies - brawler.trophies;

    // 1. Tilt Recovery (lost 25+ trophies from personal best)
    if (trophyDeficit >= 25 && brawler.highestTrophies >= 400) {
      recommendations.push({
        type: 'tilt_recovery',
        title: `Récupération de Tilt : ${brawler.name}`,
        brawlerName: brawler.name,
        brawlerId: brawler.id,
        power: brawler.power,
        currentTrophies: brawler.trophies,
        targetTrophies: brawler.highestTrophies,
        reason: `Déficit de ${trophyDeficit} trophées par rapport à votre record (${brawler.highestTrophies}). Palier déjà maîtrisé, idéal pour regagner des points rapidement.`,
        difficulty: trophyDeficit > 50 ? 'Modéré' : 'Facile',
      });
    }

    // 2. High Power with Low Trophies
    if (brawler.power >= 7 && brawler.trophies < 300) {
      recommendations.push({
        type: 'easy_trophies',
        title: `Boost Express : ${brawler.name}`,
        brawlerName: brawler.name,
        brawlerId: brawler.id,
        power: brawler.power,
        currentTrophies: brawler.trophies,
        targetTrophies: 300,
        reason: `Niveau de pouvoir ${brawler.power} avec seulement ${brawler.trophies} trophées. Matchmaking très accessible jusqu'au palier 300.`,
        difficulty: 'Très Facile',
      });
    } else if (brawler.trophies < 100) {
      recommendations.push({
        type: 'easy_trophies',
        title: `Trophées d'Or : ${brawler.name}`,
        brawlerName: brawler.name,
        brawlerId: brawler.id,
        power: brawler.power,
        currentTrophies: brawler.trophies,
        targetTrophies: 200,
        reason: `Seulement ${brawler.trophies} trophées. Gains maximaux par victoire et risque minimal de défaite.`,
        difficulty: 'Très Facile',
      });
    }
  }

  const diffOrder = { 'Très Facile': 0, Facile: 1, Modéré: 2 };
  return recommendations.sort((a, b) => diffOrder[a.difficulty] - diffOrder[b.difficulty]);
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

    matchedBrawlers.sort(
      (a, b) => b.power - a.power || (b.currentWinStreak || 0) - (a.currentWinStreak || 0)
    );

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

    let isWin = false;
    let myBrawlerName = 'Unknown';

    if (battle.teams) {
      for (const team of battle.teams) {
        for (const player of team) {
          if (player.tag.replace('#', '') === normalizedMyTag) {
            myBrawlerName = player.brawler.name;
          }
        }
      }
    }

    if (battle.players) {
      for (const player of battle.players) {
        if (player.tag.replace('#', '') === normalizedMyTag) {
          myBrawlerName = player.brawler.name;
        }
      }
    }

    if (battle.result === 'victory') {
      isWin = true;
    } else if (battle.result === 'draw') {
      draws += 1;
    } else if (typeof battle.rank === 'number') {
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

    if (typeof battle.trophyChange === 'number') {
      trophyDelta += battle.trophyChange;
    }

    if (battle.starPlayer && battle.starPlayer.tag.replace('#', '') === normalizedMyTag) {
      starPlayerCount += 1;
    }

    if (!brawlerPerformance[myBrawlerName]) {
      brawlerPerformance[myBrawlerName] = { played: 0, wins: 0, winRate: 0, trophyDelta: 0 };
    }
    brawlerPerformance[myBrawlerName].played += 1;
    if (isWin) brawlerPerformance[myBrawlerName].wins += 1;
    if (typeof battle.trophyChange === 'number') {
      brawlerPerformance[myBrawlerName].trophyDelta += battle.trophyChange;
    }
  }

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

/* ============================================================
   NOUVEAUX MODULES TACTIQUES AVANCÉS (PHASE 3)
   ============================================================ */

/**
 * 1. Plan de Session / Objectifs du jour
 */
export function generateSessionObjectives(
  profile: PlayerProfile,
  summary: BattleLogSummary
): SessionObjective[] {
  const objectives: SessionObjective[] = [];

  // Objective A: Push low-trophy brawler
  const lowBrawler = profile.brawlers.find((b) => b.trophies < 300 && b.power >= 7) ||
    profile.brawlers.find((b) => b.trophies < 150);

  if (lowBrawler) {
    const target = lowBrawler.trophies < 100 ? 200 : 300;
    const diff = target - lowBrawler.trophies;
    objectives.push({
      id: 'obj_rush_low',
      title: `Rush Express avec ${lowBrawler.name}`,
      targetDescription: `Atteindre ${target} trophées (actuellement ${lowBrawler.trophies})`,
      current: lowBrawler.trophies,
      target,
      unit: 'trophées',
      completed: lowBrawler.trophies >= target,
      brawlerId: lowBrawler.id,
      brawlerName: lowBrawler.name,
      potentialGain: diff,
    });
  }

  // Objective B: Recover tilted brawler
  const tilted = profile.brawlers
    .filter((b) => b.highestTrophies - b.trophies >= 20)
    .sort((a, b) => (b.highestTrophies - b.trophies) - (a.highestTrophies - a.trophies))[0];

  if (tilted) {
    const deficit = tilted.highestTrophies - tilted.trophies;
    objectives.push({
      id: 'obj_tilt_recovery',
      title: `Récupérer le tilt sur ${tilted.name}`,
      targetDescription: `Remonter à son record personnel de ${tilted.highestTrophies} trophées`,
      current: tilted.trophies,
      target: tilted.highestTrophies,
      unit: 'trophées',
      completed: tilted.trophies >= tilted.highestTrophies,
      brawlerId: tilted.id,
      brawlerName: tilted.name,
      potentialGain: deficit,
    });
  }

  // Objective C: Session win streak / volume
  const targetWins = Math.max(5, summary.victories + 3);
  objectives.push({
    id: 'obj_session_wins',
    title: `Objectif de Session : +${targetWins - summary.victories} Victoires`,
    targetDescription: `Franchir le cap de ${targetWins} victoires récentes`,
    current: summary.victories,
    target: targetWins,
    unit: 'victoires',
    completed: summary.victories >= targetWins,
    potentialGain: (targetWins - summary.victories) * 8,
  });

  return objectives.slice(0, 3);
}

/**
 * 2. Analyse approfondie des défaites & patterns de tilt
 */
export function analyzeLossPatterns(
  battles: BattleItem[],
  myTag: string
): LossPatternReport {
  const normalizedTag = myTag.trim().toUpperCase().replace('#', '');
  let consecutiveLosses = 0;

  for (const item of battles) {
    const b = item.battle;
    const isWin =
      b.result === 'victory' ||
      (typeof b.rank === 'number' &&
        (b.mode?.includes('duo') ? b.rank <= 2 : b.rank <= 4));

    if (!isWin && b.result !== 'draw') {
      consecutiveLosses++;
    } else {
      break;
    }
  }

  // Find worst mode (mode with 3+ losses and lowest winrate)
  const modeCounts: Record<string, { total: number; losses: number }> = {};
  const brawlerLosses: Record<string, { losses: number; trophyDelta: number }> = {};

  for (const item of battles) {
    const mode = item.event.mode || item.battle.mode || 'other';
    if (!modeCounts[mode]) modeCounts[mode] = { total: 0, losses: 0 };
    modeCounts[mode].total++;

    const isWin =
      item.battle.result === 'victory' ||
      (typeof item.battle.rank === 'number' &&
        (item.battle.mode?.includes('duo') ? item.battle.rank <= 2 : item.battle.rank <= 4));

    let myBrawlerName = 'Unknown';
    if (item.battle.teams) {
      for (const t of item.battle.teams) {
        for (const p of t) {
          if (p.tag.replace('#', '') === normalizedTag) myBrawlerName = p.brawler.name;
        }
      }
    } else if (item.battle.players) {
      for (const p of item.battle.players) {
        if (p.tag.replace('#', '') === normalizedTag) myBrawlerName = p.brawler.name;
      }
    }

    if (!brawlerLosses[myBrawlerName]) {
      brawlerLosses[myBrawlerName] = { losses: 0, trophyDelta: 0 };
    }
    if (typeof item.battle.trophyChange === 'number') {
      brawlerLosses[myBrawlerName].trophyDelta += item.battle.trophyChange;
    }

    if (!isWin && item.battle.result !== 'draw') {
      modeCounts[mode].losses++;
      brawlerLosses[myBrawlerName].losses++;
    }
  }

  let worstMode: { mode: string; losses: number; winRate: number } | undefined = undefined;
  for (const [m, data] of Object.entries(modeCounts)) {
    if (data.losses >= 2 && data.total >= 3) {
      const winRate = Math.round(((data.total - data.losses) / data.total) * 100);
      if (!worstMode || winRate < worstMode.winRate) {
        worstMode = { mode: m, losses: data.losses, winRate };
      }
    }
  }

  let worstBrawler: { name: string; losses: number; trophyLoss: number } | undefined = undefined;
  for (const [name, data] of Object.entries(brawlerLosses)) {
    if (data.losses >= 2 && data.trophyDelta < 0) {
      if (!worstBrawler || data.trophyDelta < worstBrawler.trophyLoss) {
        worstBrawler = { name, losses: data.losses, trophyLoss: data.trophyDelta };
      }
    }
  }

  const tiltAlertActive = consecutiveLosses >= 3;
  let cooldownMessage: string | undefined = undefined;
  if (tiltAlertActive) {
    cooldownMessage = `Attention : ${consecutiveLosses} défaites consécutives détectées. Le jeu en état de fatigue réduit les réflexes. Prenez 15 minutes de pause pour réinitialiser le matchmaking !`;
  }

  return {
    consecutiveLosses,
    worstMode,
    worstBrawler,
    tiltAlertActive,
    recommendedPauseMinutes: tiltAlertActive ? 15 : undefined,
    cooldownMessage,
  };
}

/**
 * 3. Détection des priorités d'amélioration (Gain / Effort)
 */
export function detectUpgradePriorities(profile: PlayerProfile): UpgradePriorityItem[] {
  const priorities: UpgradePriorityItem[] = [];

  for (const b of profile.brawlers) {
    // Priority A: Power 8 but high trophies (missing crucial Star Power at Power 9)
    if (b.power === 8 && b.trophies >= 400 && b.starPowers.length === 0) {
      priorities.push({
        brawlerId: b.id,
        brawlerName: b.name,
        currentPower: b.power,
        targetPower: 9,
        trophies: b.trophies,
        missingAccessory: 'Star Power',
        impactDescription: `Vous jouez ${b.name} à ${b.trophies} trophées sans Pouvoir Star. Le passage au niveau 9 débloquera son pouvoir passif décisif.`,
        priority: 'Haute',
      });
    }

    // Priority B: Power 10 with high trophies (missing Hypercharge at Power 11)
    if (b.power === 10 && b.trophies >= 600 && (!b.hyperCharges || b.hyperCharges.length === 0)) {
      priorities.push({
        brawlerId: b.id,
        brawlerName: b.name,
        currentPower: b.power,
        targetPower: 11,
        trophies: b.trophies,
        missingAccessory: 'Niveau 11',
        impactDescription: `Niveau 10 à ${b.trophies} trophées. Au-delà de 600 trophées, l'écart de statistiques contre les joueurs niveau 11 devient sensible.`,
        priority: 'Moyenne',
      });
    }

    // Priority C: Played with 0 gadgets
    if (b.power >= 7 && b.gadgets.length === 0 && b.trophies >= 300) {
      priorities.push({
        brawlerId: b.id,
        brawlerName: b.name,
        currentPower: b.power,
        targetPower: b.power,
        trophies: b.trophies,
        missingAccessory: 'Niveau 9',
        impactDescription: `${b.name} est niveau ${b.power} sans gadget actif. Débloquer un gadget offre 3 jokers tactiques par combat.`,
        priority: 'Haute',
      });
    }
  }

  return priorities.slice(0, 4);
}

/**
 * 4. Objectifs de Trophy Road et calcul du rythme réel
 */
export function calculateMilestoneRoad(
  profile: PlayerProfile,
  progression: Array<{ trophies: number; date: string }>
): MilestoneRoad {
  const current = profile.trophies;
  const nextMilestone = Math.ceil((current + 1) / 500) * 500;
  const remaining = nextMilestone - current;

  // Compute trophy velocity from snapshots if available
  let trophyPerMatchAvg = 7.5;
  if (progression.length >= 5) {
    const delta = current - progression[0].trophies;
    if (delta > 0) {
      trophyPerMatchAvg = Math.max(4, Math.min(10, delta / progression.length));
    }
  }

  const estimatedMatches = Math.ceil(remaining / trophyPerMatchAvg);

  return {
    currentTrophies: current,
    nextMilestone,
    trophiesRemaining: remaining,
    estimatedMatches,
    rankTitle: `Palier ${nextMilestone.toLocaleString()} 🏆`,
    advice: `À votre rythme actuel (~${Math.round(trophyPerMatchAvg)} tr/victoire), il vous reste environ ${estimatedMatches} victoires nettes pour franchir ce cap symbolique.`,
  };
}

/**
 * 5. Moteur de Conseils Tactiques Typés & Justifiés (Le cœur de valeur)
 */
export function generateComprehensiveTacticalTips(
  profile: PlayerProfile,
  summary: BattleLogSummary,
  lossReport: LossPatternReport,
  upgrades: UpgradePriorityItem[],
  milestone: MilestoneRoad
): TacticalTip[] {
  const tips: TacticalTip[] = [];

  // Tip 1: Tilt Emergency Warning
  if (lossReport.tiltAlertActive) {
    tips.push({
      id: 'tip_tilt_active',
      category: 'tilt_warning',
      priority: 'high',
      title: 'Alerte Tilt Active : Pause recommandée 🛑',
      why: `${lossReport.consecutiveLosses} défaites consécutives enregistrées dans vos derniers matchs.`,
      action: 'Faites une pause de 15 minutes ou basculez sur un Brawler sous les 200 trophées pour retrouver du rythme sans stress.',
      confidence: 'Donnée vérifiée',
      tagText: 'Alerte Tilt',
    });
  }

  // Tip 2: Mode Performance Insight
  if (lossReport.worstMode) {
    tips.push({
      id: 'tip_mode_leak',
      category: 'loss_pattern',
      priority: 'high',
      title: `Fuite de trophées en ${lossReport.worstMode.mode.replace(/([A-Z])/g, ' $1')}`,
      why: `${lossReport.worstMode.losses} défaites récemment (${lossReport.worstMode.winRate}% de winrate).`,
      action: 'Évitez ce mode en solo pour le moment, ou changez d\'archétype de Brawler pour un choix plus adapté.',
      mode: lossReport.worstMode.mode,
      confidence: 'Donnée vérifiée',
      tagText: 'Fuite Trophées',
    });
  }

  // Tip 3: Positive Momentum
  if (summary.winRate >= 65 && summary.trophyDelta > 0) {
    tips.push({
      id: 'tip_momentum',
      category: 'session_plan',
      priority: 'medium',
      title: 'Momentum Favorable : Poussez votre avantage 🔥',
      why: `${summary.winRate}% de victoires sur les 25 derniers combats (+${summary.trophyDelta} trophées nets).`,
      action: 'Conservez vos duos et compos actuels pour engranger un maximum de trophées avant la fin de session.',
      confidence: 'Donnée vérifiée',
      tagText: 'Session Forte',
    });
  }

  // Tip 4: Top Upgrade Priority
  if (upgrades.length > 0) {
    const topUpgrade = upgrades[0];
    tips.push({
      id: `tip_upgrade_${topUpgrade.brawlerId}`,
      category: 'upgrade_priority',
      priority: topUpgrade.priority === 'Haute' ? 'high' : 'medium',
      title: `Priorité d'amélioration : ${topUpgrade.brawlerName}`,
      why: topUpgrade.impactDescription,
      action: `Montez ${topUpgrade.brawlerName} au niveau ${topUpgrade.targetPower} pour combler le déficit d'équipement.`,
      brawlerId: topUpgrade.brawlerId,
      brawlerName: topUpgrade.brawlerName,
      confidence: 'Heuristique forte',
      tagText: 'Amélioration',
    });
  }

  // Tip: Tactical Rule for most played mode
  const mostPlayedModeEntry = Object.entries(summary.modeStats).sort(
    (a, b) => b[1].total - a[1].total
  )[0];
  if (mostPlayedModeEntry && MODE_TACTICAL_RULES[mostPlayedModeEntry[0]]) {
    const modeRule = MODE_TACTICAL_RULES[mostPlayedModeEntry[0]];
    tips.push({
      id: `tip_mode_${mostPlayedModeEntry[0]}`,
      category: 'mode_guide',
      priority: 'medium',
      title: `Guide Tactique : ${modeRule.modeName}`,
      why: `Vous avez disputé ${mostPlayedModeEntry[1].total} parties dans ce mode récemment (${mostPlayedModeEntry[1].winRate}% de victoires).`,
      action: modeRule.rules[0] || 'Maîtrisez les rotations et temporisez vos supers.',
      mode: mostPlayedModeEntry[0],
      confidence: 'Conseil tactique',
      tagText: 'Guide Mode',
    });
  }

  // Tip 5: Spike 1200+ High-Elo Advice
  const spike = profile.brawlers.find((b) => b.name.toUpperCase() === 'SPIKE' && b.trophies >= 1000);
  if (spike) {
    tips.push({
      id: 'tip_high_elo_spike',
      category: 'mode_guide',
      priority: 'high',
      title: `Protection High-Elo : Spike (${spike.trophies} 🏆)`,
      why: 'À plus de 1 000 trophées, une défaite coûte jusqu\'à 12 trophées par match.',
      action: 'Ne lancez plus Spike avec des randoms. Jouez exclusivement en équipe coordonnée avec communication vocale.',
      brawlerId: spike.id,
      brawlerName: spike.name,
      confidence: 'Conseil tactique',
      tagText: 'Palier 1000+',
    });
  }

  // Tip 6: Milestone Road Road-Map
  tips.push({
    id: 'tip_milestone',
    category: 'milestone',
    priority: 'medium',
    title: `Cap vers ${milestone.rankTitle}`,
    why: `${milestone.trophiesRemaining} trophées restants pour franchir ce cap majeur.`,
    action: milestone.advice,
    confidence: 'Donnée vérifiée',
    tagText: 'Jalon de rang',
  });

  // Tip 7: Random Gameplay Pro-Tip
  const randomTrivia = DID_YOU_KNOW_TRIVIA[Math.floor(Math.random() * DID_YOU_KNOW_TRIVIA.length)];
  tips.push({
    id: 'tip_trivia',
    category: 'trivia',
    priority: 'low',
    title: `Le saviez-tu ? ${randomTrivia.title}`,
    why: 'Règle fondamentale des mécaniques du moteur de jeu Brawl Stars.',
    action: randomTrivia.tip,
    confidence: 'Conseil tactique',
    tagText: 'Astuce Pro',
  });

  return tips;
}
