'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, CreditCard as Edit, Trash2, Gamepad2, Clock, TrendingUp, Calendar, MapPin, AlertTriangle, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Match {
  id: number;
  game: string;
  tournament: string;
  team1: { name: string; logo: string; odds: number };
  team2: { name: string; logo: string; odds: number };
  date: string;
  time: string;
  status: 'scheduled' | 'live' | 'finished';
}

// Options pour les listes déroulantes
const gameOptions = [
  'Valorant',
  'League of Legends',
  'CS:GO',
  'Rocket League',
  'Overwatch 2',
  'Apex Legends',
  'Dota 2'
];

const tournamentOptions = {
  'Valorant': ['VCT Masters', 'VCT Champions', 'VCT Lock//In', 'VRL'],
  'League of Legends': ['LEC Spring', 'LEC Summer', 'Worlds', 'MSI', 'LFL'],
  'CS:GO': ['IEM Katowice', 'ESL Pro League', 'BLAST Premier', 'PGL Major'],
  'Rocket League': ['RLCS World Championship', 'RLCS Spring', 'RLCS Fall'],
  'Overwatch 2': ['Overwatch League', 'Overwatch World Cup', 'OWL Playoffs'],
  'Apex Legends': ['ALGS Championship', 'ALGS Split 1', 'ALGS Split 2'],
  'Dota 2': ['The International', 'ESL One', 'DreamLeague', 'DPC']
};

const renderTeamLogo = (logo: string, teamName: string) => {
  // Si le logo commence par '/', c'est un chemin d'image
  if (logo.startsWith('/')) {
    return (
      <Image
        src={logo}
        alt={teamName}
        width={48}
        height={48}
        className="rounded-lg object-contain"
      />
    );
  }
  // Sinon, c'est une émoji
  return <span className="text-4xl">{logo}</span>;
};

