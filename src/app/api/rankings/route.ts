import { NextRequest, NextResponse } from 'next/server';
import { fetchPlayerProfile } from '@/lib/brawlstars-api';
import { getPlayerRankings } from '@/lib/rankings-service';

export const revalidate = 60; // 60s cache

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const country = searchParams.get('country') || 'fr';
    const tag = searchParams.get('tag') || process.env.DEFAULT_PLAYER_TAG || '#8L80JGJGG';

    const profile = await fetchPlayerProfile(tag);

    // Trouver le meilleur Brawler du joueur en trophées
    const bestBrawler = (profile.brawlers || [])
      .slice()
      .sort((a, b) => b.trophies - a.trophies)[0];

    const rankings = await getPlayerRankings(profile.tag, profile.trophies, {
      country,
      bestBrawlerId: bestBrawler?.id,
      bestBrawlerTrophies: bestBrawler?.trophies,
      clubTag: profile.club?.tag,
      clubName: profile.club?.name,
    });

    return NextResponse.json(
      {
        success: true,
        ...rankings,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30',
        },
      }
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Erreur lors de la récupération des classements';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
