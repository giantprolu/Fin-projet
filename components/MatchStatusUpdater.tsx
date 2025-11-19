'use client';

import { useEffect } from 'react';

export default function MatchStatusUpdater() {
  useEffect(() => {
    // Mettre à jour les statuts au chargement
    const updateStatuses = async () => {
      try {
        await fetch('/api/admin/matches/update-status', {
          method: 'POST',
        });
        console.log('✅ Statuts des matchs mis à jour automatiquement');
      } catch (error) {
        console.error('❌ Erreur mise à jour automatique des statuts:', error);
      }
    };

    updateStatuses();

    // Mettre à jour toutes les 5 minutes
    const interval = setInterval(updateStatuses, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return null; // Ce composant ne rend rien visuellement
}
