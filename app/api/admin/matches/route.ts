import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseService } from '@/lib/db-supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    console.log('🔍 GET /api/admin/matches - Début');
    const db = getSupabaseService();
    console.log('🔍 Service Supabase obtenu');
    const matches = await db.getSimpleMatches();
    console.log('✅ Matchs récupérés:', matches.length, 'matchs');
    console.log('📦 Premier match:', matches[0]);
    return NextResponse.json({ matches });
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des matchs:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des matchs' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const db = getSupabaseService();
    const body = await request.json();
    const { game, tournament, team1, team2, team1Odds, team2Odds, date, time, status } = body;

    if (!game || !tournament || !team1 || !team2 || !date || !time) {
      return NextResponse.json(
        { error: 'Données manquantes' },
        { status: 400 }
      );
    }

    const matchId = await db.createSimpleMatch({
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

    if (matchId) {
      return NextResponse.json({ 
        message: 'Match créé avec succès',
        matchId 
      });
    } else {
      return NextResponse.json(
        { error: 'Erreur lors de la création du match' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Erreur lors de la création du match:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}