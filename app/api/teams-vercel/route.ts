import { NextRequest, NextResponse } from 'next/server';
import { vercelDbService } from '@/lib/db-vercel';
import { type Team } from '@/lib/database';

export const dynamic = 'force-dynamic';
export const runtime = 'edge';

export async function GET() {
  try {
    const teams = await vercelDbService.getTeams();
    return NextResponse.json(teams);
  } catch (error) {
    console.error('Erreur lors de la récupération des équipes:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des équipes' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, tag, country, logo_url, founded_year, total_earnings } = body;

    // Validation des données
    if (!name || !tag) {
      return NextResponse.json({ error: 'Nom et tag requis' }, { status: 400 });
    }

    // Vérifier si le tag existe déjà
    if (await vercelDbService.teamTagExists(tag)) {
      return NextResponse.json({ error: 'Ce tag existe déjà' }, { status: 409 });
    }

    // Créer la nouvelle équipe
    const newTeam = await vercelDbService.createTeam({
      name,
      tag,
      country: country || 'FR',
      logo_url: logo_url || null,
      founded_year: founded_year || new Date().getFullYear(),
      total_earnings: total_earnings || 0
    } as Omit<Team, 'id' | 'created_at'>);

    return NextResponse.json(newTeam, { status: 201 });
  } catch (error) {
    console.error('Erreur dans POST /api/teams-vercel:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    return NextResponse.json({ error: 'Erreur serveur: ' + errorMessage }, { status: 500 });
  }
}
