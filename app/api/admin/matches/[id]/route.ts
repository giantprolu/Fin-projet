import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseService } from '@/lib/db-supabase';

export const dynamic = 'force-dynamic';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = getSupabaseService();
    const body = await request.json();
    const { game, tournament, team1, team2, team1Odds, team2Odds, date, time, status } = body;
    const matchId = parseInt(params.id);

    if (!game || !tournament || !team1 || !team2 || !date || !time) {
      return NextResponse.json(
        { error: 'Données manquantes' },
        { status: 400 }
      );
    }

    const success = await db.updateSimpleMatch(matchId, {
      game,
      tournament,
      team1_name: team1,
      team2_name: team2,
      team1_odds: team1Odds || 2.0,
      team2_odds: team2Odds || 2.0,
      date,
      time,
      status: status || 'scheduled'
    });

    if (success) {
      return NextResponse.json({ 
        message: 'Match mis à jour avec succès'
      });
    } else {
      return NextResponse.json(
        { error: 'Erreur lors de la mise à jour du match' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Erreur lors de la mise à jour du match:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = getSupabaseService();
    const matchId = parseInt(params.id);
    const success = await db.deleteSimpleMatch(matchId);

    if (success) {
      return NextResponse.json({ 
        message: 'Match supprimé avec succès'
      });
    } else {
      return NextResponse.json(
        { error: 'Erreur lors de la suppression du match' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Erreur lors de la suppression du match:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}