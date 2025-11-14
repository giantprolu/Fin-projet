import { NextResponse } from 'next/server';
import { getSupabaseService } from '@/lib/db-supabase';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const db = getSupabaseService();
    await db.updateMatchStatuses();
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