export default function AdminMatchsPage() {
  const { toast } = useToast();
  const [matches, setMatches] = useState<Match[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingMatch, setEditingMatch] = useState<Match | null>(null);
  const [formData, setFormData] = useState({
    game: '',
    tournament: '',
    team1: '',
    team1Odds: 1.5,
    team2: '',
    team2Odds: 2.0,
    date: '',
    time: '',
    status: 'scheduled' as 'scheduled' | 'live' | 'finished',
  });

  // États pour la gestion des paris problématiques
  const [showProblematicBets, setShowProblematicBets] = useState(false);
  const [problematicBets, setProblematicBets] = useState<any[]>([]);
  const [loadingBets, setLoadingBets] = useState(false);

  // Charger les équipes depuis la base de données
  const loadTeams = async () => {
    try {
      console.log('Chargement des équipes...');
      const response = await fetch('/api/teams');
      const data = await response.json();
      console.log('Équipes reçues:', data);
      console.log('Setting teams to:', data);
      setTeams(data || []);
      console.log('Teams state should now be updated');
    } catch (error) {
      console.error('Erreur lors du chargement des équipes:', error);
    }
  };

  // Charger les matchs depuis la base de données
  const loadMatches = async () => {
    try {
      const response = await fetch('/api/admin/matches');
      const data = await response.json();
      setMatches(data.matches || []);
    } catch (error) {
      console.error('Erreur lors du chargement des matchs:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([loadMatches(), loadTeams()]);
      setLoading(false);
    };
    loadData();
  }, []);

  const getTeamByName = (teamName: string) => {
    return teams.find((team: any) => team.name === teamName) || { 
      name: teamName, 
      tag: teamName.slice(0, 3).toUpperCase(), 
      logo_url: '/assets/Team_Vitality_Logo_2018.png' 
    };
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'live':
        return <Badge className="bg-red-500 text-white animate-pulse">🔴 En Direct</Badge>;
      case 'finished':
        return <Badge className="bg-gray-500 text-white">✅ Terminé</Badge>;
      default:
        return <Badge className="bg-blue-500 text-white">🕐 Programmé</Badge>;
    }
  };

  const resetForm = () => {
    setFormData({
      game: '',
      tournament: '',
      team1: '',
      team1Odds: 1.5,
      team2: '',
      team2Odds: 2.0,
      date: '',
      time: '',
      status: 'scheduled',
    });
  };

  // Fonction pour charger les paris problématiques
  const loadProblematicBets = async () => {
    setLoadingBets(true);
    try {
      const response = await fetch('/api/admin/bets');
      if (response.ok) {
        const data = await response.json();
        setProblematicBets(data.problematicBets || []);
      } else {
        toast({
          title: 'Erreur',
          description: 'Impossible de charger les paris problématiques',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
      toast({
        title: 'Erreur',
        description: 'Erreur lors du chargement des paris',
        variant: 'destructive'
      });
    } finally {
      setLoadingBets(false);
    }
  };

  // Fonction pour annuler un pari
  const cancelBet = async (betId: number) => {
    try {
      const response = await fetch('/api/admin/bets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'cancel',
          betId: betId
        })
      });

      if (response.ok) {
        toast({
          title: 'Succès',
          description: 'Pari annulé avec succès'
        });
        loadProblematicBets(); // Recharger la liste
      } else {
        toast({
          title: 'Erreur',
          description: 'Impossible d\'annuler le pari',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Erreur lors de l\'annulation:', error);
      toast({
        title: 'Erreur',
        description: 'Erreur lors de l\'annulation du pari',
        variant: 'destructive'
      });
    }
  };

  // Fonction pour supprimer un pari
  const deleteBet = async (betId: number) => {
    try {
      const response = await fetch('/api/admin/bets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'delete',
          betId: betId
        })
      });

      if (response.ok) {
        toast({
          title: 'Succès',
          description: 'Pari supprimé avec succès'
        });
        loadProblematicBets(); // Recharger la liste
      } else {
        toast({
          title: 'Erreur',
          description: 'Impossible de supprimer le pari',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast({
        title: 'Erreur',
        description: 'Erreur lors de la suppression du pari',
        variant: 'destructive'
      });
    }
  };

  // Fonction pour nettoyer tous les paris problématiques
  const cleanupAllProblematicBets = async () => {
    try {
      const response = await fetch('/api/admin/bets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'cleanup'
        })
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: 'Succès',
          description: `${data.deletedCount} paris problématiques supprimés`
        });
        loadProblematicBets(); // Recharger la liste
      } else {
        toast({
          title: 'Erreur',
          description: 'Impossible de nettoyer les paris',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Erreur lors du nettoyage:', error);
      toast({
        title: 'Erreur',
        description: 'Erreur lors du nettoyage des paris',
        variant: 'destructive'
      });
    }
  };

  const handleDelete = async (matchId: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce match ?')) return;

    try {
      const response = await fetch(`/api/admin/matches/${matchId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        loadMatches(); // Recharger la liste des matchs
      } else {
        console.error('Erreur lors de la suppression du match');
      }
    } catch (error) {
      console.error('Erreur lors de la suppression du match:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen py-12 px-4">
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

  const handleCreate = async () => {
    try {
      const response = await fetch('/api/admin/matches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          game: formData.game,
          tournament: formData.tournament,
          team1: formData.team1,
          team2: formData.team2,
          team1Odds: formData.team1Odds,
          team2Odds: formData.team2Odds,
          date: formData.date,
          time: formData.time,
          status: formData.status,
        }),
      });

      if (response.ok) {
        setIsCreateOpen(false);
        resetForm();
        loadMatches(); // Recharger la liste des matchs
      } else {
        console.error('Erreur lors de la création du match');
      }
    } catch (error) {
      console.error('Erreur lors de la création du match:', error);
    }
  };

  const handleEdit = (match: Match) => {
    setEditingMatch(match);
    setFormData({
      game: match.game,
      tournament: match.tournament,
      team1: match.team1.name,
      team1Odds: match.team1.odds,
      team2: match.team2.name,
      team2Odds: match.team2.odds,
      date: match.date,
      time: match.time,
      status: match.status,
    });
  };

  const handleUpdate = async () => {
    if (!editingMatch) return;

    try {
      const response = await fetch(`/api/admin/matches/${editingMatch.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          game: formData.game,
          tournament: formData.tournament,
          team1: formData.team1,
          team2: formData.team2,
          team1Odds: formData.team1Odds,
          team2Odds: formData.team2Odds,
          date: formData.date,
          time: formData.time,
          status: formData.status,
        }),
      });

      if (response.ok) {
        setEditingMatch(null);
        resetForm();
        loadMatches(); // Recharger la liste des matchs
      } else {
        console.error('Erreur lors de la mise à jour du match');
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du match:', error);
    }
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8 text-center"
        >
          <h1 className="text-5xl font-bold mb-2">
            <span className="bg-gradient-to-r from-copper to-teal bg-clip-text text-transparent">
              Gestion des Matchs
            </span>
          </h1>
          <p className="text-xl text-slate-300 mb-6">
            Créez, modifiez et gérez les matchs esports
          </p>

          <div className="flex gap-4 justify-center">
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-copper to-copper-600 hover:from-copper-600 hover:to-copper-700 text-white font-semibold shadow-lg"
                >
                  <Plus className="mr-2 w-5 h-5" />
                  Créer un Match
                </Button>
              </DialogTrigger>
            </Dialog>
            
            <Button
              size="lg"
              variant="outline"
              className="border-red-500/50 text-red-400 hover:bg-red-500/10 hover:border-red-500"
              onClick={() => {
                setShowProblematicBets(true);
                loadProblematicBets();
              }}
            >
              <AlertTriangle className="mr-2 w-5 h-5" />
              Gérer les Paris Problématiques
              {problematicBets.length > 0 && (
                <Badge className="ml-2 bg-red-500 text-white">
                  {problematicBets.length}
                </Badge>
              )}
            </Button>
          </div>

          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-800 border-slate-700">
              <DialogHeader>
                <DialogTitle className="text-white">Créer un nouveau match</DialogTitle>
                <DialogDescription className="text-slate-300">
                  Remplissez les informations du match
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="game" className="text-white">Jeu</Label>
                    <Select
                      value={formData.game}
                      onValueChange={(value) => {
                        setFormData({ ...formData, game: value, tournament: '' });
                      }}
                    >
                      <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                        <SelectValue placeholder="Sélectionner un jeu" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-700 border-slate-600">
                        {gameOptions.map((game) => (
                          <SelectItem key={game} value={game} className="text-white hover:bg-slate-600">
                            {game}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="tournament" className="text-white">Tournoi</Label>
                    <Select
                      value={formData.tournament}
                      onValueChange={(value) => setFormData({ ...formData, tournament: value })}
                      disabled={!formData.game}
                    >
                      <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                        <SelectValue placeholder="Sélectionner un tournoi" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-700 border-slate-600">
                        {formData.game && tournamentOptions[formData.game as keyof typeof tournamentOptions]?.map((tournament: string) => (
                          <SelectItem key={tournament} value={tournament} className="text-white hover:bg-slate-600">
                            {tournament}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="border-t border-slate-600 pt-4">
                  <h4 className="font-semibold mb-3 text-white">Équipe 1</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="team1" className="text-white">Équipe</Label>
                      <Select
                        value={formData.team1}
                        onValueChange={(value) => setFormData({ ...formData, team1: value })}
                      >
                        <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                          <SelectValue placeholder="Sélectionner l'équipe 1" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-700 border-slate-600">
                          {(() => {
                            console.log('Rendering team dropdown, teams.length:', teams.length, 'teams:', teams);
                            return teams.length === 0 ? (
                              <SelectItem value="loading" disabled className="text-slate-400">
                                Chargement des équipes...
                              </SelectItem>
                            ) : (
                              teams.map((team: any) => (
                                <SelectItem key={team.name} value={team.name} className="text-white hover:bg-slate-600">
                                  {team.name}
                                </SelectItem>
                              ))
                            );
                          })()}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="team1Odds" className="text-white">Cote</Label>
                      <Input
                        id="team1Odds"
                        type="number"
                        step="0.01"
                        value={formData.team1Odds}
                        onChange={(e) =>
                          setFormData({ ...formData, team1Odds: parseFloat(e.target.value) })
                        }
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-600 pt-4">
                  <h4 className="font-semibold mb-3 text-white">Équipe 2</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="team2" className="text-white">Équipe</Label>
                      <Select
                        value={formData.team2}
                        onValueChange={(value) => setFormData({ ...formData, team2: value })}
                      >
                        <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                          <SelectValue placeholder="Sélectionner l'équipe 2" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-700 border-slate-600">
                          {teams.length === 0 ? (
                            <SelectItem value="loading" disabled className="text-slate-400">
                              Chargement des équipes...
                            </SelectItem>
                          ) : (
                            teams
                              .filter((team: any) => team.name !== formData.team1)
                              .map((team: any) => (
                                <SelectItem key={team.name} value={team.name} className="text-white hover:bg-slate-600">
                                  {team.name}
                                </SelectItem>
                              ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="team2Odds" className="text-white">Cote</Label>
                      <Input
                        id="team2Odds"
                        type="number"
                        step="0.01"
                        value={formData.team2Odds}
                        onChange={(e) =>
                          setFormData({ ...formData, team2Odds: parseFloat(e.target.value) })
                        }
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="date" className="text-white">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="time" className="text-white">Heure</Label>
                    <Input
                      id="time"
                      type="time"
                      value={formData.time}
                      onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                </div>

                <Button
                  onClick={handleCreate}
                  className="w-full bg-copper hover:bg-copper-600 text-white"
                >
                  Créer le match
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6">
          <AnimatePresence>
            {matches.map((match, index) => (
              <motion.div
                key={match.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="p-6 bg-slate-800/90 border border-slate-700 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 hover:border-copper/50">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Gamepad2 className="w-8 h-8 text-copper" />
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className="bg-teal/10 text-teal">{match.game}</Badge>
                          {getStatusBadge(match.status)}
                        </div>
                        <h3 className="text-xl font-bold text-white">
                          {match.tournament}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-slate-400 mt-1">
                          <Clock className="w-4 h-4" />
                          {match.date} à {match.time}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Dialog
                        open={editingMatch?.id === match.id}
                        onOpenChange={(open) => !open && setEditingMatch(null)}
                      >
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(match)}
                            className="hover:bg-copper/10 hover:border-copper border-slate-600 text-black"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-800 border-slate-700">
                          <DialogHeader>
                            <DialogTitle className="text-white">Modifier le match</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 mt-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label className="text-white">Jeu</Label>
                                <Select
                                  value={formData.game}
                                  onValueChange={(value) => {
                                    setFormData({ ...formData, game: value, tournament: '' });
                                  }}
                                >
                                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                                    <SelectValue placeholder="Sélectionner un jeu" />
                                  </SelectTrigger>
                                  <SelectContent className="bg-slate-700 border-slate-600">
                                    {gameOptions.map((game) => (
                                      <SelectItem key={game} value={game} className="text-white hover:bg-slate-600">
                                        {game}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label className="text-white">Tournoi</Label>
                                <Select
                                  value={formData.tournament}
                                  onValueChange={(value) => setFormData({ ...formData, tournament: value })}
                                  disabled={!formData.game}
                                >
                                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                                    <SelectValue placeholder="Sélectionner un tournoi" />
                                  </SelectTrigger>
                                  <SelectContent className="bg-slate-700 border-slate-600">
                                    {formData.game && tournamentOptions[formData.game as keyof typeof tournamentOptions]?.map((tournament: string) => (
                                      <SelectItem key={tournament} value={tournament} className="text-white hover:bg-slate-600">
                                        {tournament}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>

                            <div className="border-t border-slate-600 pt-4">
                              <h4 className="font-semibold mb-3 text-white">Équipe 1</h4>
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <Label className="text-white">Équipe</Label>
                                  <Select
                                    value={formData.team1}
                                    onValueChange={(value) => setFormData({ ...formData, team1: value })}
                                  >
                                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                                      <SelectValue placeholder="Sélectionner l'équipe 1" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-slate-700 border-slate-600">
                                      {teams.map((team: any) => (
                                        <SelectItem key={team.name} value={team.name} className="text-white hover:bg-slate-600">
                                          {team.name}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div>
                                  <Label className="text-white">Cote</Label>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    value={formData.team1Odds}
                                    onChange={(e) =>
                                      setFormData({
                                        ...formData,
                                        team1Odds: parseFloat(e.target.value),
                                      })
                                    }
                                    className="bg-slate-700 border-slate-600 text-white"
                                  />
                                </div>
                              </div>
                            </div>

                            <div className="border-t border-slate-600 pt-4">
                              <h4 className="font-semibold mb-3 text-white">Équipe 2</h4>
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <Label className="text-white">Équipe</Label>
                                  <Select
                                    value={formData.team2}
                                    onValueChange={(value) => setFormData({ ...formData, team2: value })}
                                  >
                                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                                      <SelectValue placeholder="Sélectionner l'équipe 2" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-slate-700 border-slate-600">
                                      {teams
                                        .filter((team: any) => team.name !== formData.team1)
                                        .map((team: any) => (
                                          <SelectItem key={team.name} value={team.name} className="text-white hover:bg-slate-600">
                                            {team.name}
                                          </SelectItem>
                                        ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div>
                                  <Label className="text-white">Cote</Label>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    value={formData.team2Odds}
                                    onChange={(e) =>
                                      setFormData({
                                        ...formData,
                                        team2Odds: parseFloat(e.target.value),
                                      })
                                    }
                                    className="bg-slate-700 border-slate-600 text-white"
                                  />
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label className="text-white">Date</Label>
                                <Input
                                  type="date"
                                  value={formData.date}
                                  onChange={(e) =>
                                    setFormData({ ...formData, date: e.target.value })
                                  }
                                  className="bg-slate-700 border-slate-600 text-white"
                                />
                              </div>
                              <div>
                                <Label className="text-white">Heure</Label>
                                <Input
                                  type="time"
                                  value={formData.time}
                                  onChange={(e) =>
                                    setFormData({ ...formData, time: e.target.value })
                                  }
                                  className="bg-slate-700 border-slate-600 text-white"
                                />
                              </div>
                            </div>

                            <Button
                              onClick={handleUpdate}
                              className="w-full bg-copper hover:bg-copper-600 text-white"
                            >
                              Mettre à jour
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-black hover:bg-black hover:text-white hover:bg-red-50 hover:border-red-400 hover:text-red-600 border-slate-600"
                        onClick={() => handleDelete(match.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-slate-700/50 rounded-lg border border-copper/20">
                        <div className="flex items-center gap-3 mb-2">
                          {renderTeamLogo(match.team1.logo, match.team1.name)}
                          <div className="flex-1">
                            <p className="font-bold text-lg text-white">
                              {match.team1.name}
                            </p>
                            <p className="text-sm text-slate-400">Équipe 1</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-copper/10 rounded-lg">
                          <div className="flex items-center gap-1 text-copper">
                            <TrendingUp className="w-4 h-4" />
                            <span className="text-sm">Cote</span>
                          </div>
                          <span className="text-xl font-bold text-copper">
                            {match.team1.odds}
                          </span>
                        </div>
                      </div>

                      <div className="p-4 bg-slate-700/50 rounded-lg border border-teal/20">
                        <div className="flex items-center gap-3 mb-2">
                          {renderTeamLogo(match.team2.logo, match.team2.name)}
                          <div className="flex-1">
                            <p className="font-bold text-lg text-white">
                              {match.team2.name}
                            </p>
                            <p className="text-sm text-slate-400">Équipe 2</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-teal/10 rounded-lg">
                          <div className="flex items-center gap-1 text-teal">
                            <TrendingUp className="w-4 h-4" />
                            <span className="text-sm">Cote</span>
                          </div>
                          <span className="text-xl font-bold text-teal">
                            {match.team2.odds}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                      <div className="flex items-center gap-2 text-slate-300">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm">Date du match</span>
                      </div>
                      <span className="font-bold text-white">{match.date} à {match.time}</span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                      <div className="flex items-center gap-2 text-slate-300">
                        <MapPin className="w-4 h-4" />
                        <span className="text-sm">Tournoi</span>
                      </div>
                      <span className="font-bold text-white">{match.tournament}</span>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Modal de gestion des paris problématiques */}
        <Dialog open={showProblematicBets} onOpenChange={setShowProblematicBets}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-800 border-slate-700">
            <DialogHeader>
              <DialogTitle className="text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                Gestion des Paris Problématiques
              </DialogTitle>
              <DialogDescription className="text-slate-300">
                Gérez les paris avec des données incohérentes ou problématiques
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 mt-4">
              {loadingBets ? (
                <div className="flex justify-center items-center h-32">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-8 h-8 border-4 border-red-400 border-t-transparent rounded-full"
                  />
                </div>
              ) : problematicBets.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-slate-400">Aucun pari problématique trouvé</p>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-center mb-4">
                    <p className="text-white">
                      {problematicBets.length} paris problématiques détectés
                    </p>
                    <Button
                      onClick={cleanupAllProblematicBets}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      <X className="mr-2 w-4 h-4" />
                      Nettoyer Tous
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {problematicBets.map((bet: any) => (
                      <motion.div
                        key={bet.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="p-4 bg-slate-700/50 rounded-lg border border-red-500/20"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge className="bg-red-500/20 text-red-400 border border-red-500/30">
                                Problématique
                              </Badge>
                              <span className="text-sm text-slate-400">
                                ID: {bet.id}
                              </span>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="text-slate-400">Utilisateur:</p>
                                <p className="text-white">{bet.user_id}</p>
                              </div>
                              <div>
                                <p className="text-slate-400">Montant:</p>
                                <p className="text-white">{bet.amount} ⚡</p>
                              </div>
                              <div>
                                <p className="text-slate-400">Équipe choisie:</p>
                                <p className="text-white">{bet.selected_team || 'Non définie'}</p>
                              </div>
                              <div>
                                <p className="text-slate-400">Match:</p>
                                <p className="text-white">{bet.match_game || 'Unknown Game'}</p>
                              </div>
                              <div>
                                <p className="text-slate-400">Status:</p>
                                <p className="text-white">{bet.status}</p>
                              </div>
                              <div>
                                <p className="text-slate-400">Date:</p>
                                <p className="text-white">
                                  {bet.placed_at ? new Date(bet.placed_at).toLocaleDateString('fr-FR') : 'Non définie'}
                                </p>
                              </div>
                            </div>

                            {bet.issue && (
                              <div className="mt-2 p-2 bg-red-500/10 rounded border border-red-500/20">
                                <p className="text-red-400 text-sm">
                                  <strong>Problème:</strong> {bet.issue}
                                </p>
                              </div>
                            )}
                          </div>

                          <div className="flex gap-2 ml-4">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => cancelBet(bet.id)}
                              className="border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10"
                            >
                              Annuler
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => deleteBet(bet.id)}
                              className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
