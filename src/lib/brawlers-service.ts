import { fetchAllBrawlers } from './brawlstars-api';
import { getBrawlerFrenchName } from './brawler-names';
import {
  PlayerBrawler,
  CatalogBrawler,
  CatalogResponse,
  BrawlerAccessoryItem,
  SupercellBrawlerRaw,
} from '@/types/brawlstars';

export const BRAWLER_RARITY_FR: Record<string, string> = {
  Common: 'Commune',
  Rare: 'Rare',
  'Super Rare': 'Super rare',
  Epic: 'Épique',
  Mythic: 'Mythique',
  Legendary: 'Légendaire',
  'Ultra Legendary': 'Ultra Légendaire',
};

export const BRAWLER_CLASS_FR: Record<string, string> = {
  'Damage Dealer': 'Dégâts',
  Tank: 'Tank',
  Marksman: "Tireur d'élite",
  Artillery: 'Artillerie',
  Controller: 'Contrôleur',
  Assassin: 'Assassin',
  Support: 'Soutien',
};

interface BrawlifyBrawlerItem {
  id: number;
  name: string;
  class: { id: number; name: string };
  rarity: { id: number; name: string; color: string };
  imageUrl: string;
  imageUrl2?: string;
  imageUrl3?: string;
  description: string;
  starPowers?: Array<{ id: number; name: string; description: string; imageUrl?: string }>;
  gadgets?: Array<{ id: number; name: string; description: string; imageUrl?: string }>;
}

let cachedBrawlifyBrawlers: BrawlifyBrawlerItem[] | null = null;
let brawlifyLastFetch = 0;
const BRAWLIFY_CACHE_TTL = 300_000; // 5 min

async function getBrawlifyBrawlers(): Promise<BrawlifyBrawlerItem[]> {
  const now = Date.now();
  if (cachedBrawlifyBrawlers && now - brawlifyLastFetch < BRAWLIFY_CACHE_TTL) {
    return cachedBrawlifyBrawlers;
  }

  try {
    const res = await fetch('https://api.brawlapi.com/v1/brawlers', {
      headers: { Accept: 'application/json' },
      next: { revalidate: 300 },
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.list)) {
        cachedBrawlifyBrawlers = data.list;
        brawlifyLastFetch = now;
        return data.list;
      }
    }
  } catch (err) {
    console.warn('[brawlers-service] Impossible de joindre Brawlify API:', err);
  }

  return cachedBrawlifyBrawlers || [];
}

/**
 * Calcule un score et une justification transparente pour la priorité d'amélioration.
 * Basé uniquement sur les données objectives : trophées, niveau de pouvoir, et équipements possédés.
 */
