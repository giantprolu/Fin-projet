import { NextResponse } from 'next/server';
import { getSupabaseService } from '@/lib/db-supabase';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const db = getSupabaseService();
    const result = await db.updateMatchStatuses();
    
    console.log(`✅ Mise à jour terminée: ${result.scheduledToLive} matchs en live, ${result.liveToFinished} matchs terminés, ${result.cancelledBets} paris annulés`);
    
    return NextResponse.json({ 
      message: 'Statuts des matchs mis à jour avec succès',
      scheduledToLive: result.scheduledToLive,
      liveToFinished: result.liveToFinished,
      cancelledBets: result.cancelledBets
    });
  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour des statuts:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour des statuts des matchs' },
      { status: 500 }
    );
  }
}