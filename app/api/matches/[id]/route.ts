import { NextResponse } from 'next/server';
import { getSupabaseService } from '@/lib/db-supabase';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const dbService = getSupabaseService();
    const match = await dbService.getMatchById(params.id);
    
    if (!match) {
      return NextResponse.json(
        { error: 'Match non trouvé' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(match);
  } catch (error) {
    console.error('Erreur lors de la récupération du match:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du match' },
      { status: 500 }
    );
  }
}