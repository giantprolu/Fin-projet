import { NextResponse } from 'next/server';
import { getDbService } from '@/lib/db-service';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const dbService = getDbService();
    const body = await request.json();
    const { clerk_id, match_id, team_id, amount, odds } = body;
    
    // Validation des données
    if (!clerk_id || !match_id || !team_id || !amount || !odds) {
      return NextResponse.json(
        { error: 'Données manquantes' },
        { status: 400 }
      );
    }
    
    // Récupérer ou créer l'utilisateur
    let user = dbService.getUserByClerkId(clerk_id);
    
    if (!user) {
      // Si l'utilisateur n'existe pas, le créer avec des données par défaut
      const username = `user_${clerk_id.slice(-8)}`;
      const email = `${clerk_id}@example.com`;
      user = dbService.createOrGetUser(clerk_id, username, email);
    }
    
    if (!user) {
      return NextResponse.json(
        { error: 'Impossible de créer l\'utilisateur' },
        { status: 500 }
      );
    }
    
    // Vérifier si l'utilisateur a suffisamment de fonds
    if (user.balance < amount) {
      return NextResponse.json(
        { error: 'Solde insuffisant' },
        { status: 400 }
      );
    }
    
    // Calculer le gain potentiel
    const potential_payout = amount * odds;
    
    // Créer le pari d'abord
    const betId = dbService.createBet({
      user_id: user.id.toString(),
      match_id,
      team_id,
      amount,
      odds,
      potential_payout,
      status: 'pending'
    });
    
    // Déduire le montant du solde et créer la transaction
    dbService.addWalletTransaction(
      user.id, // Passer directement l'ID utilisateur (string ou number)
      'bet', 
      amount, 
      `Pari placé sur le match ${match_id}`,
      betId?.toString()
    );
    
    // Récupérer le nouveau solde après la transaction
    const updatedUser = dbService.getUserByClerkId(clerk_id);
    
    return NextResponse.json({ 
      success: true, 
      betId,
      newBalance: updatedUser?.balance || 0,
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
    const dbService = getDbService();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'ID utilisateur requis' },
        { status: 400 }
      );
    }
    
    const bets = dbService.getUserBets(parseInt(userId, 10));
    return NextResponse.json(bets);
    
  } catch (error) {
    console.error('Erreur lors de la récupération des paris:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des paris' },
      { status: 500 }
    );
  }
}