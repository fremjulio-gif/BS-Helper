import { formatTag } from './brawlstars-api';
import { getBrawlerFrenchName } from './brawler-names';

const DIRECT_API_URL = 'https://api.brawlstars.com/v1';
const PROXY_API_URL = 'https://bsproxy.royaleapi.dev/v1';

function getApiKey(): string {
  const apiKey = process.env.BRAWL_STARS_API_KEY;
  if (!apiKey) {
    throw new Error("Clé d'API manquante : BRAWL_STARS_API_KEY");
  }
  return apiKey;
}

async function fetchFromRankingsApi<T>(endpoint: string, cacheSeconds: number = 60): Promise<T> {
  const apiKey = getApiKey();
  const headers = {
    Authorization: `Bearer ${apiKey}`,
    Accept: 'application/json',
  };

  const isVercel = Boolean(process.env.VERCEL);
  const primaryBase = isVercel ? PROXY_API_URL : DIRECT_API_URL;
  const secondaryBase = isVercel ? DIRECT_API_URL : PROXY_API_URL;

  const res = await fetch(`${primaryBase}${endpoint}`, {
    headers,
    next: { revalidate: cacheSeconds },
  });

  if (res.status === 403) {
    try {
      const fallbackRes = await fetch(`${secondaryBase}${endpoint}`, {
        headers,
        next: { revalidate: cacheSeconds },
      });
      if (fallbackRes.ok) return fallbackRes.json();
    } catch {
      // ignore
    }
  }

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Erreur API Classements (${res.status}) : ${errorText}`);
  }

  return res.json();
}

export interface RankingPlayerItem {
  tag: string;
  name: string;
  nameColor?: string;
  icon: { id: number };
  trophies: number;
  rank: number;
  club?: { name: string };
}

export interface RankingClubItem {
  tag: string;
  name: string;
  badgeId: number;
  trophies: number;
  rank: number;
  memberCount: number;
}

export interface PlayerRankingStatus {
  country: string;
  rank: number | null; // null si hors du top 200
  isInTop200: boolean;
  playerTrophies: number;
  gapToTop200: number; // Trophées manquants pour dépasser le #200
  top200Threshold: number; // Trophées du joueur classé #200
  leaderTrophies: number; // Trophées du joueur classé #1
  cutoffPlayer?: {
    name: string;
    trophies: number;
  };
}

export interface BrawlerRankingStatus {
  brawlerId: number;
  brawlerName: string;
  rank: number | null;
  isInTop200: boolean;
  brawlerTrophies: number;
  gapToTop200: number;
  top200Threshold: number;
}

export interface ClubRankingStatus {
  clubTag?: string;
  clubName?: string;
  rank: number | null;
  isInTop200: boolean;
  clubTrophies?: number;
  gapToTop200: number;
  top200Threshold: number;
}

export interface FullRankingsResponse {
  country: string;
  player: PlayerRankingStatus;
  brawler?: BrawlerRankingStatus;
  club?: ClubRankingStatus;
  timestamp: string;
}

/**
 * Récupère et analyse la position du joueur dans les classements officiels.
 */
export async function getPlayerRankings(
  playerTag: string,
  playerTrophies: number,
  options: {
    country?: string;
    bestBrawlerId?: number;
    bestBrawlerTrophies?: number;
    clubTag?: string;
    clubName?: string;
  } = {}
): Promise<FullRankingsResponse> {
  const country = (options.country || 'fr').toLowerCase();
  const normalizedTag = formatTag(playerTag);

  // 1. Classement des joueurs
  const playersPromise = fetchFromRankingsApi<{ items: RankingPlayerItem[] }>(
    `/rankings/${country}/players`,
    60
  ).catch((err) => {
    console.warn(`[rankings-service] Impossible de charger le classement joueurs (${country}):`, err);
    return { items: [] as RankingPlayerItem[] };
  });

  // 2. Classement brawler (si fourni)
  const brawlerPromise = options.bestBrawlerId
    ? fetchFromRankingsApi<{ items: RankingPlayerItem[] }>(
        `/rankings/${country}/brawlers/${options.bestBrawlerId}`,
        60
      ).catch(() => ({ items: [] as RankingPlayerItem[] }))
    : Promise.resolve({ items: [] as RankingPlayerItem[] });

  // 3. Classement clubs
  const clubPromise = options.clubTag
    ? fetchFromRankingsApi<{ items: RankingClubItem[] }>(`/rankings/${country}/clubs`, 60).catch(
        () => ({ items: [] as RankingClubItem[] })
      )
    : Promise.resolve({ items: [] as RankingClubItem[] });

  const [playersData, brawlerData, clubData] = await Promise.all([
    playersPromise,
    brawlerPromise,
    clubPromise,
  ]);

  const playerList = playersData.items || [];
  const cutoffPlayer = playerList.length > 0 ? playerList[playerList.length - 1] : undefined;
  const leaderPlayer = playerList.length > 0 ? playerList[0] : undefined;
  const top200Threshold = cutoffPlayer?.trophies ?? 0;

  // Recherche du joueur dans le top 200
  const foundInPlayers = playerList.find(
    (p) => formatTag(p.tag) === normalizedTag
  );

  const playerStatus: PlayerRankingStatus = {
    country,
    rank: foundInPlayers ? foundInPlayers.rank : null,
    isInTop200: Boolean(foundInPlayers),
    playerTrophies,
    gapToTop200: foundInPlayers ? 0 : Math.max(0, top200Threshold - playerTrophies + 1),
    top200Threshold,
    leaderTrophies: leaderPlayer?.trophies ?? 0,
    cutoffPlayer: cutoffPlayer
      ? {
          name: cutoffPlayer.name,
          trophies: cutoffPlayer.trophies,
        }
      : undefined,
  };

  // Analyse Brawler
  let brawlerStatus: BrawlerRankingStatus | undefined = undefined;
  if (options.bestBrawlerId && options.bestBrawlerTrophies !== undefined) {
    const brawlerList = brawlerData.items || [];
    const bCutoff = brawlerList.length > 0 ? brawlerList[brawlerList.length - 1] : undefined;
    const bThreshold = bCutoff?.trophies ?? 0;
    const foundInBrawler = brawlerList.find(
      (p) => formatTag(p.tag) === normalizedTag
    );

    brawlerStatus = {
      brawlerId: options.bestBrawlerId,
      brawlerName: getBrawlerFrenchName(String(options.bestBrawlerId), options.bestBrawlerId),
      rank: foundInBrawler ? foundInBrawler.rank : null,
      isInTop200: Boolean(foundInBrawler),
      brawlerTrophies: options.bestBrawlerTrophies,
      gapToTop200: foundInBrawler ? 0 : Math.max(0, bThreshold - options.bestBrawlerTrophies + 1),
      top200Threshold: bThreshold,
    };
  }

  // Analyse Club
  let clubStatus: ClubRankingStatus | undefined = undefined;
  if (options.clubTag) {
    const normClubTag = formatTag(options.clubTag);
    const clubList = clubData.items || [];
    const cCutoff = clubList.length > 0 ? clubList[clubList.length - 1] : undefined;
    const cThreshold = cCutoff?.trophies ?? 0;
    const foundClub = clubList.find((c) => formatTag(c.tag) === normClubTag);

    clubStatus = {
      clubTag: options.clubTag,
      clubName: options.clubName || foundClub?.name,
      rank: foundClub ? foundClub.rank : null,
      isInTop200: Boolean(foundClub),
      clubTrophies: foundClub?.trophies,
      gapToTop200: foundClub ? 0 : cThreshold,
      top200Threshold: cThreshold,
    };
  }

  return {
    country,
    player: playerStatus,
    brawler: brawlerStatus,
    club: clubStatus,
    timestamp: new Date().toISOString(),
  };
}
