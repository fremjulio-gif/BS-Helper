import { prisma } from './prisma';
import { Prisma } from '@prisma/client';
import { PlayerProfile, BattleLogResponse } from '@/types/brawlstars';

/**
 * Convertit le format compact Supercell (ex: 20261116T223039.000Z) en Date UTC valide.
 */
export function parseScBattleTimeToDate(scTime: string): Date {
  try {
    const iso = scTime.replace(
      /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})/,
      '$1-$2-$3T$4:$5:$6'
    );
    const date = new Date(iso);
    return isNaN(date.getTime()) ? new Date() : date;
  } catch {
    return new Date();
  }
}

/**
 * Enregistre un instantané de profil de joueur (intervalle min 15 minutes ou si changement de trophées).
 */
export async function recordPlayerSnapshot(profile: PlayerProfile) {
  if (!prisma) return;

  try {
    const lastSnapshot = await prisma.playerSnapshot.findFirst({
      where: { playerTag: profile.tag },
      orderBy: { createdAt: 'desc' },
    });

    const now = new Date();
    const shouldRecord =
      !lastSnapshot ||
      now.getTime() - new Date(lastSnapshot.createdAt).getTime() > 15 * 60 * 1000 ||
      lastSnapshot.trophies !== profile.trophies;

    if (shouldRecord) {
      await prisma.playerSnapshot.create({
        data: {
          playerTag: profile.tag,
          name: profile.name,
          trophies: profile.trophies,
          highestTrophies: profile.highestTrophies,
          expLevel: profile.expLevel,
          victories3v3: profile['3vs3Victories'],
          soloVictories: profile.soloVictories,
          duoVictories: profile.duoVictories,
          rankedRank: profile.rankedRankName ?? null,
          rankedElo: profile.rankedElo ?? null,
        },
      });
    }
  } catch (error) {
    console.error('[stats-recorder] Erreur enregistrement snapshot:', error);
  }
}

/**
 * Sauvegarde les nouveaux combats du battlelog avec batch createMany et dédoublonnage.
 * Applique strictement le plafond de 1 500 combats par joueur à l'écriture.
 */
export async function syncBattleLog(playerTag: string, battleLog: BattleLogResponse) {
  if (!prisma) return;

  try {
    const normalizedTag = playerTag.trim().toUpperCase().replace('#', '');
    const recordsToInsert: Array<{
      playerTag: string;
      battleTime: string;
      battleAt: Date;
      mode: string;
      map: string | null;
      result: string | null;
      rank: number | null;
      trophyChange: number | null;
      brawlerId: number | null;
      brawlerName: string;
      brawlerPower: number;
      brawlerTrophies: number | null;
      isStarPlayer: boolean;
      duration: number | null;
      alliesJson: Prisma.InputJsonValue;
      opponentsJson: Prisma.InputJsonValue;
    }> = [];

    for (const item of battleLog.items) {
      const battle = item.battle;
      let myBrawlerId: number | null = null;
      let myBrawlerName = 'Inconnu';
      let myBrawlerPower = 1;
      let myBrawlerTrophies: number | null = null;

      const alliesList: Array<{
        tag: string;
        name: string;
        brawler: { id?: number; name: string; power: number };
      }> = [];
      const opponentsList: Array<{
        tag: string;
        name: string;
        brawler: { id?: number; name: string; power: number };
      }> = [];

      // Analyse des équipes ou liste de joueurs
      if (battle.teams) {
        for (const team of battle.teams) {
          const isMyTeam = team.some((p) => p.tag.replace('#', '') === normalizedTag);
          for (const p of team) {
            if (p.tag.replace('#', '') === normalizedTag) {
              myBrawlerId = p.brawler.id ?? null;
              myBrawlerName = p.brawler.name;
              myBrawlerPower = p.brawler.power;
              myBrawlerTrophies = p.brawler.trophies ?? null;
            } else if (isMyTeam) {
              alliesList.push({
                tag: p.tag,
                name: p.name,
                brawler: { id: p.brawler.id, name: p.brawler.name, power: p.brawler.power },
              });
            } else {
              opponentsList.push({
                tag: p.tag,
                name: p.name,
                brawler: { id: p.brawler.id, name: p.brawler.name, power: p.brawler.power },
              });
            }
          }
        }
      } else if (battle.players) {
        for (const p of battle.players) {
          if (p.tag.replace('#', '') === normalizedTag) {
            myBrawlerId = p.brawler.id ?? null;
            myBrawlerName = p.brawler.name;
            myBrawlerPower = p.brawler.power;
            myBrawlerTrophies = p.brawler.trophies ?? null;
          } else {
            opponentsList.push({
              tag: p.tag,
              name: p.name,
              brawler: { id: p.brawler.id, name: p.brawler.name, power: p.brawler.power },
            });
          }
        }
      }

      const isStarPlayer = Boolean(
        battle.starPlayer && battle.starPlayer.tag.replace('#', '') === normalizedTag
      );

      recordsToInsert.push({
        playerTag,
        battleTime: item.battleTime,
        battleAt: parseScBattleTimeToDate(item.battleTime),
        mode: item.event.mode || battle.mode || 'unknown',
        map: item.event.map || null,
        result: battle.result ?? null,
        rank: battle.rank ?? null,
        trophyChange: battle.trophyChange ?? null,
        brawlerId: myBrawlerId,
        brawlerName: myBrawlerName,
        brawlerPower: myBrawlerPower,
        brawlerTrophies: myBrawlerTrophies,
        isStarPlayer,
        duration: battle.duration ?? null,
        alliesJson: alliesList as unknown as Prisma.InputJsonValue,
        opponentsJson: opponentsList as unknown as Prisma.InputJsonValue,
      });
    }

    if (recordsToInsert.length > 0) {
      // Insertion par lot avec ignore des doublons [playerTag, battleTime]
      await prisma.battleRecord.createMany({
        data: recordsToInsert,
        skipDuplicates: true,
      });

      // Application du plafond strict à 1 500 combats par joueur
      const totalCount = await prisma.battleRecord.count({
        where: { playerTag },
      });

      if (totalCount > 1500) {
        const excess = totalCount - 1500;
        const oldestRecords = await prisma.battleRecord.findMany({
          where: { playerTag },
          orderBy: { battleAt: 'asc' },
          take: excess,
          select: { id: true },
        });

        if (oldestRecords.length > 0) {
          await prisma.battleRecord.deleteMany({
            where: {
              id: { in: oldestRecords.map((r) => r.id) },
            },
          });
        }
      }
    }
  } catch (error) {
    console.error('[stats-recorder] Erreur synchronisation battlelog:', error);
  }
}

