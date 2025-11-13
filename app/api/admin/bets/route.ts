import { NextRequest, NextResponse } from 'next/server';
import { getDbService } from '@/lib/db-service';

export const dynamic = 'force-dynamic';

// GET - Récupérer les paris problématiques
export async function GET() {
  try {
    const db = getDbService();
    const problematicBets = db.getProblematicBets();

    return NextResponse.json({ 
      problematicBets,
      count: problematicBets.length 
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des paris problématiques:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des paris problématiques' },
      { status: 500 }
    );
  }
}

// POST - Actions sur les paris (annuler, supprimer, nettoyer)
export async function POST(request: NextRequest) {
  try {
    const db = getDbService();
    const body = await request.json();
    const { action, betId, reason } = body;

    switch (action) {
      case 'cancel': {
        if (!betId) {
          return NextResponse.json(
            { error: 'ID du pari requis pour l\'annulation' },
            { status: 400 }
          );
        }
        
        const success = db.cancelBet(betId, reason || 'Annulé par l\'administrateur');
        return NextResponse.json({ 
          success, 
          message: success ? 'Pari annulé avec succès' : 'Erreur lors de l\'annulation'
        });
      }

      case 'delete': {
        if (!betId) {
          return NextResponse.json(
            { error: 'ID du pari requis pour la suppression' },
            { status: 400 }
          );
        }
        
        const success = db.deleteBet(betId, reason || 'Supprimé par l\'administrateur');
        return NextResponse.json({ 
          success, 
          message: success ? 'Pari supprimé avec succès' : 'Erreur lors de la suppression'
        });
      }

      case 'cleanup': {
        const result = db.cleanupProblematicBets();
        return NextResponse.json({ 
          success: true,
          message: `Nettoyage terminé: ${result.cancelled} paris annulés, ${result.deleted} paris supprimés`,
          result
        });
      }

      default:
        return NextResponse.json(
          { error: 'Action non reconnue. Actions disponibles: cancel, delete, cleanup' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Erreur lors de l\'action sur les paris:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'action sur les paris' },
      { status: 500 }
    );
  }
}