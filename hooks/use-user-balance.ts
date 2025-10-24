import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';

interface UserData {
  id: string;
  clerk_id: string;
  username: string;
  email: string;
  balance: number;
  total_bet: number;
  total_won: number;
  created_at: string;
}

export function useUserBalance() {
  const { user } = useUser();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadUserData = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clerk_id: user.id })
      });

      if (response.ok) {
        const data = await response.json();
        setUserData(data.user);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Erreur lors du chargement des données utilisateur');
      }
    } catch (err) {
      setError('Erreur de connexion');
      console.error('Erreur lors du chargement des données utilisateur:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const updateBalance = useCallback((newBalance: number) => {
    setUserData(prev => prev ? { ...prev, balance: newBalance } : null);
  }, []);

  const placeBet = useCallback(async (matchId: number, teamId: number, amount: number, odds: number) => {
    if (!user?.id || !userData) {
      throw new Error('Utilisateur non connecté');
    }

    if (amount > userData.balance) {
      throw new Error('Solde insuffisant');
    }

    try {
      const response = await fetch('/api/bets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clerk_id: user.id,
          match_id: matchId,
          team_id: teamId,
          amount,
          odds
        })
      });

      const result = await response.json();

      if (response.ok) {
        updateBalance(result.newBalance);
        return result;
      } else {
        throw new Error(result.error || 'Erreur lors du placement du pari');
      }
    } catch (err) {
      throw err;
    }
  }, [user?.id, userData, updateBalance]);

  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  return {
    userData,
    loading,
    error,
    loadUserData,
    updateBalance,
    placeBet,
    balance: userData?.balance || 0
  };
}