export interface HistoricalStatsResponse {
  totalCount: number;
  firstTrackedAt: string | null;
  modeStats: Record<
    string,
    { total: number; wins: number; winRate: number; isWeakSample: boolean }
  >;
  brawlerStats: Record<
    string,
    { total: number; wins: number; winRate: number; isWeakSample: boolean }
  >;
}

/**
 * Calcule les statistiques cumulées historiques stockées en base de données.
 */
export async function getHistoricalBattleStats(
  playerTag: string
): Promise<HistoricalStatsResponse | null> {
  if (!prisma) return null;

  try {
    const totalCount = await prisma.battleRecord.count({ where: { playerTag } });
    const oldest = await prisma.battleRecord.findFirst({
      where: { playerTag },
      orderBy: { battleAt: 'asc' },
      select: { battleAt: true },
    });

    const battles = await prisma.battleRecord.findMany({
      where: { playerTag },
      orderBy: { battleAt: 'desc' },
      take: 200,
    });

    const modeStats: Record<
      string,
      { total: number; wins: number; winRate: number; isWeakSample: boolean }
    > = {};
    const brawlerStats: Record<
      string,
      { total: number; wins: number; winRate: number; isWeakSample: boolean }
    > = {};

    for (const b of battles) {
      const isWin = b.result === 'victory' || (typeof b.rank === 'number' && b.rank <= 4);

      // Mode
      if (!modeStats[b.mode]) {
        modeStats[b.mode] = { total: 0, wins: 0, winRate: 0, isWeakSample: true };
      }
      modeStats[b.mode].total++;
      if (isWin) modeStats[b.mode].wins++;

      // Brawler
      if (!brawlerStats[b.brawlerName]) {
        brawlerStats[b.brawlerName] = { total: 0, wins: 0, winRate: 0, isWeakSample: true };
      }
      brawlerStats[b.brawlerName].total++;
      if (isWin) brawlerStats[b.brawlerName].wins++;
    }

    Object.values(modeStats).forEach((s) => {
      s.winRate = Math.round((s.wins / s.total) * 100);
      s.isWeakSample = s.total < 10;
    });

    Object.values(brawlerStats).forEach((s) => {
      s.winRate = Math.round((s.wins / s.total) * 100);
      s.isWeakSample = s.total < 10;
    });

    return {
      totalCount,
      firstTrackedAt: oldest?.battleAt ? oldest.battleAt.toISOString() : null,
      modeStats,
      brawlerStats,
    };
  } catch (error) {
    console.error('[stats-recorder] Erreur récupération stats historiques:', error);
    return null;
  }
}

/**
 * Récupère l'historique de progression des trophées pour le graphique.
 */
export async function getPlayerProgression(playerTag: string) {
  if (!prisma) return [];

  try {
    const snapshots = await prisma.playerSnapshot.findMany({
      where: { playerTag },
      orderBy: { createdAt: 'asc' },
      take: 60,
    });

    return snapshots.map((s) => ({
      date: new Date(s.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      fullDate: s.createdAt.toISOString(),
      trophies: s.trophies,
      rankedElo: s.rankedElo,
    }));
  } catch (error) {
    console.error('[stats-recorder] Erreur progression trophées:', error);
    return [];
  }
}
