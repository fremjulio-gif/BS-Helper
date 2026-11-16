import { PlayerProfile, BattleLogResponse, ActiveEvent } from '@/types/brawlstars';

const DIRECT_API_URL = 'https://api.brawlstars.com/v1';
const PROXY_API_URL = 'https://proxy.royaleapi.dev/v1';

function getApiKey(): string {
  const apiKey = process.env.BRAWL_STARS_API_KEY;
  if (!apiKey) {
    throw new Error(
      "Clé d'API manquante : BRAWL_STARS_API_KEY n'est pas configurée dans les variables d'environnement Vercel (Settings > Environment Variables) ou dans .env.local."
    );
  }
  return apiKey;
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

async function fetchFromBrawlApi<T>(endpoint: string, cacheSeconds: number = 60): Promise<T> {
  const apiKey = getApiKey();
  const headers = {
    Authorization: `Bearer ${apiKey}`,
    Accept: 'application/json',
  };

  // On Vercel, serverless IPs change dynamically. We default to RoyaleAPI proxy (static IP 45.79.218.79)
  // In local development, we default to the direct Supercell API.
  const isVercel = Boolean(process.env.VERCEL);
  const primaryBase = isVercel ? PROXY_API_URL : DIRECT_API_URL;
  const secondaryBase = isVercel ? DIRECT_API_URL : PROXY_API_URL;

  const res = await fetch(`${primaryBase}${endpoint}`, {
    headers,
    next: { revalidate: cacheSeconds },
  });

  // If 403 Forbidden (typical IP whitelist mismatch), try secondary endpoint
  if (res.status === 403) {
    const errorBody = await res.text();
    const isIpIssue =
      errorBody.includes('IP') ||
      errorBody.includes('accessDenied') ||
      errorBody.includes('whitelist');

    if (isIpIssue) {
      try {
        const fallbackRes = await fetch(`${secondaryBase}${endpoint}`, {
          headers,
          next: { revalidate: cacheSeconds },
        });
        if (fallbackRes.ok) {
          return fallbackRes.json();
        }
      } catch {
        // Fallback network error, continue to error throw below
      }

      throw new Error(
        "Erreur IP Supercell (403) : Votre clé d'API bloque les serveurs Vercel. Rendez-vous sur developer.brawlstars.com, modifiez votre clé et ajoutez l'IP proxy : 45.79.218.79"
      );
    }

    throw new Error(`Erreur API Supercell (403) : ${errorBody}`);
  }

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Erreur API Supercell (${res.status}) : ${errorText}`);
  }

  return res.json();
}

export async function fetchPlayerProfile(tag?: string): Promise<PlayerProfile> {
  const targetTag = tag || process.env.DEFAULT_PLAYER_TAG || '#8L80JGJGG';
  const encoded = encodeTag(targetTag);
  return fetchFromBrawlApi<PlayerProfile>(`/players/${encoded}`, 60);
}

export async function fetchPlayerBattleLog(tag?: string): Promise<BattleLogResponse> {
  const targetTag = tag || process.env.DEFAULT_PLAYER_TAG || '#8L80JGJGG';
  const encoded = encodeTag(targetTag);
  return fetchFromBrawlApi<BattleLogResponse>(`/players/${encoded}/battlelog`, 30);
}

export async function fetchEventsRotation(): Promise<ActiveEvent[]> {
  return fetchFromBrawlApi<ActiveEvent[]>('/events/rotation', 300);
}
