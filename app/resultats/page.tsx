'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useUser } from '@clerk/nextjs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Coins, TrendingUp, Target, Trophy } from 'lucide-react';
import { useUserBalance } from '@/hooks/use-user-balance';
import '../styles/resultats.css';

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
  team_id: number;
  amount: number;
  odds: number;
  potential_payout: number;
  status: string;
  placed_at: string;
  
  // Données du match
  match_status: string;
  game: string;
  match_date: string;
  winner_id?: number;
  
  // Données des équipes
  team1_name: string;
  team1_tag: string;
  team1_logo: string;
  team2_name: string;
  team2_tag: string;
  team2_logo: string;
  bet_team_name: string;
  bet_team_tag: string;
  bet_team_logo: string;
}

export default function ResultatsPage() {
  const { user } = useUser();
  const { userData, balance, loading: userLoading } = useUserBalance();
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [userBets, setUserBets] = useState<UserBet[]>([]);
  const [loading, setLoading] = useState(true);

  const initializeUser = useCallback(async () => {
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
  }, [user?.id]);

  const loadUserStats = useCallback(async () => {
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
          user: { balance },
          totalBets: 0,
          wonBets: 0,
          lostBets: 0,
          pendingBets: 0,
          winRate: 0,
          profit: 0,
          balance,
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
  }, [balance]);

  useEffect(() => {
    if (user && userData) {
      console.log('Utilisateur Clerk connecté:', user.id);
      initializeUser().then(() => {
        loadUserStats();
      });
    } else {
      console.log('Aucun utilisateur Clerk connecté');
      setLoading(false);
    }
  }, [user, userData, initializeUser, loadUserStats]);

  if (loading) {
    return (
      <div className="resultats-loading">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-copper mx-auto"></div>
          <p className="text-white mt-4">Chargement de vos statistiques...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="resultats-loading">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Connexion requise</h1>
          <p className="text-slate-300">Vous devez être connecté pour voir vos résultats.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="resultats-page">
      <div className="resultats-container">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="resultats-header"
        >
          <h1 className="resultats-title">
            Vos Résultats
          </h1>
          <p className="resultats-subtitle">
            Suivez vos performances et gérez votre portefeuille
          </p>
        </motion.div>

        {/* Wallet & Quick Stats */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="resultats-stats-grid"
        >
          <Card className="resultats-stat-card resultats-stat-card--copper">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Portefeuille</CardTitle>
              <Coins className="resultats-stat-icon" />
            </CardHeader>
            <CardContent>
              <div className="resultats-stat-value">
                {userStats?.balance?.toFixed(2) || '100.00'}€
              </div>
              <p className="resultats-stat-label">
                Solde actuel
              </p>
            </CardContent>
          </Card>

          <Card className="resultats-stat-card resultats-stat-card--teal">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Paris totaux</CardTitle>
              <Target className="resultats-stat-icon" />
            </CardHeader>
            <CardContent>
              <div className="resultats-stat-value">
                {userStats?.totalBets || 0}
              </div>
              <p className="resultats-stat-label">
                Paris placés
              </p>
            </CardContent>
          </Card>

          <Card className="resultats-stat-card resultats-stat-card--amber">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Taux de réussite</CardTitle>
              <Trophy className="resultats-stat-icon" />
            </CardHeader>
            <CardContent>
              <div className="resultats-stat-value">
                {userStats?.winRate?.toFixed(1) || '0.0'}%
              </div>
              <p className="resultats-stat-label">
                Paris gagnés
              </p>
            </CardContent>
          </Card>

          <Card className="resultats-stat-card resultats-stat-card--purple">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Profit/Perte</CardTitle>
              <TrendingUp className="resultats-stat-icon" />
            </CardHeader>
            <CardContent>
              <div className={`resultats-stat-value ${(userStats?.profit || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {(userStats?.profit || 0) >= 0 ? '+' : ''}{userStats?.profit?.toFixed(2) || '0.00'}€
              </div>
              <p className="resultats-stat-label">
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
          className="resultats-bets-section"
        >
          <Card className="resultats-stat-card">
            <CardHeader>
              <CardTitle className="resultats-bets-title">Mes Paris Récents</CardTitle>
            </CardHeader>
            <CardContent>
              {userBets.length > 0 ? (
                <div className="space-y-4">
                  {userBets.slice(0, 5).map((bet) => {
                    // Déterminer le statut du pari basé sur le statut du match
                    let betStatus = 'pending';
                    let betStatusLabel = 'En attente';
                    
                    if (bet.match_status === 'scheduled') {
                      betStatusLabel = 'En attente';
                    } else if (bet.match_status === 'live') {
                      betStatusLabel = 'En cours';
                    } else if (bet.match_status === 'finished') {
                      // Simulation aléatoire mais cohérente basée sur l'ID du pari
                      const seed = bet.id * 12345; // Seed basé sur l'ID pour cohérence
                      const random = (seed % 1000) / 1000; // Pseudo-random entre 0 et 1
                      
                      if (bet.winner_id) {
                        // Si on a un vrai winner_id, l'utiliser
                        betStatus = bet.winner_id === bet.team_id ? 'won' : 'lost';
                        betStatusLabel = bet.winner_id === bet.team_id ? 'Gagné' : 'Perdu';
                      } else {
                        // Sinon, simulation aléatoire mais cohérente
                        betStatus = random > 0.5 ? 'won' : 'lost';
                        betStatusLabel = random > 0.5 ? 'Gagné' : 'Perdu';
                      }
                    }

                    return (
                      <div key={bet.id} className="resultats-table-row">
                        <div className="resultats-match-cell">
                          <p className="text-white font-medium">Pari #{bet.id}</p>
                          <p className="resultats-bet-team">
                            {bet.bet_team_name || 'Équipe inconnue'} - {bet.game || 'Match'}
                          </p>
                          <p className="text-xs text-slate-500">
                            {bet.placed_at ? new Date(bet.placed_at).toLocaleDateString('fr-FR') : 'Date inconnue'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="resultats-bet-amount">{bet.amount}€</p>
                          <Badge 
                            className={
                              betStatus === 'won' ? 'resultats-bet-status-badge resultats-bet-status-badge--won' :
                              betStatus === 'lost' ? 'resultats-bet-status-badge resultats-bet-status-badge--lost' :
                              'resultats-bet-status-badge resultats-bet-status-badge--pending'
                            }
                          >
                            {betStatusLabel}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="resultats-empty-state">
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