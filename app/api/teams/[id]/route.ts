import { NextRequest, NextResponse } from 'next/server';
import { getDbService } from '@/lib/db-service';

export const dynamic = 'force-dynamic';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const dbService = getDbService();
    const { id } = params;
    const body = await request.json();
    const { name, tag, country, logo_url, founded_year, total_earnings } = body;

    // Validation des données
    if (!name || !tag) {
      return NextResponse.json({ error: 'Nom et tag requis' }, { status: 400 });
    }

    // Vérifier si le tag existe déjà (en excluant l'équipe actuelle)
    if (dbService.teamTagExists(tag, id)) {
      return NextResponse.json({ error: 'Ce tag existe déjà' }, { status: 409 });
    }

    // Mettre à jour l'équipe
    const updatedTeam = dbService.updateTeam(id, {
      name,
      tag,
      country,
      logo_url,
      founded_year,
      total_earnings
    });

    if (!updatedTeam) {
      return NextResponse.json({ error: 'Équipe non trouvée' }, { status: 404 });
    }

    return NextResponse.json(updatedTeam);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'équipe:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const dbService = getDbService();
    const { id } = params;

    const success = dbService.deleteTeam(id);

    if (!success) {
      return NextResponse.json({ error: 'Équipe non trouvée' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Équipe supprimée avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'équipe:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}