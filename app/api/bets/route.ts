import { NextResponse } from 'next/server';
import { dbService } from '@/lib/db-service';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { user_id, match_id, team_id, amount, odds } = body;
    
    // Validation des données
    if (!user_id || !match_id || !team_id || !amount || !odds) {
      return NextResponse.json(
        { error: 'Données manquantes' },
        { status: 400 }
      );
    }
    
    // Calculer le gain potentiel
    const potential_payout = amount * odds;
    
    // Créer le pari
    const betId = dbService.createBet({
      user_id,
      match_id,
      team_id,
      amount,
      odds,
      potential_payout,
      status: 'pending'
    });
    
    return NextResponse.json({ 
      success: true, 
      betId,
      message: 'Pari créé avec succès' 
    });
    
  } catch (error) {
    console.error('Erreur lors de la création du pari:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création du pari' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'ID utilisateur requis' },
        { status: 400 }
      );
    }
    
    const bets = dbService.getUserBets(userId);
    return NextResponse.json(bets);
    
  } catch (error) {
    console.error('Erreur lors de la récupération des paris:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des paris' },
      { status: 500 }
    );
  }
}