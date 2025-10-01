'use client';

import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, DollarSign, Trophy, Target, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const bettingHistory = [
  {
    id: 1,
    date: '2025-09-28',
    match: 'Fnatic vs Loud',
    game: 'Valorant',
    team: 'Fnatic',
    teamLogo: '🦊',
    stake: 50,
    odds: 1.85,
    result: 'won',
    payout: 92.5,
  },
  {
    id: 2,
    date: '2025-09-27',
    match: 'G2 vs T1',
    game: 'League of Legends',
    team: 'G2 Esports',
    teamLogo: '⚔️',
    stake: 30,
    odds: 1.65,
    result: 'lost',
    payout: 0,
  },
  {
    id: 3,
    date: '2025-09-26',
    match: 'Navi vs FaZe',
    game: 'CS:GO',
    team: 'Navi',
    teamLogo: '⭐',
    stake: 75,
    odds: 1.90,
    result: 'won',
    payout: 142.5,
  },
  {
    id: 4,
    date: '2025-09-25',
    match: 'Sentinels vs OpTic',
    game: 'Valorant',
    team: 'OpTic',
    teamLogo: '🎯',
    stake: 40,
    odds: 1.80,
    result: 'won',
    payout: 72,
  },
  {
    id: 5,
    date: '2025-09-24',
    match: 'Team Spirit vs OG',
    game: 'Dota 2',
    team: 'Team Spirit',
    teamLogo: '👻',
    stake: 60,
    odds: 1.75,
    result: 'lost',
    payout: 0,
  },
];

const weeklyData = [
  { day: 'Lun', gains: 42, pertes: 30 },
  { day: 'Mar', gains: 75, pertes: 20 },
  { day: 'Mer', gains: 32, pertes: 50 },
  { day: 'Jeu', gains: 92, pertes: 15 },
  { day: 'Ven', gains: 68, pertes: 40 },
  { day: 'Sam', gains: 105, pertes: 25 },
  { day: 'Dim', gains: 87, pertes: 35 },
];

const performanceData = [
  { month: 'Jan', profit: 120 },
  { month: 'Fév', profit: 180 },
  { month: 'Mar', profit: 145 },
  { month: 'Avr', profit: 220 },
  { month: 'Mai', profit: 195 },
  { month: 'Juin', profit: 280 },
];

export default function ResultatsPage() {
  const totalStake = bettingHistory.reduce((sum, bet) => sum + bet.stake, 0);
  const totalPayout = bettingHistory.reduce((sum, bet) => sum + bet.payout, 0);
  const profit = totalPayout - totalStake;
  const winRate = (bettingHistory.filter((bet) => bet.result === 'won').length / bettingHistory.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-teal-50 py-12 px-4">
      <div className="container mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <h1 className="text-5xl md:text-6xl font-bold mb-4">
            <span className="bg-gradient-to-r from-teal to-copper bg-clip-text text-transparent">
              Vos Résultats
            </span>
          </h1>
          <p className="text-xl text-gray-600">
            Suivez vos performances et analysez vos paris
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="p-6 bg-gradient-to-br from-copper to-copper-600 text-white hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center justify-between mb-4">
                <DollarSign className="w-10 h-10" />
                <TrendingUp className="w-6 h-6" />
              </div>
              <p className="text-copper-100 mb-1">Profit Total</p>
              <p className="text-4xl font-bold">
                {profit > 0 ? '+' : ''}
                {profit.toFixed(2)}€
              </p>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-6 bg-gradient-to-br from-teal to-teal-600 text-white hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center justify-between mb-4">
                <Trophy className="w-10 h-10" />
                <Target className="w-6 h-6" />
              </div>
              <p className="text-teal-100 mb-1">Taux de Réussite</p>
              <p className="text-4xl font-bold">{winRate.toFixed(0)}%</p>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-6 bg-white border-2 border-gray-200 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center justify-between mb-4">
                <TrendingUp className="w-10 h-10 text-green-500" />
                <span className="text-green-500 font-semibold">↑</span>
              </div>
              <p className="text-gray-600 mb-1">Total Misé</p>
              <p className="text-4xl font-bold text-gray-900">{totalStake}€</p>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="p-6 bg-white border-2 border-gray-200 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center justify-between mb-4">
                <DollarSign className="w-10 h-10 text-copper" />
                <span className="text-copper font-semibold">↓</span>
              </div>
              <p className="text-gray-600 mb-1">Total Gagné</p>
              <p className="text-4xl font-bold text-gray-900">{totalPayout.toFixed(2)}€</p>
            </Card>
          </motion.div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-12">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="p-6">
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <BarChart className="w-6 h-6 text-copper" />
                Gains vs Pertes (7 derniers jours)
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '2px solid #d87943',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="gains" fill="#d87943" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="pertes" fill="#527575" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="p-6">
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-teal" />
                Performance (6 derniers mois)
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '2px solid #527575',
                      borderRadius: '8px',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="profit"
                    stroke="#527575"
                    strokeWidth={3}
                    dot={{ fill: '#527575', r: 6 }}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card className="p-6">
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Calendar className="w-6 h-6 text-copper" />
              Historique des Paris
            </h3>

            <div className="space-y-4">
              {bettingHistory.map((bet, index) => (
                <motion.div
                  key={bet.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                  className={`p-6 rounded-lg border-2 transition-all hover:shadow-lg ${
                    bet.result === 'won'
                      ? 'bg-green-50 border-green-200 hover:border-green-400'
                      : 'bg-red-50 border-red-200 hover:border-red-400'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-4">
                      <span className="text-4xl">{bet.teamLogo}</span>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="secondary" className="bg-teal/10 text-teal">
                            {bet.game}
                          </Badge>
                          <span className="text-sm text-gray-500">{bet.date}</span>
                        </div>
                        <p className="font-bold text-lg text-gray-900">{bet.match}</p>
                        <p className="text-sm text-gray-600">
                          Pari sur: <span className="font-semibold">{bet.team}</span>
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      {bet.result === 'won' ? (
                        <div className="flex items-center gap-2 text-green-600 mb-2">
                          <TrendingUp className="w-5 h-5" />
                          <span className="font-bold text-lg">Gagné</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-red-600 mb-2">
                          <TrendingDown className="w-5 h-5" />
                          <span className="font-bold text-lg">Perdu</span>
                        </div>
                      )}
                      <div className="text-sm text-gray-600 space-y-1">
                        <div>
                          Mise: <span className="font-semibold">{bet.stake}€</span>
                        </div>
                        <div>
                          Cote: <span className="font-semibold">{bet.odds}</span>
                        </div>
                        {bet.result === 'won' && (
                          <div className="text-green-600 font-bold">
                            Gain: +{bet.payout}€
                          </div>
                        )}
                        {bet.result === 'lost' && (
                          <div className="text-red-600 font-bold">
                            Perte: -{bet.stake}€
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
