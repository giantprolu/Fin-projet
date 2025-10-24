'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useUser } from '@clerk/nextjs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Coins, TrendingUp, Target, Trophy } from 'lucide-react';

interface UserStats {
  user?: { balance: number };
  totalBets: number;
  wonBets: number;
  lostBets: number;
  pendingBets: number;
  winRate: number;
  profit: number;
  balance: number;
  totalStake: number;
  totalPayout: number;
  dailyStats: Array<{date: string, gains: number, pertes: number}>;
  monthlyStats: Array<{month: string, profit: number, winRate: number}>;
}

interface UserBet {
  id: number;
  match_id: number;
  user_id: number;
  amount: number;
  bet_type: string;
  outcome: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export default function ResultatsPage() {
  const { user } = useUser();
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [userBets, setUserBets] = useState<UserBet[]>([]);
  const [loading, setLoading] = useState(true);

  const initializeUser = async () => {
    try {
      console.log('Initialisation utilisateur pour:', user?.id);
      const response = await fetch('/api/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clerk_id: user?.id })
      });
      
      console.log('Réponse initializeUser status:', response.status);
      
      if (response.ok) {
        const userData = await response.json();
        console.log('Utilisateur initialisé:', userData);
        return userData;
      } else {
        const errorText = await response.text();
        console.error('Erreur lors de l\'initialisation utilisateur:', response.status, errorText);
        return null;
      }
    } catch (error) {
      console.error('Erreur lors de l\'initialisation utilisateur:', error);
      return null;
    }
  };

  const loadUserStats = async () => {
    try {
      console.log('Chargement des statistiques...');
      
      // Récupérer les statistiques personnalisées
      const statsResponse = await fetch('/api/stats');
      console.log('Réponse stats:', statsResponse.status);
      
      if (statsResponse.ok) {
        const stats = await statsResponse.json();
        console.log('Stats reçues:', stats);
        setUserStats(stats);

        // Récupérer les paris de l'utilisateur si on a l'ID
        if (stats.user?.id) {
          console.log('Chargement des paris pour user ID:', stats.user.id);
          const betsResponse = await fetch(`/api/bets?user_id=${stats.user.id}`);
          if (betsResponse.ok) {
            const betsData = await betsResponse.json();
            console.log('Paris reçus:', betsData);
            setUserBets(Array.isArray(betsData) ? betsData : []);
          }
        }
      } else {
        console.log('Pas de stats, création de stats par défaut');
        // Si pas de stats, créer des stats par défaut pour nouvel utilisateur
        setUserStats({
          user: { balance: 100 },
          totalBets: 0,
          wonBets: 0,
          lostBets: 0,
          pendingBets: 0,
          winRate: 0,
          profit: 0,
          balance: 100,
          totalStake: 0,
          totalPayout: 0,
          dailyStats: [],
          monthlyStats: []
        });
        setUserBets([]);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des stats:', error);
      // Stats par défaut en cas d'erreur
      setUserStats({
        user: { balance: 100 },
        totalBets: 0,
        wonBets: 0,
        lostBets: 0,
        pendingBets: 0,
        winRate: 0,
        profit: 0,
        balance: 100,
        totalStake: 0,
        totalPayout: 0,
        dailyStats: [],
        monthlyStats: []
      });
      setUserBets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      console.log('Utilisateur Clerk connecté:', user.id);
      initializeUser().then(() => {
        loadUserStats();
      });
    } else {
      console.log('Aucun utilisateur Clerk connecté');
      setLoading(false);
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-copper mx-auto"></div>
          <p className="text-white mt-4">Chargement de vos statistiques...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Connexion requise</h1>
          <p className="text-slate-300">Vous devez être connecté pour voir vos résultats.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold bg-gradient-to-r from-copper to-sage bg-clip-text text-transparent mb-4">
            Vos Résultats
          </h1>
          <p className="text-slate-300 text-lg">
            Suivez vos performances et gérez votre portefeuille
          </p>
        </motion.div>

        {/* Wallet & Quick Stats */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          <Card className="bg-gradient-to-br from-slate-800 to-slate-700 border-slate-600">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Portefeuille</CardTitle>
              <Coins className="h-4 w-4 text-copper" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {userStats?.balance?.toFixed(2) || '100.00'}€
              </div>
              <p className="text-xs text-slate-400">
                Solde actuel
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-slate-800 to-slate-700 border-slate-600">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Paris totaux</CardTitle>
              <Target className="h-4 w-4 text-sage" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {userStats?.totalBets || 0}
              </div>
              <p className="text-xs text-slate-400">
                Paris placés
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-slate-800 to-slate-700 border-slate-600">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Taux de réussite</CardTitle>
              <Trophy className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {userStats?.winRate?.toFixed(1) || '0.0'}%
              </div>
              <p className="text-xs text-slate-400">
                Paris gagnés
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-slate-800 to-slate-700 border-slate-600">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Profit/Perte</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${(userStats?.profit || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {(userStats?.profit || 0) >= 0 ? '+' : ''}{userStats?.profit?.toFixed(2) || '0.00'}€
              </div>
              <p className="text-xs text-slate-400">
                Total des gains/pertes
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Mes Paris */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-8"
        >
          <Card className="bg-gradient-to-br from-slate-800 to-slate-700 border-slate-600">
            <CardHeader>
              <CardTitle className="text-xl text-white">Mes Paris Récents</CardTitle>
            </CardHeader>
            <CardContent>
              {userBets.length > 0 ? (
                <div className="space-y-4">
                  {userBets.slice(0, 5).map((bet) => (
                    <div key={bet.id} className="flex justify-between items-center p-3 bg-slate-900/50 rounded-lg">
                      <div>
                        <p className="text-white font-medium">Pari #{bet.id}</p>
                        <p className="text-slate-400 text-sm">
                          {bet.bet_type} - {bet.outcome}
                        </p>
                        <p className="text-xs text-slate-500">
                          {new Date(bet.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-bold">{bet.amount}€</p>
                        <Badge 
                          className={
                            bet.status === 'won' ? 'bg-green-600' :
                            bet.status === 'lost' ? 'bg-red-600' :
                            'bg-yellow-600'
                          }
                        >
                          {bet.status === 'won' ? 'Gagné' :
                           bet.status === 'lost' ? 'Perdu' :
                           'En cours'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Target className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400">Aucun pari placé pour le moment</p>
                  <p className="text-slate-500 text-sm">Commencez à parier pour voir vos statistiques !</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Debug Info */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-8 p-4 bg-slate-900/50 rounded-lg"
        >
          <h3 className="text-white font-semibold mb-2">Debug Info:</h3>
          <div className="text-slate-400 text-sm space-y-1">
            <p>User ID (Clerk): {user?.id || 'Non connecté'}</p>
            <p>Stats chargées: {userStats ? 'Oui' : 'Non'}</p>
            <p>Nombre de paris: {userBets.length}</p>
            <p>Solde: {userStats?.balance || 'N/A'}€</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}