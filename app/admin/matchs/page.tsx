'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, CreditCard as Edit, Trash2, Gamepad2, Clock, TrendingUp } from 'lucide-react';

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

const initialMatches: Match[] = [
  {
    id: 1,
    game: 'Valorant',
    tournament: 'VCT Masters',
    team1: { name: 'Fnatic', logo: '🦊', odds: 1.85 },
    team2: { name: 'Loud', logo: '🔊', odds: 2.10 },
    date: '2025-10-05',
    time: '14:00',
    status: 'scheduled',
  },
  {
    id: 2,
    game: 'League of Legends',
    tournament: 'LEC Spring',
    team1: { name: 'G2 Esports', logo: '⚔️', odds: 1.65 },
    team2: { name: 'Fnatic', logo: '🦊', odds: 2.30 },
    date: '2025-10-02',
    time: '18:00',
    status: 'live',
  },
  {
    id: 3,
    game: 'CS:GO',
    tournament: 'IEM Katowice',
    team1: { name: 'Navi', logo: '⭐', odds: 1.90 },
    team2: { name: 'FaZe Clan', logo: '💀', odds: 1.95 },
    date: '2025-10-06',
    time: '16:00',
    status: 'scheduled',
  },
];

export default function AdminMatchsPage() {
  const [matches, setMatches] = useState<Match[]>(initialMatches);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingMatch, setEditingMatch] = useState<Match | null>(null);
  const [formData, setFormData] = useState({
    game: '',
    tournament: '',
    team1Name: '',
    team1Logo: '',
    team1Odds: 1.5,
    team2Name: '',
    team2Logo: '',
    team2Odds: 2.0,
    date: '',
    time: '',
    status: 'scheduled' as 'scheduled' | 'live' | 'finished',
  });

  const handleCreate = () => {
    const newMatch: Match = {
      id: Math.max(...matches.map((m) => m.id)) + 1,
      game: formData.game,
      tournament: formData.tournament,
      team1: { name: formData.team1Name, logo: formData.team1Logo, odds: formData.team1Odds },
      team2: { name: formData.team2Name, logo: formData.team2Logo, odds: formData.team2Odds },
      date: formData.date,
      time: formData.time,
      status: formData.status,
    };
    setMatches([...matches, newMatch]);
    setIsCreateOpen(false);
    resetForm();
  };

  const handleEdit = (match: Match) => {
    setEditingMatch(match);
    setFormData({
      game: match.game,
      tournament: match.tournament,
      team1Name: match.team1.name,
      team1Logo: match.team1.logo,
      team1Odds: match.team1.odds,
      team2Name: match.team2.name,
      team2Logo: match.team2.logo,
      team2Odds: match.team2.odds,
      date: match.date,
      time: match.time,
      status: match.status,
    });
  };

  const handleUpdate = () => {
    if (editingMatch) {
      setMatches(
        matches.map((match) =>
          match.id === editingMatch.id
            ? {
                ...match,
                game: formData.game,
                tournament: formData.tournament,
                team1: {
                  name: formData.team1Name,
                  logo: formData.team1Logo,
                  odds: formData.team1Odds,
                },
                team2: {
                  name: formData.team2Name,
                  logo: formData.team2Logo,
                  odds: formData.team2Odds,
                },
                date: formData.date,
                time: formData.time,
                status: formData.status,
              }
            : match
        )
      );
      setEditingMatch(null);
      resetForm();
    }
  };

  const handleDelete = (id: number) => {
    setMatches(matches.filter((match) => match.id !== id));
  };

  const resetForm = () => {
    setFormData({
      game: '',
      tournament: '',
      team1Name: '',
      team1Logo: '',
      team1Odds: 1.5,
      team2Name: '',
      team2Logo: '',
      team2Odds: 2.0,
      date: '',
      time: '',
      status: 'scheduled',
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'live':
        return <Badge className="bg-red-500 text-white">Live</Badge>;
      case 'finished':
        return <Badge className="bg-gray-500 text-white">Terminé</Badge>;
      default:
        return <Badge className="bg-blue-500 text-white">Programmé</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-copper-50 py-12 px-4">
      <div className="container mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8 flex items-center justify-between"
        >
          <div>
            <h1 className="text-5xl font-bold mb-2">
              <span className="bg-gradient-to-r from-copper to-teal bg-clip-text text-transparent">
                Gestion des Matchs
              </span>
            </h1>
            <p className="text-xl text-gray-600">
              Créez, modifiez et gérez les matchs esports
            </p>
          </div>

          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button
                size="lg"
                className="bg-gradient-to-r from-copper to-copper-600 hover:from-copper-600 hover:to-copper-700 text-white font-semibold"
              >
                <Plus className="mr-2 w-5 h-5" />
                Créer un Match
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Créer un nouveau match</DialogTitle>
                <DialogDescription>
                  Remplissez les informations du match
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="game">Jeu</Label>
                    <Input
                      id="game"
                      value={formData.game}
                      onChange={(e) => setFormData({ ...formData, game: e.target.value })}
                      placeholder="Ex: Valorant"
                    />
                  </div>
                  <div>
                    <Label htmlFor="tournament">Tournoi</Label>
                    <Input
                      id="tournament"
                      value={formData.tournament}
                      onChange={(e) =>
                        setFormData({ ...formData, tournament: e.target.value })
                      }
                      placeholder="Ex: VCT Masters"
                    />
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-3">Équipe 1</h4>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-2">
                      <Label htmlFor="team1Name">Nom</Label>
                      <Input
                        id="team1Name"
                        value={formData.team1Name}
                        onChange={(e) =>
                          setFormData({ ...formData, team1Name: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="team1Logo">Logo</Label>
                      <Input
                        id="team1Logo"
                        value={formData.team1Logo}
                        onChange={(e) =>
                          setFormData({ ...formData, team1Logo: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="team1Odds">Cote</Label>
                      <Input
                        id="team1Odds"
                        type="number"
                        step="0.01"
                        value={formData.team1Odds}
                        onChange={(e) =>
                          setFormData({ ...formData, team1Odds: parseFloat(e.target.value) })
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-3">Équipe 2</h4>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-2">
                      <Label htmlFor="team2Name">Nom</Label>
                      <Input
                        id="team2Name"
                        value={formData.team2Name}
                        onChange={(e) =>
                          setFormData({ ...formData, team2Name: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="team2Logo">Logo</Label>
                      <Input
                        id="team2Logo"
                        value={formData.team2Logo}
                        onChange={(e) =>
                          setFormData({ ...formData, team2Logo: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="team2Odds">Cote</Label>
                      <Input
                        id="team2Odds"
                        type="number"
                        step="0.01"
                        value={formData.team2Odds}
                        onChange={(e) =>
                          setFormData({ ...formData, team2Odds: parseFloat(e.target.value) })
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="time">Heure</Label>
                    <Input
                      id="time"
                      type="time"
                      value={formData.time}
                      onChange={(e) => setFormData({ ...formData, time: e.target.value })}
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

        <div className="space-y-6">
          <AnimatePresence>
            {matches.map((match, index) => (
              <motion.div
                key={match.id}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="p-6 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border-2 border-transparent hover:border-copper/30">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <Gamepad2 className="w-8 h-8 text-copper" />
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className="bg-teal/10 text-teal">{match.game}</Badge>
                          {getStatusBadge(match.status)}
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">
                          {match.tournament}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
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
                            className="hover:bg-copper/10 hover:border-copper"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Modifier le match</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 mt-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label>Jeu</Label>
                                <Input
                                  value={formData.game}
                                  onChange={(e) =>
                                    setFormData({ ...formData, game: e.target.value })
                                  }
                                />
                              </div>
                              <div>
                                <Label>Tournoi</Label>
                                <Input
                                  value={formData.tournament}
                                  onChange={(e) =>
                                    setFormData({ ...formData, tournament: e.target.value })
                                  }
                                />
                              </div>
                            </div>

                            <div className="border-t pt-4">
                              <h4 className="font-semibold mb-3">Équipe 1</h4>
                              <div className="grid grid-cols-3 gap-3">
                                <div className="col-span-2">
                                  <Label>Nom</Label>
                                  <Input
                                    value={formData.team1Name}
                                    onChange={(e) =>
                                      setFormData({ ...formData, team1Name: e.target.value })
                                    }
                                  />
                                </div>
                                <div>
                                  <Label>Logo</Label>
                                  <Input
                                    value={formData.team1Logo}
                                    onChange={(e) =>
                                      setFormData({ ...formData, team1Logo: e.target.value })
                                    }
                                  />
                                </div>
                                <div>
                                  <Label>Cote</Label>
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
                                  />
                                </div>
                              </div>
                            </div>

                            <div className="border-t pt-4">
                              <h4 className="font-semibold mb-3">Équipe 2</h4>
                              <div className="grid grid-cols-3 gap-3">
                                <div className="col-span-2">
                                  <Label>Nom</Label>
                                  <Input
                                    value={formData.team2Name}
                                    onChange={(e) =>
                                      setFormData({ ...formData, team2Name: e.target.value })
                                    }
                                  />
                                </div>
                                <div>
                                  <Label>Logo</Label>
                                  <Input
                                    value={formData.team2Logo}
                                    onChange={(e) =>
                                      setFormData({ ...formData, team2Logo: e.target.value })
                                    }
                                  />
                                </div>
                                <div>
                                  <Label>Cote</Label>
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
                                  />
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label>Date</Label>
                                <Input
                                  type="date"
                                  value={formData.date}
                                  onChange={(e) =>
                                    setFormData({ ...formData, date: e.target.value })
                                  }
                                />
                              </div>
                              <div>
                                <Label>Heure</Label>
                                <Input
                                  type="time"
                                  value={formData.time}
                                  onChange={(e) =>
                                    setFormData({ ...formData, time: e.target.value })
                                  }
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
                        onClick={() => handleDelete(match.id)}
                        className="hover:bg-red-50 hover:border-red-400 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="p-4 bg-gradient-to-br from-copper-50 to-transparent rounded-lg border-2 border-copper/20">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-4xl">{match.team1.logo}</span>
                        <div className="flex-1">
                          <p className="font-bold text-lg text-gray-900">
                            {match.team1.name}
                          </p>
                          <p className="text-sm text-gray-500">Équipe 1</p>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center gap-1 text-copper mb-1">
                            <TrendingUp className="w-4 h-4" />
                            <span className="text-xs">Cote</span>
                          </div>
                          <div className="text-2xl font-bold text-copper">
                            {match.team1.odds}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-gradient-to-br from-teal-50 to-transparent rounded-lg border-2 border-teal/20">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-4xl">{match.team2.logo}</span>
                        <div className="flex-1">
                          <p className="font-bold text-lg text-gray-900">
                            {match.team2.name}
                          </p>
                          <p className="text-sm text-gray-500">Équipe 2</p>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center gap-1 text-teal mb-1">
                            <TrendingUp className="w-4 h-4" />
                            <span className="text-xs">Cote</span>
                          </div>
                          <div className="text-2xl font-bold text-teal">
                            {match.team2.odds}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
