import { NextResponse } from 'next/server';
import { dbService } from '@/lib/db-service';

export async function GET() {
  try {
    const stats = dbService.getStats();
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des statistiques' },
      { status: 500 }
    );
  }
}