'use client';

import { useState, useEffect } from 'react';
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
import { useUserBalance } from '@/hooks/use-user-balance';
import Image from 'next/image';
import '../styles/parier.css';

interface Match {
  id: number;
  game: string;
  tournament: string;
  team1: { name: string; tag: string; logo?: string; odds: number };
  team2: { name: string; tag: string; logo?: string; odds: number };
  status: string;
  match_date: string;
  match_time: string;
}

export default function ParierPage() {
  const { isSignedIn } = useUser();
  const { balance, placeBet, loading: userLoading } = useUserBalance();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMatch, setSelectedMatch] = useState<number | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<'team1' | 'team2' | null>(null);
  const [betAmount, setBetAmount] = useState('');

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const response = await fetch('/api/matches');
        const data = await response.json();
        
        // Filtrer seulement les matchs programmés (pas finis)
        const availableMatches = data.filter((match: any) => 
          match.status === 'scheduled' || match.status === 'live'
        );
        
        setMatches(availableMatches);
      } catch (error) {
        console.error('Erreur lors du chargement des matchs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, []);

  const renderTeamLogo = (logo: string | undefined, teamName: string) => {
    if (logo && logo.startsWith('/')) {
      return (
        <Image
          src={logo}
          alt={teamName}
          width={40}
          height={40}
          className="rounded-full object-cover"
        />
      );
    }
    // Fallback avec emoji ou initiales
    return (
      <div className="w-10 h-10 bg-gradient-to-br from-copper to-teal rounded-full flex items-center justify-center text-white font-bold">
        {teamName.substring(0, 2).toUpperCase()}
      </div>
    );
  };
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [processingBet, setProcessingBet] = useState(false);

  const handlePlaceBet = async () => {
    if (selectedMatch !== null && selectedTeam && betAmount) {
      setProcessingBet(true);
      
      try {
        const selectedMatchData = matches.find((m) => m.id === selectedMatch);
        if (!selectedMatchData) return;

        await placeBet(
          selectedMatch,
          selectedTeam === 'team1' ? 1 : 2, // ID fictif pour la démo
          parseFloat(betAmount),
          selectedMatchData[selectedTeam].odds
        );

        setShowConfirmation(true);
        
        setTimeout(() => {
          setShowConfirmation(false);
          setSelectedMatch(null);
          setSelectedTeam(null);
          setBetAmount('');
        }, 3000);
      } catch (error) {
        alert(error instanceof Error ? error.message : 'Erreur lors du placement du pari');
      } finally {
        setProcessingBet(false);
      }
    }
  };

  const selectedMatchData = matches.find((m) => m.id === selectedMatch);
  const potentialWin = selectedMatchData && selectedTeam && betAmount
    ? (parseFloat(betAmount) * selectedMatchData[selectedTeam].odds).toFixed(2)
    : '0.00';

  return (
    <div className="parier-page">
      <div className="parier-container">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="parier-header"
        >
          <h1 className="parier-title">
            Placer un Pari
          </h1>
          <p className="parier-subtitle">
            Sélectionnez votre match et montant pour gagner gros
          </p>
        </motion.div>

        {/* Wallet Info */}
        {isSignedIn && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="parier-wallet"
          >
            <Card className="parier-balance">
              <div className="flex items-center gap-3">
                <Wallet className="w-6 h-6 text-copper" />
                <div>
                  <p className="text-sm text-slate-400">Solde disponible</p>
                  <p className="text-2xl font-bold text-white">{balance.toFixed(2)}€</p>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Matches Section */}
        <div className="parier-grid">
          <div className="parier-matches">
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
                {loading ? (
                  <div className="parier-loading">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-12 h-12 border-4 border-copper border-t-transparent rounded-full"
                    />
                  </div>
                ) : matches.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-slate-400 text-lg">Aucun match disponible pour le moment</p>
                  </div>
                ) : (
                  matches.map((match, index) => (
                  <motion.div
                    key={match.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card
                      className={`parier-match-card ${
                        selectedMatch === match.id
                          ? 'parier-match-card--selected'
                          : ''
                      }`}
                      onClick={() => setSelectedMatch(match.id)}
                    >
                      <div className="parier-match-header">
                        <div>
                          <Badge className="parier-match-game">
                            {match.game}
                          </Badge>
                          <p className="parier-match-tournament">{match.tournament}</p>
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

                      <div className="parier-match-teams">
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedMatch(match.id);
                            setSelectedTeam('team1');
                          }}
                          className={`parier-team-option ${
                            selectedMatch === match.id && selectedTeam === 'team1'
                              ? 'parier-team-option--selected'
                              : ''
                          }`}
                        >
                          <div className="text-center">
                            <div className="parier-team-logo">{renderTeamLogo(match.team1.logo, match.team1.name)}</div>
                            <p className="parier-team-name">{match.team1.name}</p>
                            <div className="parier-team-odds">{match.team1.odds}</div>
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
                          className={`parier-team-option ${
                            selectedMatch === match.id && selectedTeam === 'team2'
                              ? 'parier-team-option--selected'
                              : ''
                          }`}
                        >
                          <div className="text-center">
                            <div className="parier-team-logo">{renderTeamLogo(match.team2.logo, match.team2.name)}</div>
                            <p className="parier-team-name">{match.team2.name}</p>
                            <div className="parier-team-odds">{match.team2.odds}</div>
                          </div>
                        </motion.div>
                      </div>
                    </Card>
                  </motion.div>
                ))
                )}
              </div>
            </motion.div>
          </div>

          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="parier-bet-panel"
            >
              <Card className="parier-bet-panel--active">
                <h3 className="parier-bet-title">
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
                      <div className="p-4 bg-slate-800/80 border border-slate-600 rounded-lg">
                        <p className="text-sm text-slate-300 mb-2">Match sélectionné</p>
                        <div className="flex items-center gap-3 mb-2">
                          <div className="flex-shrink-0">
                            {selectedMatchData && selectedTeam && renderTeamLogo(
                              selectedMatchData[selectedTeam].logo, 
                              selectedMatchData[selectedTeam].name
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-lg">
                              {selectedMatchData?.[selectedTeam].name}
                            </p>
                            <p className="text-sm text-slate-300">
                              {selectedMatchData?.tournament}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t">
                          <span className="text-sm text-slate-300">Cote</span>
                          <span className="text-xl font-bold text-copper">
                            {selectedMatchData?.[selectedTeam].odds}
                          </span>
                        </div>
                      </div>

                      <div className="parier-bet-form">
                        <Label htmlFor="amount" className="text-lg mb-2 block">
                          Montant du pari (€)
                        </Label>
                        <Input
                          id="amount"
                          type="number"
                          placeholder="50"
                          value={betAmount}
                          onChange={(e) => setBetAmount(e.target.value)}
                          className="parier-bet-input"
                        />
                        <div className="flex gap-2 mt-3">
                          {[10, 25, 50, 100].map((amount) => (
                            <Button
                              key={amount}
                              variant="outline"
                              size="sm"
                              onClick={() => setBetAmount(amount.toString())}
                              disabled={amount > balance}
                              className="flex-1 hover:bg-copper/10 hover:border-copper disabled:opacity-30"
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
                          className="parier-bet-potential"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-slate-300">Mise</span>
                            <span className="font-bold">{betAmount}€</span>
                          </div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-slate-300">Cote</span>
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
                        disabled={
                          !betAmount || 
                          parseFloat(betAmount) <= 0 || 
                          parseFloat(betAmount) > balance ||
                          processingBet
                        }
                        className="parier-place-bet-btn"
                      >
                        {processingBet ? 'Placement en cours...' : 'Confirmer le Pari'}
                        <TrendingUp className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </Button>

                      {betAmount && parseFloat(betAmount) > balance && (
                        <p className="text-red-400 text-sm mt-2 text-center">
                          Solde insuffisant pour ce pari
                        </p>
                      )}
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-center py-12 text-slate-400"
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
          <DialogContent className="parier-confirmation">
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
                className="parier-confirmation-icon"
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
                <p className="text-sm text-slate-300 mb-1">Gain potentiel</p>
                <p className="text-3xl font-bold text-copper">{potentialWin}€</p>
              </div>
            </motion.div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
