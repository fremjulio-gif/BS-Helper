import { NextResponse } from 'next/server';
import { fetchPlayerProfile } from '@/lib/brawlstars-api';
import { getCatalogBrawlers } from '@/lib/brawlers-service';

export const revalidate = 60; // 60s cache

export async function GET() {
  try {
    const profile = await fetchPlayerProfile();
    const catalogData = await getCatalogBrawlers(profile.brawlers || []);

    return NextResponse.json(
      {
        success: true,
        ...catalogData,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30',
        },
      }
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Erreur lors du chargement des brawlers';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
