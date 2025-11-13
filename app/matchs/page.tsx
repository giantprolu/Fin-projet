'use client';

import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, TrendingUp, Users, Flame, Trophy } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import '../styles/matchs.css';

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
      <div className="matchs-loading">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-copper mx-auto"></div>
          <p className="text-white mt-4">Chargement des matchs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="matchs-page">
      <div className="matchs-container">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="matchs-header"
        >
          <h1 className="matchs-title">
            Matchs E-Sport
          </h1>
          <p className="matchs-subtitle">
            Découvrez et pariez sur les meilleurs matchs d&apos;esport
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="matchs-filters"
        >
          {filters.map((filter, index) => (
            <motion.div
              key={filter}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Badge
                variant={selectedFilter === filter ? 'default' : 'outline'}
                className={`matchs-filter-btn ${
                  selectedFilter === filter ? 'matchs-filter-btn--active' : ''
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
            className="matchs-empty-state"
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
          <div className="matchs-grid">
            {filteredMatches.map((match, index) => (
              <motion.div
                key={match.id}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className={`match-card ${match.live ? 'match-card--live' : ''}`}>
                  <div className="p-6">
                    <div className="match-card-header">
                      <div className="match-game-tournament">
                        <Badge
                          variant="secondary"
                          className="match-game"
                        >
                          {match.game}
                        </Badge>
                        <p className="match-tournament">{match.tournament}</p>
                        <p className="text-xs text-slate-400">{match.format}</p>
                      </div>
                      <div className="match-badges">
                        {match.live && (
                          <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                          >
                            <Badge className="match-badge--live">
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
                          <Badge variant="outline" className="match-badge--popular">
                            <Flame className="w-3 h-3 mr-1" />
                            Populaire
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="match-teams">
                      <motion.div
                        whileHover={{ x: 5 }}
                        className="match-team"
                      >
                        <div className="match-team-info">
                          <div className="match-team-logo-wrapper">
                            <Image
                              src={match.team1.logo || '/assets/Team_Vitality_Logo_2018.png'}
                              alt={`Logo ${match.team1.name}`}
                              width={48}
                              height={48}
                              className="match-team-logo"
                            />
                          </div>
                          <div>
                            <p className="match-team-name">{match.team1.name}</p>
                            <p className="match-team-tag">{match.team1.tag}</p>
                          </div>
                        </div>
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          className="match-team-odds"
                        >
                          {match.team1.odds?.toFixed(2)}
                        </motion.div>
                      </motion.div>

                      <div className="match-vs">VS</div>

                      <motion.div
                        whileHover={{ x: 5 }}
                        className="match-team"
                      >
                        <div className="match-team-info">
                          <div className="match-team-logo-wrapper">
                            <Image
                              src={match.team2.logo || '/assets/Team_Vitality_Logo_2018.png'}
                              alt={`Logo ${match.team2.name}`}
                              width={48}
                              height={48}
                              className="match-team-logo"
                            />
                          </div>
                          <div>
                            <p className="match-team-name">{match.team2.name}</p>
                            <p className="match-team-tag">{match.team2.tag}</p>
                          </div>
                        </div>
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          className="match-team-odds"
                        >
                          {match.team2.odds?.toFixed(2)}
                        </motion.div>
                      </motion.div>
                    </div>

                    <div className="match-footer">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span className="match-time-badge">{match.time}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        {Math.floor(Math.random() * 1000) + 500} paris
                      </div>
                    </div>

                    <Link href={`/parier?match=${match.id}`}>
                      <Button 
                        className="match-bet-btn"
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
