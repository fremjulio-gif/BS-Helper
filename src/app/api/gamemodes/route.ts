import { NextResponse } from 'next/server';
import { getGameModesDictionary } from '@/lib/gamemodes-service';

export const revalidate = 60; // 60s cache

export async function GET() {
  try {
    const dictionary = await getGameModesDictionary();

    return NextResponse.json(
      {
        success: true,
        modes: dictionary,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30',
        },
      }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur lors du chargement des modes';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
