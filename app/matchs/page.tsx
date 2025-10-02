'use client';

import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, TrendingUp, Users, Flame, Trophy } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { type MatchWithTeams } from '@/lib/database';

interface MatchDisplayData {
  id: string;
  game: string;
  tournament: string;
  team1: { name: string; tag: string; logo?: string; odds?: number };
  team2: { name: string; tag: string; logo?: string; odds?: number };
  time: string;
  live: boolean;
  popular: boolean;
  status: string;
  format: string;
  matchDate: string;
}

export default function MatchsPage() {
  const [matches, setMatches] = useState<MatchDisplayData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState('Tous');

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const response = await fetch('/api/matches');
        const data: MatchWithTeams[] = await response.json();
        
        const processedMatches: MatchDisplayData[] = data.map(match => {
          const matchDate = new Date(match.match_date);
          const now = new Date();
          const timeDiff = matchDate.getTime() - now.getTime();
          const hoursUntil = Math.floor(timeDiff / (1000 * 60 * 60));
          
          let timeDisplay = '';
          let isLive = false;
          
          if (match.status === 'live') {
            timeDisplay = 'Live';
            isLive = true;
          } else if (match.status === 'completed') {
            timeDisplay = 'Terminé';
          } else if (hoursUntil <= 0) {
            timeDisplay = 'Bientôt';
          } else if (hoursUntil < 24) {
            timeDisplay = `Dans ${hoursUntil}h`;
          } else {
            const daysUntil = Math.floor(hoursUntil / 24);
            timeDisplay = `Dans ${daysUntil}j`;
          }

          // Obtenir les cotes depuis les odds du match
          const team1Odds = match.odds?.find(odd => odd.team_id === match.team1_id)?.odds || 2.0;
          const team2Odds = match.odds?.find(odd => odd.team_id === match.team2_id)?.odds || 2.0;

          return {
            id: match.id,
            game: match.game.name,
            tournament: match.tournament.name,
            team1: {
              name: match.team1.name,
              tag: match.team1.tag,
              logo: getTeamEmoji(match.team1.tag),
              odds: team1Odds
            },
            team2: {
              name: match.team2.name,
              tag: match.team2.tag,
              logo: getTeamEmoji(match.team2.tag),
              odds: team2Odds
            },
            time: timeDisplay,
            live: isLive,
            popular: Math.random() > 0.5, // Simulé pour l'instant
            status: match.status,
            format: match.format,
            matchDate: match.match_date
          };
        });
        
        setMatches(processedMatches);
      } catch (error) {
        console.error('Erreur lors du chargement des matchs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, []);

  const getTeamEmoji = (tag: string): string => {
    const emojis: { [key: string]: string } = {
      'VIT': '🔥',
      'KC': '👑',
      'LDLC': '⭐',
      'BDS': '🛡️',
      'SLY': '🐍',
      'GM': '🎯',
      'DEFAULT': '🏆'
    };
    return emojis[tag] || emojis['DEFAULT'];
  };

  const filters = ['Tous', 'Live', 'League of Legends', 'Counter-Strike 2', 'Valorant'];
  
  const filteredMatches = matches.filter(match => {
    if (selectedFilter === 'Tous') return true;
    if (selectedFilter === 'Live') return match.live;
    return match.game === selectedFilter;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-copper-50 py-12 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="flex justify-center items-center h-64">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-12 h-12 border-4 border-copper border-t-transparent rounded-full"
            />
          </div>
        </div>
      </div>
    );
  }

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
          <div className="mt-4 text-sm text-gray-500">
            {matches.length} matchs disponibles
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex gap-3 mb-8 flex-wrap"
        >
          {filters.map((filter, index) => (
            <motion.div
              key={filter}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Badge
                variant={selectedFilter === filter ? 'default' : 'outline'}
                className={`px-4 py-2 text-sm cursor-pointer ${
                  selectedFilter === filter
                    ? 'bg-copper text-white hover:bg-copper-600'
                    : 'hover:bg-copper/10'
                }`}
                onClick={() => setSelectedFilter(filter)}
              >
                {filter}
              </Badge>
            </motion.div>
          ))}
        </motion.div>

        {filteredMatches.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              Aucun match trouvé
            </h3>
            <p className="text-gray-500">
              Essayez de changer votre filtre ou revenez plus tard
            </p>
          </motion.div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMatches.map((match, index) => (
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
                        <p className="text-xs text-gray-400">{match.format}</p>
                      </div>
                      <div className="flex gap-2 flex-col">
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
                        {match.status === 'completed' && (
                          <Badge variant="outline" className="border-gray-400 text-gray-600">
                            Terminé
                          </Badge>
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
                            <p className="text-xs text-gray-500">{match.team1.tag}</p>
                          </div>
                        </div>
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          className="bg-copper text-white px-4 py-2 rounded-lg font-bold"
                        >
                          {match.team1.odds?.toFixed(2)}
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
                            <p className="text-xs text-gray-500">{match.team2.tag}</p>
                          </div>
                        </div>
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          className="bg-teal text-white px-4 py-2 rounded-lg font-bold"
                        >
                          {match.team2.odds?.toFixed(2)}
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

                    <Link href={`/parier?match=${match.id}`}>
                      <Button 
                        className="w-full bg-gradient-to-r from-copper to-copper-600 hover:from-copper-600 hover:to-copper-700 text-white font-semibold py-6 rounded-lg group"
                        disabled={match.status === 'completed'}
                      >
                        {match.status === 'completed' ? 'Match Terminé' : 'Parier Maintenant'}
                        {match.status !== 'completed' && (
                          <TrendingUp className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        )}
                      </Button>
                    </Link>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
