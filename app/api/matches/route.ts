import { NextResponse } from 'next/server';
import { dbService } from '@/lib/db-service';

export async function GET() {
  try {
    const matches = dbService.getMatchesWithDetails();
    return NextResponse.json(matches);
  } catch (error) {
    console.error('Erreur lors de la récupération des matchs:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des matchs' },
      { status: 500 }
    );
  }
}