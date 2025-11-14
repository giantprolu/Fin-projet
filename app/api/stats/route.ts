import { NextResponse } from 'next/server';
import { getSupabaseService } from '@/lib/db-supabase';
import { auth } from '@clerk/nextjs/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const dbService = getSupabaseService();
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    // Obtenir l'utilisateur depuis la base de données
    const user = await dbService.getUserByClerkId(userId);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    // Récupérer les statistiques personnalisées de l'utilisateur
    const stats = await dbService.getUserStats(user.id);
    
    if (!stats) {
      return NextResponse.json(
        { error: 'Statistiques non disponibles' },
        { status: 404 }
      );
    }

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des statistiques' },
      { status: 500 }
    );
  }
}