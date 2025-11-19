import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseService } from '@/lib/db-supabase';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { matchId, winnerTeamId } = body;

    if (!matchId || !winnerTeamId) {
      return NextResponse.json(
        { error: 'matchId et winnerTeamId sont requis' },
        { status: 400 }
      );
    }

    console.log(`🏁 Finalisation du match ${matchId} avec le gagnant ${winnerTeamId}`);

    const db = getSupabaseService();
    const result = await db.finalizeMatch(matchId, winnerTeamId);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Erreur lors de la finalisation' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      message: 'Match finalisé avec succès',
      winnersCount: result.winnersCount,
      totalPaid: result.totalPaid
    });
  } catch (error) {
    console.error('Erreur lors de la finalisation du match:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la finalisation du match' },
      { status: 500 }
    );
  }
}
