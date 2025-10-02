'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import Image from 'next/image';
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
import { Plus, CreditCard as Edit, Trash2, Users, Trophy, Shield, Flag, Calendar, DollarSign } from 'lucide-react';
import { type Team } from '@/lib/database';

export default function AdminEquipesPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    tag: '',
    country: 'FR',
    logo_url: '',
    founded_year: new Date().getFullYear(),
    total_earnings: 0
  });

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      const response = await fetch('/api/teams');
      const data: Team[] = await response.json();
      setTeams(data);
    } catch (error) {
      console.error('Erreur lors du chargement des équipes:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Vérifier que le nom de l'équipe est renseigné
    if (!formData.name.trim()) {
      alert('Veuillez renseigner le nom de l\'équipe avant d\'uploader un logo');
      return;
    }

    // Vérifier la taille du fichier (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Le fichier est trop volumineux (max 5MB)');
      return;
    }

    // Créer un aperçu de l'image
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload du fichier
    setUploading(true);
    try {
      const uploadFormData = new FormData();
      uploadFormData.append('image', file);
      uploadFormData.append('teamName', formData.name);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData,
      });

      const result = await response.json();

      if (result.success) {
        setFormData(prev => ({ ...prev, logo_url: result.imagePath }));
      } else {
        alert('Erreur lors de l\'upload: ' + result.error);
      }
    } catch (error) {
      console.error('Erreur upload:', error);
      alert('Erreur lors de l\'upload de l\'image');
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      tag: '',
      country: 'FR',
      logo_url: '',
      founded_year: new Date().getFullYear(),
      total_earnings: 0
    });
    setImagePreview(null);
  };

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

  const handleCreate = async () => {
    try {
      const response = await fetch('/api/teams', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await fetchTeams(); // Recharger la liste
        setIsCreateOpen(false);
        resetForm();
      } else {
        const error = await response.json();
        alert('Erreur: ' + error.error);
      }
    } catch (error) {
      console.error('Erreur lors de la création:', error);
      alert('Erreur lors de la création de l\'équipe');
    }
  };

  const handleEdit = (team: Team) => {
    setEditingTeam(team);
    setFormData({
      name: team.name,
      tag: team.tag,
      country: team.country,
      logo_url: team.logo_url || '',
      founded_year: team.founded_year || new Date().getFullYear(),
      total_earnings: team.total_earnings,
    });
    setImagePreview(team.logo_url || null);
  };

  const handleUpdate = async () => {
    if (editingTeam) {
      try {
        const response = await fetch(`/api/teams/${editingTeam.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        if (response.ok) {
          await fetchTeams(); // Recharger la liste
          setEditingTeam(null);
          resetForm();
        } else {
          const error = await response.json();
          alert('Erreur: ' + error.error);
        }
      } catch (error) {
        console.error('Erreur lors de la mise à jour:', error);
        alert('Erreur lors de la mise à jour de l\'équipe');
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette équipe ?')) {
      try {
        const response = await fetch(`/api/teams/${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          await fetchTeams(); // Recharger la liste
        } else {
          const error = await response.json();
          alert('Erreur: ' + error.error);
        }
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        alert('Erreur lors de la suppression de l\'équipe');
      }
    }
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
                    placeholder="Ex: Team Vitality"
                  />
                </div>
                <div>
                  <Label htmlFor="tag">Tag de l&apos;équipe</Label>
                  <Input
                    id="tag"
                    value={formData.tag}
                    onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                    placeholder="Ex: VIT"
                  />
                </div>
                <div>
                  <Label htmlFor="country">Pays</Label>
                  <Input
                    id="country"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    placeholder="Ex: FR"
                  />
                </div>
                <div>
                  <Label htmlFor="logo">Logo de l&apos;équipe</Label>
                  <div className="space-y-3">
                    <Input
                      id="logo"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploading}
                      className="cursor-pointer"
                    />
                    {uploading && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <div className="w-4 h-4 border-2 border-copper border-t-transparent rounded-full animate-spin" />
                        Upload en cours...
                      </div>
                    )}
                    {(imagePreview || formData.logo_url) && (
                      <div className="flex items-center gap-3 p-3 border rounded-lg bg-gray-50">
                        <Image
                          src={imagePreview || formData.logo_url}
                          alt="Aperçu du logo"
                          width={48}
                          height={48}
                          className="object-contain rounded border"
                        />
                        <span className="text-sm text-gray-600">Logo sélectionné</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="founded_year">Année de fondation</Label>
                    <Input
                      id="founded_year"
                      type="number"
                      value={formData.founded_year}
                      onChange={(e) =>
                        setFormData({ ...formData, founded_year: parseInt(e.target.value) || new Date().getFullYear() })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="total_earnings">Gains totaux (€)</Label>
                    <Input
                      id="total_earnings"
                      type="number"
                      value={formData.total_earnings}
                      onChange={(e) =>
                        setFormData({ ...formData, total_earnings: parseInt(e.target.value) || 0 })
                      }
                    />
                  </div>
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
                      <div className="w-14 h-14 relative">
                        <Image 
                          src={getTeamLogo(team.tag, team.logo_url)} 
                          alt={team.name}
                          width={56}
                          height={56}
                          className="object-contain rounded-lg"
                        />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{team.name}</h3>
                        <Badge className="bg-teal/10 text-teal mt-1">{team.tag}</Badge>
                        <p className="text-sm text-gray-500">{team.country}</p>
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
                              <Label htmlFor="edit-tag">Tag</Label>
                              <Input
                                id="edit-tag"
                                value={formData.tag}
                                onChange={(e) =>
                                  setFormData({ ...formData, tag: e.target.value })
                                }
                              />
                            </div>
                            <div>
                              <Label htmlFor="edit-country">Pays</Label>
                              <Input
                                id="edit-country"
                                value={formData.country}
                                onChange={(e) =>
                                  setFormData({ ...formData, country: e.target.value })
                                }
                              />
                            </div>
                            <div>
                              <Label htmlFor="edit-logo">Logo de l&apos;équipe</Label>
                              <div className="space-y-3">
                                <Input
                                  id="edit-logo"
                                  type="file"
                                  accept="image/*"
                                  onChange={handleImageUpload}
                                  disabled={uploading}
                                  className="cursor-pointer"
                                />
                                {uploading && (
                                  <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <div className="w-4 h-4 border-2 border-copper border-t-transparent rounded-full animate-spin" />
                                    Upload en cours...
                                  </div>
                                )}
                                {(imagePreview || formData.logo_url) && (
                                  <div className="flex items-center gap-3 p-3 border rounded-lg bg-gray-50">
                                    <Image
                                      src={imagePreview || formData.logo_url}
                                      alt="Aperçu du logo"
                                      width={48}
                                      height={48}
                                      className="object-contain rounded border"
                                    />
                                    <span className="text-sm text-gray-600">Logo actuel</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="edit-founded_year">Année de fondation</Label>
                                <Input
                                  id="edit-founded_year"
                                  type="number"
                                  value={formData.founded_year}
                                  onChange={(e) =>
                                    setFormData({
                                      ...formData,
                                      founded_year: parseInt(e.target.value) || new Date().getFullYear(),
                                    })
                                  }
                                />
                              </div>
                              <div>
                                <Label htmlFor="edit-total_earnings">Gains totaux (€)</Label>
                                <Input
                                  id="edit-total_earnings"
                                  type="number"
                                  value={formData.total_earnings}
                                  onChange={(e) =>
                                    setFormData({
                                      ...formData,
                                      total_earnings: parseInt(e.target.value) || 0,
                                    })
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
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm">Fondée en</span>
                      </div>
                      <span className="font-bold text-gray-900">{team.founded_year || 'N/A'}</span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Flag className="w-4 h-4" />
                        <span className="text-sm">Pays</span>
                      </div>
                      <span className="font-bold text-gray-900">{team.country}</span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-copper/10 to-teal/10 rounded-lg">
                      <div className="flex items-center gap-2 text-gray-600">
                        <DollarSign className="w-4 h-4" />
                        <span className="text-sm">Gains totaux</span>
                      </div>
                      <span className="font-bold text-copper">{formatCurrency(team.total_earnings)}</span>
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
