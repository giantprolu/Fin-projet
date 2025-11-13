import { NextResponse } from 'next/server';
import { getDbService } from '@/lib/db-service';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const db = getDbService();
    db.updateMatchStatuses();
    return NextResponse.json({ 
      message: 'Statuts des matchs mis à jour avec succès' 
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour des statuts:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour des statuts' },
      { status: 500 }
    );
  }
}