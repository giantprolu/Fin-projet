import { NextResponse } from 'next/server';
import { dbService } from '@/lib/db-service';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const clerkId = searchParams.get('clerk_id');
    
    if (!clerkId) {
      return NextResponse.json(
        { error: 'Clerk ID requis' },
        { status: 400 }
      );
    }
    
    // Récupérer l'utilisateur
    const user = dbService.getUserByClerkId(clerkId);
    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }
    
    // Récupérer les transactions
    const transactions = dbService.getUserTransactions(parseInt(user.id.toString()));
    
    return NextResponse.json(transactions);
    
  } catch (error) {
    console.error('Erreur lors de la récupération des transactions:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des transactions' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { clerk_id, type, amount, description, reference_id } = body;
    
    if (!clerk_id || !type || !amount || !description) {
      return NextResponse.json(
        { error: 'Données manquantes' },
        { status: 400 }
      );
    }
    
    // Récupérer l'utilisateur
    const user = dbService.getUserByClerkId(clerk_id);
    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }
    
    // Créer la transaction
    dbService.addWalletTransaction(
      parseInt(user.id.toString()),
      type,
      amount,
      description,
      reference_id
    );
    
    // Récupérer le nouveau solde
    const updatedUser = dbService.getUserByClerkId(clerk_id);
    
    return NextResponse.json({ 
      success: true,
      newBalance: updatedUser?.balance || 0,
      message: 'Transaction créée avec succès' 
    });
    
  } catch (error) {
    console.error('Erreur lors de la création de la transaction:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création de la transaction' },
      { status: 500 }
    );
  }
}