'use client';

import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, TrendingUp, Users, Flame, Trophy } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';

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
        const data = await response.json();
        
        const processedMatches: MatchDisplayData[] = data.map((match: any) => {
          const matchDate = new Date(match.match_date);
          const now = new Date();
          const timeDiff = matchDate.getTime() - now.getTime();
          const hoursUntil = Math.floor(timeDiff / (1000 * 60 * 60));
          
          let timeDisplay = '';
          let isLive = false;
          
          if (match.status === 'live') {
            timeDisplay = 'Live';
            isLive = true;
          } else if (match.status === 'finished') {
            timeDisplay = 'Terminé';
          } else if (hoursUntil <= 0) {
            timeDisplay = 'Bientôt';
          } else if (hoursUntil < 24) {
            timeDisplay = `Dans ${hoursUntil}h`;
          } else {
            const daysUntil = Math.floor(hoursUntil / 24);
            timeDisplay = `Dans ${daysUntil}j`;
          }

          return {
            id: match.id.toString(),
            game: match.game,
            tournament: match.tournament,
            team1: {
              name: match.team1.name,
              tag: match.team1.tag || '',
              logo: getTeamLogo(match.team1.tag || '', match.team1.logo),
              odds: match.team1.odds
            },
            team2: {
              name: match.team2.name,
              tag: match.team2.tag || '',
              logo: getTeamLogo(match.team2.tag || '', match.team2.logo),
              odds: match.team2.odds
            },
            time: timeDisplay,
            live: isLive,
            popular: Math.random() > 0.5, // Simulé pour l'instant
            status: match.status,
            format: 'BO3', // Valeur par défaut
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

  const getTeamLogo = (tag: string, logoUrl?: string): string => {
    // Si un logo personnalisé est fourni, l'utiliser
    if (logoUrl && logoUrl.startsWith('/assets/')) {
      return logoUrl;
    }
    
    // Sinon, utiliser les logos par défaut
    const logos: { [key: string]: string } = {
      'VIT': '/assets/Team_Vitality_Logo_2018.png',
      'KC': '/assets/Karmine_Corp.svg',
      'LDLC': '/assets/TeamLDLClogo.png',
      'BDS': '/assets/Team_BDS.png',
      'SLY': '/assets/Logo_Solary.png',
      'GM': '/assets/gentlemates.webp',
      'GO': '/assets/GamersOrigin.png',
      'MCES': '/assets/MCES.png',
      'MND': '/assets/Mandatory.png',
      'ATL': '/assets/atletico.webp',
      'DEFAULT': '/assets/Team_Vitality_Logo_2018.png'
    };
    return logos[tag] || logos['DEFAULT'];
  };

  const filters = ['Tous', 'Live', 'League of Legends', 'Counter-Strike 2', 'Valorant'];
  
  const filteredMatches = matches.filter(match => {
    if (selectedFilter === 'Tous') return true;
    if (selectedFilter === 'Live') return match.live;
    return match.game === selectedFilter;
  });

  if (loading) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-copper mx-auto"></div>
          <p className="text-white mt-4">Chargement des matchs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold bg-gradient-to-r from-copper to-sage bg-clip-text text-transparent mb-4">
            Matchs E-Sport
          </h1>
          <p className="text-slate-300 text-lg">
            Découvrez et pariez sur les meilleurs matchs d&apos;esport
          </p>
        </motion.div>

        {/* Filters */}
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
                className={`px-4 py-2 text-white cursor-pointer ${
                  selectedFilter === filter
                    ? 'bg-copper text-white hover:bg-copper-600'
                    : 'hover:bg-copper/30'
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
            <Trophy className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-300 mb-2">
              Aucun match trouvé
            </h3>
            <p className="text-slate-400">
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
                <Card className="overflow-hidden bg-slate-800/90 border border-slate-700 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 hover:border-copper/50">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <Badge
                          variant="secondary"
                          className="bg-teal/10 text-teal mb-2"
                        >
                          {match.game}
                        </Badge>
                        <p className="text-sm text-slate-300">{match.tournament}</p>
                        <p className="text-xs text-slate-400">{match.format}</p>
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
                          <Badge variant="outline" className="border-slate-400 text-slate-300">
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
                        className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-slate-800/50 to-transparent hover:from-copper/20 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 relative">
                            <Image
                              src={match.team1.logo || '/assets/Team_Vitality_Logo_2018.png'}
                              alt={`Logo ${match.team1.name}`}
                              fill
                              className="object-contain"
                            />
                          </div>
                          <div>
                            <p className="font-bold text-white">{match.team1.name}</p>
                            <p className="text-xs text-slate-400">{match.team1.tag}</p>
                          </div>
                        </div>
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          className="bg-copper text-white px-4 py-2 rounded-lg font-bold"
                        >
                          {match.team1.odds?.toFixed(2)}
                        </motion.div>
                      </motion.div>

                      <div className="text-center text-slate-300 font-semibold">VS</div>

                      <motion.div
                        whileHover={{ x: 5 }}
                        className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-slate-800/50 to-transparent hover:from-teal/20 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 relative">
                            <Image
                              src={match.team2.logo || '/assets/Team_Vitality_Logo_2018.png'}
                              alt={`Logo ${match.team2.name}`}
                              fill
                              className="object-contain"
                            />
                          </div>
                          <div>
                            <p className="font-bold text-white">{match.team2.name}</p>
                            <p className="text-xs text-slate-400">{match.team2.tag}</p>
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

                    <div className="flex items-center justify-between mb-4 text-sm text-slate-300">
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