function computeUpgradePriority(
  isUnlocked: boolean,
  power: number,
  trophies: number,
  hasStarPower: boolean,
  hasHypercharge: boolean,
  hasAvailableHypercharge: boolean
): {
  score: number;
  levelLabel: 'Priorité Haute' | 'Priorité Moyenne' | 'Prêt au Combat' | 'Non débloqué';
  reason: string;
} {
  if (!isUnlocked) {
    return {
      score: 0,
      levelLabel: 'Non débloqué',
      reason: 'Brawler non débloqué.',
    };
  }

  // Si niveau bas avec déjà beaucoup de trophées : déséquilibre évident
  if (power < 7 && trophies >= 400) {
    return {
      score: 95,
      levelLabel: 'Priorité Haute',
      reason: `${trophies} trophées avec un Niveau ${power} : risque élevé de tilt contre des adversaires avec Gadget et Star Power.`,
    };
  }

  // Niveau 9 ou 10 sans aucun Star Power
  if (power >= 9 && !hasStarPower) {
    return {
      score: 90,
      levelLabel: 'Priorité Haute',
      reason: `Niveau ${power} atteint mais aucun Star Power débloqué pour activer son plein potentiel passif.`,
    };
  }

  // Brawler compétitif (700+ trophées) pas encore niveau 11
  if (trophies >= 700 && power < 11) {
    return {
      score: 85,
      levelLabel: 'Priorité Haute',
      reason: `${trophies} trophées en ladder : passer Niveau 11 est essentiel pour rivaliser à haut rang.`,
    };
  }

  // Proche du palier 9 (Pouvoir 7 ou 8)
  if (power >= 7 && power < 9) {
    return {
      score: 75,
      levelLabel: 'Priorité Moyenne',
      reason: `Proche du palier Niveau 9 pour débloquer l'emplacement de Star Power.`,
    };
  }

  // Niveau 11 avec Hypercharge disponible dans le jeu mais manquante
  if (power === 11 && hasAvailableHypercharge && !hasHypercharge) {
    return {
      score: 70,
      levelLabel: 'Priorité Moyenne',
      reason: `Niveau 11 max : l'Hypercharge est disponible et décuplerait votre impact en fin de combat.`,
    };
  }

  // Brawlers avec power < 7 en progression normale
  if (power < 7) {
    return {
      score: 50,
      levelLabel: 'Priorité Moyenne',
      reason: `Monter au Niveau 7 débloquera l'emplacement de Gadget indispensable.`,
    };
  }

  // Optimisé
  return {
    score: 20,
    levelLabel: 'Prêt au Combat',
    reason: `Brawler bien équipé et optimisé pour sa tranche de trophées actuelle (${trophies} TR).`,
  };
}

/**
 * Croise l'ensemble des 111 brawlers officiels Supercell avec le profil joueur et les métadonnées Brawlify.
 */
