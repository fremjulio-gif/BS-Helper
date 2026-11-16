import { fetchGameModes } from './brawlstars-api';
import { GameModeMeta } from '@/types/brawlstars';

export interface BrawlifyGameMode {
  id: number;
  name: string;
  scHash?: string;
  imageUrl?: string;
  color?: string;
  bgColor?: string;
  description?: string;
  shortDescription?: string;
  title?: string;
}

/**
 * Normalise un nom de mode en scHash camelCase (ex: "GEM GRAB" -> "gemGrab", "BRAWL BALL" -> "brawlBall")
 */
export function normalizeModeToScHash(rawName?: string | null): string {
  if (!rawName) return '';
  // Si déjà en camelCase (ex: "brawlBall", "gemGrab")
  if (/^[a-z]+[A-Za-z0-9]*$/.test(rawName)) {
    return rawName;
  }
  const words = rawName
    .replace(/[_-]+/g, ' ')
    .trim()
    .split(/\s+/);

  if (words.length === 0) return '';
  return words
    .map((word, index) => {
      const lower = word.toLowerCase();
      if (index === 0) return lower;
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join('');
}

/**
 * Met en forme un nom brut en Title Case sans retraduire
 */
export function formatModeTitleCase(rawName?: string | null): string {
  if (!rawName) return 'Mode Inconnu';
  // Si camelCase (ex: "brawlBall"), sépare les mots
  const unCamel = rawName.replace(/([A-Z])/g, ' $1').trim();
  const words = unCamel.replace(/[_-]+/g, ' ').split(/\s+/);
  return words
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

let cachedDictionary: Record<string, GameModeMeta> | null = null;
let lastCacheTime = 0;
const CACHE_TTL_MS = 60 * 1000; // 60s

/**
 * Récupère et indexe tous les modes de jeu croisés Supercell + Brawlify
 */
export async function getGameModesDictionary(): Promise<Record<string, GameModeMeta>> {
  const now = Date.now();
  if (cachedDictionary && now - lastCacheTime < CACHE_TTL_MS) {
    return cachedDictionary;
  }

  try {
    const [scRes, bfRes] = await Promise.all([
      fetchGameModes().catch((err) => {
        console.warn('[gamemodes] Impossible de charger Supercell /gamemodes:', err);
        return { items: [] };
      }),
      fetch('https://api.brawlapi.com/v1/gamemodes', {
        next: { revalidate: 60 },
      })
        .then((r) => (r.ok ? r.json() : { list: [] }))
        .catch((err) => {
          console.warn('[gamemodes] Impossible de charger Brawlify /gamemodes:', err);
          return { list: [] };
        }),
    ]);

    // Indexer Brawlify par scHash et par nom normalisé
    const bfMap = new Map<string, BrawlifyGameMode>();
    const brawlifyList: BrawlifyGameMode[] = Array.isArray(bfRes.list) ? bfRes.list : [];

    for (const bf of brawlifyList) {
      if (bf.scHash) {
        bfMap.set(bf.scHash.toLowerCase(), bf);
      }
      if (bf.name) {
        bfMap.set(normalizeModeToScHash(bf.name).toLowerCase(), bf);
        bfMap.set(bf.name.toLowerCase(), bf);
      }
    }

    const dict: Record<string, GameModeMeta> = {};

    // 1. D'abord indexer les modes officiels Supercell
    const scItems = Array.isArray(scRes.items) ? scRes.items : [];
    for (const sc of scItems) {
      if (!sc.name) continue;

      const scHash = normalizeModeToScHash(sc.name);
      const match =
        bfMap.get(scHash.toLowerCase()) ||
        bfMap.get(sc.name.toLowerCase());

      if (match) {
        const meta: GameModeMeta = {
          id: sc.id,
          name: match.name || formatModeTitleCase(sc.name),
          scHash: match.scHash || scHash,
          imageUrl: match.imageUrl || null,
          color: match.color || null,
          bgColor: match.bgColor || null,
          description: match.shortDescription || match.description || null,
          title: match.title || null,
        };
        dict[scHash] = meta;
        dict[scHash.toLowerCase()] = meta;
        dict[sc.name.toLowerCase()] = meta;
      } else {
        // Mode Supercell sans correspondance Brawlify
        if (process.env.NODE_ENV === 'development') {
          console.warn(
            `[gamemodes] Mode Supercell sans correspondance Brawlify: "${sc.name}" (scHash normalisé: "${scHash}")`
          );
        }
        const fallbackMeta: GameModeMeta = {
          id: sc.id,
          name: formatModeTitleCase(sc.name),
          scHash,
          imageUrl: null,
          color: null,
          bgColor: null,
          description: null,
          title: null,
        };
        dict[scHash] = fallbackMeta;
        dict[scHash.toLowerCase()] = fallbackMeta;
        dict[sc.name.toLowerCase()] = fallbackMeta;
      }
    }

    // 2. Compléter avec les modes Brawlify non listés par Supercell (ex: scHash canoniques)
    for (const bf of brawlifyList) {
      const hash = bf.scHash || normalizeModeToScHash(bf.name);
      if (!dict[hash] && !dict[hash.toLowerCase()]) {
        const meta: GameModeMeta = {
          id: bf.id,
          name: bf.name,
          scHash: hash,
          imageUrl: bf.imageUrl || null,
          color: bf.color || null,
          bgColor: bf.bgColor || null,
          description: bf.shortDescription || bf.description || null,
          title: bf.title || null,
        };
        dict[hash] = meta;
        dict[hash.toLowerCase()] = meta;
      }
    }

    cachedDictionary = dict;
    lastCacheTime = now;
    return dict;
  } catch (err) {
    console.error('[gamemodes] Erreur lors de la construction du dictionnaire:', err);
    return cachedDictionary || {};
  }
}

/**
 * Résout un mode de jeu à partir de sa clé ou de son nom, avec repli gracieux
 */
export function resolveGameMode(
  modeKeyOrName?: string | null,
  dictionary?: Record<string, GameModeMeta> | null
): GameModeMeta {
  if (!modeKeyOrName) {
    return {
      id: 0,
      name: 'Inconnu',
      scHash: 'unknown',
      imageUrl: null,
    };
  }

  const clean = modeKeyOrName.trim();
  const normalizedKey = normalizeModeToScHash(clean);

  if (dictionary) {
    const found =
      dictionary[clean] ||
      dictionary[clean.toLowerCase()] ||
      dictionary[normalizedKey] ||
      dictionary[normalizedKey.toLowerCase()];

    if (found) {
      return found;
    }
  }

  // Repli propre : nom brut mis en Title Case, aucune icône inventée
  return {
    id: 0,
    name: formatModeTitleCase(clean),
    scHash: normalizedKey || clean,
    imageUrl: null,
  };
}
