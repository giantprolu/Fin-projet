import { NextResponse } from 'next/server';
import { DatabaseService } from '@/lib/db-service';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const db = new DatabaseService();
    const matches = db.getSimpleMatches();
    return NextResponse.json(matches);
  } catch (error) {
    console.error('Erreur lors de la récupération des matchs:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des matchs' },
      { status: 500 }
    );
  }
}