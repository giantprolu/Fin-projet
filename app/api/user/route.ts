import { NextResponse } from 'next/server';
import { getSupabaseService } from '@/lib/db-supabase';
import { auth } from '@clerk/nextjs/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    const dbService = getSupabaseService();
    // Obtenir ou créer l'utilisateur
    let user = await dbService.getUserByClerkId(userId);
    
    if (!user) {
      // Si l'utilisateur n'existe pas, on doit d'abord récupérer ses infos de Clerk
      // Pour l'instant, créons avec des données par défaut
      user = await dbService.createOrGetUser(userId, 'Utilisateur', 'user@example.com');
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'utilisateur:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de l\'utilisateur' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const dbService = getSupabaseService();
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const clerkId = body.clerk_id || userId;
    
    // Valeurs par défaut si non fournies
    const username = body.username || `user_${clerkId.slice(-8)}`;
    const email = body.email || `${clerkId}@example.com`;

    console.log('Création utilisateur avec:', { clerkId, username, email });

    // Créer ou récupérer l'utilisateur
    const user = await dbService.createOrGetUser(clerkId, username, email);

    return NextResponse.json({ 
      success: true, 
      user,
      message: 'Utilisateur créé avec succès' 
    });

  } catch (error) {
    console.error('Erreur lors de la création de l\'utilisateur:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création de l\'utilisateur' },
      { status: 500 }
    );
  }
}