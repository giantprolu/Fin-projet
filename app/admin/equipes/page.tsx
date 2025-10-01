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
import { Plus, CreditCard as Edit, Trash2, Users, Trophy, Shield } from 'lucide-react';

interface Team {
  id: number;
  name: string;
  logo: string;
  game: string;
  wins: number;
  losses: number;
  rating: number;
}

const initialTeams: Team[] = [
  { id: 1, name: 'Fnatic', logo: '🦊', game: 'Valorant', wins: 45, losses: 12, rating: 1850 },
  { id: 2, name: 'G2 Esports', logo: '⚔️', game: 'League of Legends', wins: 38, losses: 18, rating: 1720 },
  { id: 3, name: 'Navi', logo: '⭐', game: 'CS:GO', wins: 52, losses: 15, rating: 1920 },
  { id: 4, name: 'Team Spirit', logo: '👻', game: 'Dota 2', wins: 41, losses: 20, rating: 1680 },
  { id: 5, name: 'Sentinels', logo: '🛡️', game: 'Valorant', wins: 36, losses: 22, rating: 1590 },
  { id: 6, name: 'T1', logo: '🏆', game: 'League of Legends', wins: 48, losses: 10, rating: 1980 },
];

export default function AdminEquipesPage() {
  const [teams, setTeams] = useState<Team[]>(initialTeams);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    logo: '',
    game: '',
    wins: 0,
    losses: 0,
    rating: 1500,
  });

  const handleCreate = () => {
    const newTeam: Team = {
      id: Math.max(...teams.map((t) => t.id)) + 1,
      ...formData,
    };
    setTeams([...teams, newTeam]);
    setIsCreateOpen(false);
    setFormData({ name: '', logo: '', game: '', wins: 0, losses: 0, rating: 1500 });
  };

  const handleEdit = (team: Team) => {
    setEditingTeam(team);
    setFormData({
      name: team.name,
      logo: team.logo,
      game: team.game,
      wins: team.wins,
      losses: team.losses,
      rating: team.rating,
    });
  };

  const handleUpdate = () => {
    if (editingTeam) {
      setTeams(
        teams.map((team) =>
          team.id === editingTeam.id ? { ...editingTeam, ...formData } : team
        )
      );
      setEditingTeam(null);
      setFormData({ name: '', logo: '', game: '', wins: 0, losses: 0, rating: 1500 });
    }
  };

  const handleDelete = (id: number) => {
    setTeams(teams.filter((team) => team.id !== id));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-teal-50 py-12 px-4">
      <div className="container mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8 flex items-center justify-between"
        >
          <div>
            <h1 className="text-5xl font-bold mb-2">
              <span className="bg-gradient-to-r from-teal to-copper bg-clip-text text-transparent">
                Gestion des Équipes
              </span>
            </h1>
            <p className="text-xl text-gray-600">
              Créez, modifiez et gérez les équipes esports
            </p>
          </div>

          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button
                size="lg"
                className="bg-gradient-to-r from-copper to-copper-600 hover:from-copper-600 hover:to-copper-700 text-white font-semibold"
              >
                <Plus className="mr-2 w-5 h-5" />
                Créer une Équipe
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Créer une nouvelle équipe</DialogTitle>
                <DialogDescription>
                  Remplissez les informations de la nouvelle équipe
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Label htmlFor="name">Nom de l&apos;équipe</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Fnatic"
                  />
                </div>
                <div>
                  <Label htmlFor="logo">Logo (emoji)</Label>
                  <Input
                    id="logo"
                    value={formData.logo}
                    onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                    placeholder="Ex: 🦊"
                  />
                </div>
                <div>
                  <Label htmlFor="game">Jeu</Label>
                  <Input
                    id="game"
                    value={formData.game}
                    onChange={(e) => setFormData({ ...formData, game: e.target.value })}
                    placeholder="Ex: Valorant"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="wins">Victoires</Label>
                    <Input
                      id="wins"
                      type="number"
                      value={formData.wins}
                      onChange={(e) =>
                        setFormData({ ...formData, wins: parseInt(e.target.value) || 0 })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="losses">Défaites</Label>
                    <Input
                      id="losses"
                      type="number"
                      value={formData.losses}
                      onChange={(e) =>
                        setFormData({ ...formData, losses: parseInt(e.target.value) || 0 })
                      }
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="rating">Rating</Label>
                  <Input
                    id="rating"
                    type="number"
                    value={formData.rating}
                    onChange={(e) =>
                      setFormData({ ...formData, rating: parseInt(e.target.value) || 1500 })
                    }
                  />
                </div>
                <Button
                  onClick={handleCreate}
                  className="w-full bg-copper hover:bg-copper-600 text-white"
                >
                  Créer l&apos;équipe
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {teams.map((team, index) => (
              <motion.div
                key={team.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="p-6 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 border-transparent hover:border-teal/30">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-5xl">{team.logo}</span>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{team.name}</h3>
                        <Badge className="bg-teal/10 text-teal mt-1">{team.game}</Badge>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Dialog
                        open={editingTeam?.id === team.id}
                        onOpenChange={(open) => !open && setEditingTeam(null)}
                      >
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(team)}
                            className="hover:bg-copper/10 hover:border-copper"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Modifier l&apos;équipe</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 mt-4">
                            <div>
                              <Label htmlFor="edit-name">Nom</Label>
                              <Input
                                id="edit-name"
                                value={formData.name}
                                onChange={(e) =>
                                  setFormData({ ...formData, name: e.target.value })
                                }
                              />
                            </div>
                            <div>
                              <Label htmlFor="edit-logo">Logo</Label>
                              <Input
                                id="edit-logo"
                                value={formData.logo}
                                onChange={(e) =>
                                  setFormData({ ...formData, logo: e.target.value })
                                }
                              />
                            </div>
                            <div>
                              <Label htmlFor="edit-game">Jeu</Label>
                              <Input
                                id="edit-game"
                                value={formData.game}
                                onChange={(e) =>
                                  setFormData({ ...formData, game: e.target.value })
                                }
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="edit-wins">Victoires</Label>
                                <Input
                                  id="edit-wins"
                                  type="number"
                                  value={formData.wins}
                                  onChange={(e) =>
                                    setFormData({
                                      ...formData,
                                      wins: parseInt(e.target.value) || 0,
                                    })
                                  }
                                />
                              </div>
                              <div>
                                <Label htmlFor="edit-losses">Défaites</Label>
                                <Input
                                  id="edit-losses"
                                  type="number"
                                  value={formData.losses}
                                  onChange={(e) =>
                                    setFormData({
                                      ...formData,
                                      losses: parseInt(e.target.value) || 0,
                                    })
                                  }
                                />
                              </div>
                            </div>
                            <div>
                              <Label htmlFor="edit-rating">Rating</Label>
                              <Input
                                id="edit-rating"
                                type="number"
                                value={formData.rating}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    rating: parseInt(e.target.value) || 1500,
                                  })
                                }
                              />
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
                        onClick={() => handleDelete(team.id)}
                        className="hover:bg-red-50 hover:border-red-400 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Trophy className="w-4 h-4" />
                        <span className="text-sm">Victoires</span>
                      </div>
                      <span className="font-bold text-green-600">{team.wins}</span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Users className="w-4 h-4" />
                        <span className="text-sm">Défaites</span>
                      </div>
                      <span className="font-bold text-red-600">{team.losses}</span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-copper/10 to-teal/10 rounded-lg">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Shield className="w-4 h-4" />
                        <span className="text-sm">Rating</span>
                      </div>
                      <span className="font-bold text-copper">{team.rating}</span>
                    </div>

                    <div className="pt-3 border-t">
                      <div className="text-sm text-gray-500">
                        Winrate:{' '}
                        <span className="font-bold text-gray-900">
                          {((team.wins / (team.wins + team.losses)) * 100).toFixed(1)}%
                        </span>
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
