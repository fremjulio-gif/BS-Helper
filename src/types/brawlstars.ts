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
