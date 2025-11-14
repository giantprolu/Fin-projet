import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseService } from '@/lib/db-supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    console.log('🔍 GET /api/teams appelé');
    console.log('🔑 Variables env:', {
      hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY
    });
    
    const dbService = getSupabaseService();
    console.log('✅ Service Supabase créé');
    
    const teams = await dbService.getTeams();
    console.log('📊 Équipes récupérées:', teams.length);
    
    return NextResponse.json(teams);
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des équipes:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des équipes', details: error instanceof Error ? error.message : 'Erreur inconnue' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const dbService = getSupabaseService();
    console.log('Début de la création d\'\u00e9quipe');
    const body = await request.json();
    console.log('Body reçu:', body);
    
    const { name, tag, country, logo_url, founded_year, total_earnings } = body;

    // Validation des données
    if (!name || !tag) {
      console.log('Validation échouée: nom ou tag manquant');
      return NextResponse.json({ error: 'Nom et tag requis' }, { status: 400 });
    }

    // Vérifier si le tag existe déjà
    console.log('Vérification du tag:', tag);
    if (await dbService.teamTagExists(tag)) {
      console.log('Tag déjà existant:', tag);
      return NextResponse.json({ error: 'Ce tag existe déjà' }, { status: 409 });
    }

    // Créer la nouvelle équipe
    console.log('Création de l\'équipe...');
    const newTeam = await dbService.createTeam({
      name,
      tag,
      country: country || 'FR',
      logo_url: logo_url || null,
      founded_year: founded_year || new Date().getFullYear(),
      total_earnings: total_earnings || 0
    } as any);

    console.log('Équipe créée:', newTeam);
    console.log('Envoi de la réponse...');
    
    return NextResponse.json(newTeam, { status: 201 });
  } catch (error) {
    console.error('Erreur dans POST /api/teams:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    return NextResponse.json({ error: 'Erreur serveur: ' + errorMessage }, { status: 500 });
  }
}