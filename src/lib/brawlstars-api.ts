import { PlayerProfile, BattleLogResponse, ActiveEvent } from '@/types/brawlstars';

const BRAWL_API_BASE = 'https://api.brawlstars.com/v1';

function getHeaders() {
  const apiKey = process.env.BRAWL_STARS_API_KEY;
  if (!apiKey) {
    throw new Error('BRAWL_STARS_API_KEY is not configured in .env.local');
  }
  return {
    Authorization: `Bearer ${apiKey}`,
    Accept: 'application/json',
  };
}

export function formatTag(rawTag: string): string {
  let cleaned = rawTag.trim().toUpperCase();
  if (!cleaned.startsWith('#')) {
    cleaned = '#' + cleaned;
  }
  return cleaned;
}

export function encodeTag(tag: string): string {
  return encodeURIComponent(formatTag(tag));
}

export async function fetchPlayerProfile(tag?: string): Promise<PlayerProfile> {
  const targetTag = tag || process.env.DEFAULT_PLAYER_TAG || '#8L80JGJGG';
  const encoded = encodeTag(targetTag);

  const res = await fetch(`${BRAWL_API_BASE}/players/${encoded}`, {
    headers: getHeaders(),
    next: { revalidate: 60 }, // Cache 60s
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Erreur API Supercell (${res.status}): ${errorText}`);
  }

  return res.json();
}

export async function fetchPlayerBattleLog(tag?: string): Promise<BattleLogResponse> {
  const targetTag = tag || process.env.DEFAULT_PLAYER_TAG || '#8L80JGJGG';
  const encoded = encodeTag(targetTag);

  const res = await fetch(`${BRAWL_API_BASE}/players/${encoded}/battlelog`, {
    headers: getHeaders(),
    next: { revalidate: 30 }, // Cache 30s
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Erreur BattleLog (${res.status}): ${errorText}`);
  }

  return res.json();
}

export async function fetchEventsRotation(): Promise<ActiveEvent[]> {
  const res = await fetch(`${BRAWL_API_BASE}/events/rotation`, {
    headers: getHeaders(),
    next: { revalidate: 300 }, // Cache 5 min
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Erreur Rotation Events (${res.status}): ${errorText}`);
  }

  return res.json();
}
