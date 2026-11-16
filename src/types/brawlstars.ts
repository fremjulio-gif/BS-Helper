export interface Accessory {
  id: number;
  name: string;
}

export interface Gear {
  id: number;
  name: string;
  level: number;
}

export interface PlayerBrawler {
  id: number;
  name: string;
  power: number;
  rank: number;
  trophies: number;
  highestTrophies: number;
  gears: Gear[];
  starPowers: Accessory[];
  gadgets: Accessory[];
  hyperCharges?: Accessory[];
  currentWinStreak?: number;
  maxWinStreak?: number;
  skin?: {
    id: number;
    name: string;
  };
}

export interface PlayerProfile {
  tag: string;
  name: string;
  nameColor: string;
  icon: { id: number };
  trophies: number;
  highestTrophies: number;
  expLevel: number;
  expPoints: number;
  isQualifiedFromChampionshipChallenge: boolean;
  '3vs3Victories': number;
  soloVictories: number;
  duoVictories: number;
  rankedRank?: number;
  rankedRankName?: string;
  rankedElo?: number;
  highestAllTimeRankedRankName?: string;
  highestAllTimeRankedElo?: number;
  brawlers: PlayerBrawler[];
}

export interface BattleBrawler {
  id: number;
  name: string;
  power: number;
  trophies?: number;
}

export interface BattlePlayer {
  tag: string;
  name: string;
  brawler: BattleBrawler;
}

export interface BattleItem {
  battleTime: string;
  event: {
    id: number;
    mode: string;
    map?: string;
  };
  battle: {
    mode: string;
    type?: string;
    result?: 'victory' | 'defeat' | 'draw';
    rank?: number;
    duration?: number;
    trophyChange?: number;
    starPlayer?: BattlePlayer;
    teams?: BattlePlayer[][];
    players?: BattlePlayer[];
  };
}

export interface BattleLogResponse {
  items: BattleItem[];
}

export interface ActiveEvent {
  startTime: string;
  endTime: string;
  slotId: number;
  event: {
    id: number;
    mode: string;
    modeId?: number;
    map: string;
    modifiers?: string[];
  };
}

export interface StrategyRecommendation {
  type: 'easy_trophies' | 'tilt_recovery' | 'map_meta' | 'warning';
  title: string;
  brawlerName: string;
  brawlerId: number;
  power: number;
  currentTrophies: number;
  targetTrophies?: number;
  reason: string;
  difficulty: 'Très Facile' | 'Facile' | 'Modéré';
  recommendedMode?: string;
}

export interface BattleLogSummary {
  totalBattles: number;
  victories: number;
  defeats: number;
  draws: number;
  winRate: number;
  starPlayerCount: number;
  starPlayerRate: number;
  trophyDelta: number;
  modeStats: Record<string, { total: number; wins: number; winRate: number }>;
  brawlerPerformance: Record<string, { played: number; wins: number; winRate: number; trophyDelta: number }>;
}

/* ============================================================
   NOUVEAUX TYPES PHASE 3 & 4 : CONSEILS ENRICHIS & OBJECTIFS
   ============================================================ */

export type TipCategory =
  | 'session_plan'
  | 'upgrade_priority'
  | 'loss_pattern'
  | 'tilt_warning'
  | 'mode_guide'
  | 'team_comp'
  | 'milestone'
  | 'trivia';

export type TipPriority = 'high' | 'medium' | 'low';
export type ConfidenceLevel = 'Donnée vérifiée' | 'Heuristique forte' | 'Conseil tactique';

export interface TacticalTip {
  id: string;
  category: TipCategory;
  priority: TipPriority;
  title: string;
  why: string;
  action: string;
  brawlerId?: number;
  brawlerName?: string;
  mode?: string;
  confidence: ConfidenceLevel;
  tagText?: string;
}

export interface SessionObjective {
  id: string;
  title: string;
  targetDescription: string;
  current: number;
  target: number;
  unit: string;
  completed: boolean;
  brawlerId?: number;
  brawlerName?: string;
  potentialGain: number;
}

export interface LossPatternReport {
  consecutiveLosses: number;
  worstMode?: { mode: string; losses: number; winRate: number };
  worstBrawler?: { name: string; losses: number; trophyLoss: number };
  tiltAlertActive: boolean;
  recommendedPauseMinutes?: number;
  cooldownMessage?: string;
}

export interface UpgradePriorityItem {
  brawlerId: number;
  brawlerName: string;
  currentPower: number;
  targetPower: number;
  trophies: number;
  missingAccessory: 'Star Power' | 'Hypercharge' | 'Gears' | 'Niveau 9' | 'Niveau 11';
  impactDescription: string;
  priority: 'Haute' | 'Moyenne' | 'Basse';
}

export interface MilestoneRoad {
  currentTrophies: number;
  nextMilestone: number;
  trophiesRemaining: number;
  estimatedMatches: number;
  rankTitle: string;
  advice: string;
}
