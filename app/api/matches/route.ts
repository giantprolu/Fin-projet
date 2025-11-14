import { NextResponse } from 'next/server';
import { getSupabaseService } from '@/lib/db-supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const db = getSupabaseService();
    const matches = await db.getMatches();
    return NextResponse.json(matches);
  } catch (error) {
    console.error('Erreur lors de la récupération des matchs:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des matchs' },
      { status: 500 }
    );
  }
}