'use client';

import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, TrendingUp, Users, Flame } from 'lucide-react';
import Link from 'next/link';

const matches = [
  {
    id: 1,
    game: 'Valorant',
    tournament: 'VCT Masters',
    team1: { name: 'Fnatic', logo: '🦊', odds: 1.85 },
    team2: { name: 'Loud', logo: '🔊', odds: 2.10 },
    time: 'Dans 2h',
    live: false,
    popular: true,
  },
  {
    id: 2,
    game: 'League of Legends',
    tournament: 'LEC Spring',
    team1: { name: 'G2 Esports', logo: '⚔️', odds: 1.65 },
    team2: { name: 'Fnatic', logo: '🦊', odds: 2.30 },
    time: 'Live',
    live: true,
    popular: true,
  },
  {
    id: 3,
    game: 'CS:GO',
    tournament: 'IEM Katowice',
    team1: { name: 'Navi', logo: '⭐', odds: 1.90 },
    team2: { name: 'FaZe Clan', logo: '💀', odds: 1.95 },
    time: 'Dans 4h',
    live: false,
    popular: false,
  },
  {
    id: 4,
    game: 'Dota 2',
    tournament: 'The International',
    team1: { name: 'Team Spirit', logo: '👻', odds: 1.75 },
    team2: { name: 'OG', logo: '🌟', odds: 2.15 },
    time: 'Dans 6h',
    live: false,
    popular: true,
  },
  {
    id: 5,
    game: 'Valorant',
    tournament: 'Champions Tour',
    team1: { name: 'Sentinels', logo: '🛡️', odds: 2.05 },
    team2: { name: 'OpTic', logo: '🎯', odds: 1.80 },
    time: 'Live',
    live: true,
    popular: false,
  },
  {
    id: 6,
    game: 'League of Legends',
    tournament: 'LCK Finals',
    team1: { name: 'T1', logo: '🏆', odds: 1.55 },
    team2: { name: 'Gen.G', logo: '⚡', odds: 2.50 },
    time: 'Demain 14h',
    live: false,
    popular: true,
  },
];

export default function MatchsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-copper-50 py-12 px-4">
      <div className="container mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <h1 className="text-5xl md:text-6xl font-bold mb-4">
            <span className="bg-gradient-to-r from-copper to-teal bg-clip-text text-transparent">
              Matchs Disponibles
            </span>
          </h1>
          <p className="text-xl text-gray-600">
            Découvrez les meilleurs matchs esports et placez vos paris
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex gap-3 mb-8 flex-wrap"
        >
          {['Tous', 'Live', 'Valorant', 'League of Legends', 'CS:GO', 'Dota 2'].map(
            (filter, index) => (
              <motion.div
                key={filter}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Badge
                  variant={index === 0 ? 'default' : 'outline'}
                  className={`px-4 py-2 text-sm cursor-pointer ${
                    index === 0
                      ? 'bg-copper text-white hover:bg-copper-600'
                      : 'hover:bg-copper/10'
                  }`}
                >
                  {filter}
                </Badge>
              </motion.div>
            )
          )}
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {matches.map((match, index) => (
            <motion.div
              key={match.id}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 border-transparent hover:border-copper/30 bg-white">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <Badge
                        variant="secondary"
                        className="bg-teal/10 text-teal mb-2"
                      >
                        {match.game}
                      </Badge>
                      <p className="text-sm text-gray-500">{match.tournament}</p>
                    </div>
                    <div className="flex gap-2">
                      {match.live && (
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ repeat: Infinity, duration: 2 }}
                        >
                          <Badge className="bg-red-500 text-white">
                            <span className="w-2 h-2 bg-white rounded-full mr-1 inline-block animate-pulse" />
                            Live
                          </Badge>
                        </motion.div>
                      )}
                      {match.popular && (
                        <Badge variant="outline" className="border-copper text-copper">
                          <Flame className="w-3 h-3 mr-1" />
                          Populaire
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4 mb-6">
                    <motion.div
                      whileHover={{ x: 5 }}
                      className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-gray-50 to-transparent hover:from-copper-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{match.team1.logo}</span>
                        <div>
                          <p className="font-bold text-gray-900">{match.team1.name}</p>
                          <p className="text-xs text-gray-500">Équipe 1</p>
                        </div>
                      </div>
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        className="bg-copper text-white px-4 py-2 rounded-lg font-bold"
                      >
                        {match.team1.odds}
                      </motion.div>
                    </motion.div>

                    <div className="text-center text-gray-400 font-semibold">VS</div>

                    <motion.div
                      whileHover={{ x: 5 }}
                      className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-gray-50 to-transparent hover:from-teal-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{match.team2.logo}</span>
                        <div>
                          <p className="font-bold text-gray-900">{match.team2.name}</p>
                          <p className="text-xs text-gray-500">Équipe 2</p>
                        </div>
                      </div>
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        className="bg-teal text-white px-4 py-2 rounded-lg font-bold"
                      >
                        {match.team2.odds}
                      </motion.div>
                    </motion.div>
                  </div>

                  <div className="flex items-center justify-between mb-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {match.time}
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      {Math.floor(Math.random() * 1000) + 500} paris
                    </div>
                  </div>

                  <Link href="/parier">
                    <Button className="w-full bg-gradient-to-r from-copper to-copper-600 hover:from-copper-600 hover:to-copper-700 text-white font-semibold py-6 rounded-lg group">
                      Parier Maintenant
                      <TrendingUp className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
