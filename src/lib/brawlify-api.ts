export function getBrawlerImageUrl(brawlerId: number): string {
  return `https://cdn.brawlify.com/brawlers/borderless/${brawlerId}.png`;
}

export function getBrawlerBorderImageUrl(brawlerId: number): string {
  return `https://cdn.brawlify.com/brawlers/borders/${brawlerId}.png`;
}

export function getBrawlerEmojiUrl(brawlerId: number): string {
  return `https://cdn.brawlify.com/brawlers/emoji/${brawlerId}.png`;
}

export function getModeIconUrl(mode: string): string {
  // Map common mode names to standard icons or fallback
  const normalized = mode.toLowerCase();
  return `https://cdn.brawlify.com/gamemodes/regular/${normalized}.png`;
}

export interface BrawlerMeta {
  id: number;
  name: string;
  rarity?: {
    name: string;
    color: string;
  };
  class?: {
    name: string;
  };
}

let cachedBrawlers: Record<number, BrawlerMeta> | null = null;

export async function getBrawlersMeta(): Promise<Record<number, BrawlerMeta>> {
  if (cachedBrawlers) return cachedBrawlers;

  try {
    const res = await fetch('https://api.brawlapi.com/v1/brawlers', {
      next: { revalidate: 86400 }, // 24h cache
    });
    if (res.ok) {
      const data = await res.json();
      const map: Record<number, BrawlerMeta> = {};
      if (Array.isArray(data.list)) {
        for (const item of data.list) {
          map[item.id] = {
            id: item.id,
            name: item.name,
            rarity: item.rarity,
            class: item.class,
          };
        }
      }
      cachedBrawlers = map;
      return map;
    }
  } catch (err) {
    console.warn('Could not fetch BrawlAPI brawlers metadata:', err);
  }

  return {};
}
