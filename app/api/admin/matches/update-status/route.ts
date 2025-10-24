import { NextResponse } from 'next/server';
import { DatabaseService } from '@/lib/db-service';

const db = new DatabaseService();

export async function POST() {
  try {
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