import { prisma } from './prisma';
import { PlayerProfile, BattleLogResponse } from '@/types/brawlstars';

/**
 * Record a player snapshot if 15 minutes have passed since last one,
 * or returns the historical snapshots.
 */
export async function recordPlayerSnapshot(profile: PlayerProfile) {
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
    console.error('Error saving player snapshot:', error);
  }
}

/**
 * Save new battle records from the battle log
 */
export async function syncBattleLog(playerTag: string, battleLog: BattleLogResponse) {
  try {
    const normalizedTag = playerTag.trim().toUpperCase().replace('#', '');

    for (const item of battleLog.items) {
      const battle = item.battle;
      let myBrawlerName = 'Unknown';
      let myBrawlerPower = 1;
      let myBrawlerTrophies: number | undefined = undefined;

      // Find player's brawler in teams
      if (battle.teams) {
        for (const team of battle.teams) {
          for (const p of team) {
            if (p.tag.replace('#', '') === normalizedTag) {
              myBrawlerName = p.brawler.name;
              myBrawlerPower = p.brawler.power;
              myBrawlerTrophies = p.brawler.trophies;
            }
          }
        }
      } else if (battle.players) {
        for (const p of battle.players) {
          if (p.tag.replace('#', '') === normalizedTag) {
            myBrawlerName = p.brawler.name;
            myBrawlerPower = p.brawler.power;
            myBrawlerTrophies = p.brawler.trophies;
          }
        }
      }

      const isStarPlayer =
        Boolean(battle.starPlayer && battle.starPlayer.tag.replace('#', '') === normalizedTag);

      await prisma.battleRecord.upsert({
        where: {
          playerTag_battleTime: {
            playerTag,
            battleTime: item.battleTime,
          },
        },
        update: {},
        create: {
          playerTag,
          battleTime: item.battleTime,
          mode: item.event.mode || battle.mode,
          map: item.event.map || null,
          result: battle.result ?? null,
          rank: battle.rank ?? null,
          trophyChange: battle.trophyChange ?? null,
          brawlerName: myBrawlerName,
          brawlerPower: myBrawlerPower,
          brawlerTrophies: myBrawlerTrophies ?? null,
          isStarPlayer,
          duration: battle.duration ?? null,
        },
      });
    }
  } catch (error) {
    console.error('Error syncing battle log:', error);
  }
}

/**
 * Retrieve trophy progression history for chart display
 */
export async function getPlayerProgression(playerTag: string) {
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
    console.error('Error getting player progression:', error);
    return [];
  }
}
