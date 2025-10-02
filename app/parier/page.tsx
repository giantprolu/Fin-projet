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
} from '@/components/ui/dialog';
import { Trophy, TrendingUp, CircleCheck as CheckCircle2, Sparkles, Wallet } from 'lucide-react';
import { useUser } from '@clerk/nextjs';

const availableMatches = [
  {
    id: 1,
    game: 'Valorant',
    team1: { name: 'Fnatic', logo: '🦊', odds: 1.85 },
    team2: { name: 'Loud', logo: '🔊', odds: 2.10 },
    tournament: 'VCT Masters',
  },
  {
    id: 2,
    game: 'League of Legends',
    team1: { name: 'G2 Esports', logo: '⚔️', odds: 1.65 },
    team2: { name: 'Fnatic', logo: '🦊', odds: 2.30 },
    tournament: 'LEC Spring',
  },
  {
    id: 3,
    game: 'CS:GO',
    team1: { name: 'Navi', logo: '⭐', odds: 1.90 },
    team2: { name: 'FaZe Clan', logo: '💀', odds: 1.95 },
    tournament: 'IEM Katowice',
  },
];

export default function ParierPage() {
  const { isSignedIn, user } = useUser();
  const [selectedMatch, setSelectedMatch] = useState<number | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<'team1' | 'team2' | null>(null);
  const [betAmount, setBetAmount] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [userBalance] = useState(1000); // Solde simulé, à remplacer par des vraies données

  const handlePlaceBet = () => {
    if (selectedMatch !== null && selectedTeam && betAmount) {
      setShowConfirmation(true);
      setTimeout(() => {
        setShowConfirmation(false);
        setSelectedMatch(null);
        setSelectedTeam(null);
        setBetAmount('');
      }, 3000);
    }
  };

  const selectedMatchData = availableMatches.find((m) => m.id === selectedMatch);
  const potentialWin = selectedMatchData && selectedTeam && betAmount
    ? (parseFloat(betAmount) * selectedMatchData[selectedTeam].odds).toFixed(2)
    : '0.00';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-teal-50 py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-5xl md:text-6xl font-bold mb-4">
                <span className="bg-gradient-to-r from-teal to-copper bg-clip-text text-transparent">
                  Placer un Pari
                </span>
              </h1>
              <p className="text-xl text-gray-600">
                Sélectionnez votre match et montant pour gagner gros
              </p>
            </div>
            
            {isSignedIn && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="p-4 bg-gradient-to-r from-copper/10 to-teal/10 border-copper/20">
                  <div className="flex items-center gap-3">
                    <Wallet className="w-5 h-5 text-copper" />
                    <div>
                      <p className="text-sm text-gray-600">Bienvenue {user?.firstName}</p>
                      <p className="font-bold text-lg text-gray-900">
                        {userBalance.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Trophy className="w-6 h-6 text-copper" />
                Matchs Disponibles
              </h2>

              <div className="space-y-4">
                {availableMatches.map((match, index) => (
                  <motion.div
                    key={match.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card
                      className={`p-6 cursor-pointer transition-all duration-300 ${
                        selectedMatch === match.id
                          ? 'border-2 border-copper shadow-xl bg-copper-50'
                          : 'hover:shadow-lg hover:border-copper/30 border-2 border-transparent'
                      }`}
                      onClick={() => setSelectedMatch(match.id)}
                    >
                      <div className="flex justify-between items-center mb-4">
                        <div>
                          <Badge className="bg-teal text-white mb-2">
                            {match.game}
                          </Badge>
                          <p className="text-sm text-gray-500">{match.tournament}</p>
                        </div>
                        {selectedMatch === match.id && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                          >
                            <CheckCircle2 className="w-8 h-8 text-copper" />
                          </motion.div>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedMatch(match.id);
                            setSelectedTeam('team1');
                          }}
                          className={`p-4 rounded-lg border-2 transition-all ${
                            selectedMatch === match.id && selectedTeam === 'team1'
                              ? 'border-copper bg-copper text-white'
                              : 'border-gray-200 bg-gray-50 hover:border-copper/50'
                          }`}
                        >
                          <div className="text-center">
                            <div className="text-4xl mb-2">{match.team1.logo}</div>
                            <p className="font-bold mb-1">{match.team1.name}</p>
                            <div className="text-2xl font-bold">{match.team1.odds}</div>
                          </div>
                        </motion.div>

                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedMatch(match.id);
                            setSelectedTeam('team2');
                          }}
                          className={`p-4 rounded-lg border-2 transition-all ${
                            selectedMatch === match.id && selectedTeam === 'team2'
                              ? 'border-teal bg-teal text-white'
                              : 'border-gray-200 bg-gray-50 hover:border-teal/50'
                          }`}
                        >
                          <div className="text-center">
                            <div className="text-4xl mb-2">{match.team2.logo}</div>
                            <p className="font-bold mb-1">{match.team2.name}</p>
                            <div className="text-2xl font-bold">{match.team2.odds}</div>
                          </div>
                        </motion.div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="sticky top-24"
            >
              <Card className="p-6 bg-gradient-to-br from-white to-gray-50 border-2 border-copper/20">
                <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-copper" />
                  Votre Pari
                </h3>

                <AnimatePresence mode="wait">
                  {selectedMatch && selectedTeam ? (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="space-y-6"
                    >
                      <div className="p-4 bg-white rounded-lg border-2 border-copper/30">
                        <p className="text-sm text-gray-500 mb-2">Match sélectionné</p>
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-3xl">
                            {selectedMatchData?.[selectedTeam].logo}
                          </span>
                          <div>
                            <p className="font-bold text-lg">
                              {selectedMatchData?.[selectedTeam].name}
                            </p>
                            <p className="text-sm text-gray-500">
                              {selectedMatchData?.tournament}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t">
                          <span className="text-sm text-gray-600">Cote</span>
                          <span className="text-xl font-bold text-copper">
                            {selectedMatchData?.[selectedTeam].odds}
                          </span>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="amount" className="text-lg mb-2 block">
                          Montant du pari (€)
                        </Label>
                        <Input
                          id="amount"
                          type="number"
                          placeholder="50"
                          value={betAmount}
                          onChange={(e) => setBetAmount(e.target.value)}
                          className="text-xl py-6 border-2 focus:border-copper"
                        />
                        <div className="flex gap-2 mt-3">
                          {[10, 25, 50, 100].map((amount) => (
                            <Button
                              key={amount}
                              variant="outline"
                              size="sm"
                              onClick={() => setBetAmount(amount.toString())}
                              className="flex-1 hover:bg-copper/10 hover:border-copper"
                            >
                              {amount}€
                            </Button>
                          ))}
                        </div>
                      </div>

                      {betAmount && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="p-4 bg-gradient-to-r from-copper/10 to-teal/10 rounded-lg border-2 border-copper/30"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-600">Mise</span>
                            <span className="font-bold">{betAmount}€</span>
                          </div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-600">Cote</span>
                            <span className="font-bold">
                              {selectedMatchData?.[selectedTeam].odds}
                            </span>
                          </div>
                          <div className="border-t-2 border-copper/30 pt-2 mt-2">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-lg">Gain potentiel</span>
                              <span className="text-2xl font-bold text-copper">
                                {potentialWin}€
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      )}

                      <Button
                        onClick={handlePlaceBet}
                        disabled={!betAmount || parseFloat(betAmount) <= 0}
                        className="w-full bg-gradient-to-r from-copper to-copper-600 hover:from-copper-600 hover:to-copper-700 text-white font-bold py-6 text-lg rounded-lg disabled:opacity-50 disabled:cursor-not-allowed group"
                      >
                        Confirmer le Pari
                        <TrendingUp className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-center py-12 text-gray-400"
                    >
                      <Trophy className="w-16 h-16 mx-auto mb-4 opacity-30" />
                      <p>Sélectionnez un match et une équipe pour commencer</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>
          </div>
        </div>

        <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
          <DialogContent className="sm:max-w-md">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center"
            >
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, -10, 0],
                }}
                transition={{ duration: 0.6 }}
                className="w-20 h-20 bg-gradient-to-br from-copper to-teal rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <CheckCircle2 className="w-12 h-12 text-white" />
              </motion.div>
              <DialogHeader>
                <DialogTitle className="text-3xl mb-2">Pari Confirmé !</DialogTitle>
                <DialogDescription className="text-lg">
                  Votre pari a été placé avec succès.
                  <br />
                  Bonne chance !
                </DialogDescription>
              </DialogHeader>
              <div className="mt-6 p-4 bg-copper/10 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Gain potentiel</p>
                <p className="text-3xl font-bold text-copper">{potentialWin}€</p>
              </div>
            </motion.div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