export async function getCatalogBrawlers(playerBrawlers: PlayerBrawler[]): Promise<CatalogResponse> {
  const [scResult, brawlifyList] = await Promise.all([
    fetchAllBrawlers().catch((err) => {
      console.warn('[brawlers-service] Échec fetchAllBrawlers:', err);
      return { items: [] as SupercellBrawlerRaw[] };
    }),
    getBrawlifyBrawlers(),
  ]);

  const scItems = scResult.items || [];
  const brawlifyById = new Map<number, BrawlifyBrawlerItem>(
    brawlifyList.map((b) => [b.id, b])
  );
  const playerById = new Map<number, PlayerBrawler>(
    playerBrawlers.map((b) => [b.id, b])
  );

  // Si Supercell /brawlers a retourné une liste vide (ex: souci réseau passager), on utilise les brawlers connus du joueur
  const baseItems: Array<{ id: number; name: string; raw?: SupercellBrawlerRaw }> =
    scItems.length > 0
      ? scItems.map((sc) => ({ id: sc.id, name: sc.name, raw: sc }))
      : playerBrawlers.map((p) => ({ id: p.id, name: p.name }));

  const catalog: CatalogBrawler[] = baseItems.map((item) => {
    const playerBrawler = playerById.get(item.id);
    const brawlifyBrawler = brawlifyById.get(item.id);
    const scRaw = item.raw;
    const isUnlocked = Boolean(playerBrawler);

    const frenchName = getBrawlerFrenchName(item.name, item.id);

    // Rareté
    const rawRarityName = brawlifyBrawler?.rarity?.name || 'Common';
    const rarity = {
      id: brawlifyBrawler?.rarity?.id ?? 1,
      name: BRAWLER_RARITY_FR[rawRarityName] || rawRarityName,
      color: brawlifyBrawler?.rarity?.color || '#b9eaff',
    };

    // Classe
    const rawClassName = brawlifyBrawler?.class?.name || 'Damage Dealer';
    const brawlerClass = {
      id: brawlifyBrawler?.class?.id ?? 1,
      name: BRAWLER_CLASS_FR[rawClassName] || rawClassName,
    };

    // Image Avatar
    const avatarUrl =
      brawlifyBrawler?.imageUrl2 ||
      brawlifyBrawler?.imageUrl ||
      `https://cdn.brawlify.com/brawlers/borderless/${item.id}.png`;

    // Gadgets
    const brawlifyGadgets = new Map(
      (brawlifyBrawler?.gadgets || []).map((g) => [g.id, g])
    );
    const gadgets: BrawlerAccessoryItem[] = (scRaw?.gadgets || playerBrawler?.gadgets || []).map(
      (g) => {
        const isOwned = playerBrawler?.gadgets?.some((pg) => pg.id === g.id) ?? false;
        const meta = brawlifyGadgets.get(g.id);
        return {
          id: g.id,
          name: meta?.name || g.name,
          type: 'gadget',
          isUnlocked: isOwned,
          description: meta?.description,
          imageUrl: meta?.imageUrl,
        };
      }
    );

    // Star Powers
    const brawlifyStarPowers = new Map(
      (brawlifyBrawler?.starPowers || []).map((sp) => [sp.id, sp])
    );
    const starPowers: BrawlerAccessoryItem[] = (
      scRaw?.starPowers ||
      playerBrawler?.starPowers ||
      []
    ).map((sp) => {
      const isOwned = playerBrawler?.starPowers?.some((psp) => psp.id === sp.id) ?? false;
      const meta = brawlifyStarPowers.get(sp.id);
      return {
        id: sp.id,
        name: meta?.name || sp.name,
        type: 'star_power',
        isUnlocked: isOwned,
        description: meta?.description,
        imageUrl: meta?.imageUrl,
      };
    });

    // Gears
    const gears: BrawlerAccessoryItem[] = (scRaw?.gears || playerBrawler?.gears || []).map((gr) => {
      const isOwned = playerBrawler?.gears?.some((pgr) => pgr.id === gr.id) ?? false;
      return {
        id: gr.id,
        name: gr.name,
        type: 'gear',
        isUnlocked: isOwned,
        level: gr.level,
      };
    });

    // HyperCharges
    const hyperCharges: BrawlerAccessoryItem[] = (
      scRaw?.hyperCharges ||
      playerBrawler?.hyperCharges ||
      []
    ).map((hc) => {
      const isOwned = playerBrawler?.hyperCharges?.some((phc) => phc.id === hc.id) ?? false;
      return {
        id: hc.id,
        name: hc.name,
        type: 'hypercharge',
        isUnlocked: isOwned,
      };
    });

    const hasStarPower = starPowers.some((sp) => sp.isUnlocked);
    const hasHypercharge = hyperCharges.some((hc) => hc.isUnlocked);
    const hasAvailableHypercharge = hyperCharges.length > 0;

    const power = playerBrawler?.power ?? 0;
    const trophies = playerBrawler?.trophies ?? 0;
    const highestTrophies = playerBrawler?.highestTrophies ?? 0;
    const rank = playerBrawler?.rank ?? 0;

    const upgradePriority = computeUpgradePriority(
      isUnlocked,
      power,
      trophies,
      hasStarPower,
      hasHypercharge,
      hasAvailableHypercharge
    );

    return {
      id: item.id,
      scName: item.name,
      name: frenchName,
      isUnlocked,
      power,
      rank,
      trophies,
      highestTrophies,
      rarity,
      class: brawlerClass,
      avatarUrl,
      description: brawlifyBrawler?.description || '',
      gadgets,
      starPowers,
      gears,
      hyperCharges,
      upgradePriority,
    };
  });

  // Tri par défaut : Débloqués en premier (triés par trophées décroissants), puis Non-débloqués par rareté/nom
  catalog.sort((a, b) => {
    if (a.isUnlocked && !b.isUnlocked) return -1;
    if (!a.isUnlocked && b.isUnlocked) return 1;
    if (a.isUnlocked && b.isUnlocked) return b.trophies - a.trophies;
    return a.rarity.id - b.rarity.id || a.name.localeCompare(b.name);
  });

  const unlockedCount = catalog.filter((b) => b.isUnlocked).length;

  return {
    brawlers: catalog,
    total: catalog.length,
    unlockedCount,
  };
}
