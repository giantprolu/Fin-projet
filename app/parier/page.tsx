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
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [processingBet, setProcessingBet] = useState(false);
  const [balanceChanged, setBalanceChanged] = useState(false);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const response = await fetch('/api/matches');
        const data = await response.json();
        
        console.log('📥 Données brutes reçues:', data);
        
        // Transformer les données pour correspondre à l'interface Match
        const transformedMatches = data
          .filter((match: any) => match.status === 'scheduled' || match.status === 'live')
          .map((match: any) => ({
            id: match.id,
            game: match.game,
            tournament: match.tournament,
            team1: {
              name: match.team1?.name || 'Team 1',
              tag: match.team1?.tag || '',
              logo: match.team1?.logo_url || '/assets/Team_Vitality_Logo_2018.png',
              odds: match.team1_odds || 1.5
            },
            team2: {
              name: match.team2?.name || 'Team 2',
              tag: match.team2?.tag || '',
              logo: match.team2?.logo_url || '/assets/Team_Vitality_Logo_2018.png',
              odds: match.team2_odds || 1.5
            },
            status: match.status,
            match_date: match.match_date,
            match_time: match.match_time
          }));
        
        console.log('✅ Matchs transformés:', transformedMatches);
        setMatches(transformedMatches);
      } catch (error) {
        console.error('Erreur lors du chargement des matchs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, []);

  // Handler pour sélectionner une équipe avec feedback immédiat
  const handleTeamSelect = (matchId: number, team: 'team1' | 'team2') => {
    setSelectedMatch(matchId);
    setSelectedTeam(team);
    // Reset le montant si on change d'équipe
    if (selectedMatch === matchId && selectedTeam !== team) {
      setBetAmount('');
    }
  };

  // Handler pour les montants rapides
  const handleQuickAmount = (amount: number) => {
    if (amount <= balance) {
      setBetAmount(amount.toString());
    }
  };

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
          selectedMatchData[selectedTeam].odds || 1.0
        );

        // Animation du solde qui change
        setBalanceChanged(true);
        setTimeout(() => setBalanceChanged(false), 600);

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
  const potentialWin = selectedMatchData && selectedTeam && betAmount && selectedMatchData[selectedTeam].odds
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
              <div className="parier-balance-content">
                <Wallet className="parier-balance-icon" />
                <div className="parier-balance-info">
                  <p className="parier-balance-label">Solde disponible</p>
                  <motion.p 
                    className="parier-balance-amount"
                    animate={balanceChanged ? { 
                      scale: [1, 1.15, 1],
                      color: ['#14B8A6', '#C79081', '#14B8A6']
                    } : {}}
                    transition={{ duration: 0.6 }}
                  >
                    {balance.toFixed(2)}€
                  </motion.p>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Matches Section */}
        <div className="parier-layout">
          <div className="parier-matches-section">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="parier-section-header">
                <Trophy className="parier-section-icon" />
                <h2 className="parier-section-title">Matchs Disponibles</h2>
              </div>
              
              {!selectedMatch && matches.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="parier-help-message"
                >
                  <p>👆 Cliquez sur une équipe pour sélectionner votre pari</p>
                </motion.div>
              )}

              <div className="parier-matches-list">
                {loading ? (
                  <div className="parier-loading">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="parier-loading-spinner"
                    />
                  </div>
                ) : matches.length === 0 ? (
                  <div className="parier-no-matches">
                    <p>Aucun match disponible pour le moment</p>
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
                    >
                      <div className="parier-match-header">
                        <div className="parier-match-info">
                          <Badge className="parier-match-game">
                            {match.game}
                          </Badge>
                          <p className="parier-match-tournament">{match.tournament}</p>
                        </div>
                        {selectedMatch === match.id && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="parier-match-selected-icon"
                          >
                            <CheckCircle2 />
                          </motion.div>
                        )}
                      </div>

                      <div className="parier-match-teams">
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleTeamSelect(match.id, 'team1')}
                          className={`parier-team-option ${
                            selectedMatch === match.id && selectedTeam === 'team1'
                              ? 'parier-team-option--selected'
                              : ''
                          }`}
                        >
                          <div className="parier-team-content">
                            {match.team1.logo && match.team1.logo.startsWith('/') ? (
                              <Image
                                src={match.team1.logo}
                                alt={match.team1.name}
                                width={56}
                                height={56}
                                className="parier-team-logo"
                              />
                            ) : (
                              <div className="parier-team-logo parier-team-logo-fallback">
                                {match.team1.name.substring(0, 2).toUpperCase()}
                              </div>
                            )}
                            <p className="parier-team-name">{match.team1.name}</p>
                            <div className="parier-team-odds">{match.team1.odds ? match.team1.odds.toFixed(2) : '1.00'}</div>
                          </div>
                        </motion.div>

                        <div className="parier-vs">VS</div>

                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleTeamSelect(match.id, 'team2')}
                          className={`parier-team-option ${
                            selectedMatch === match.id && selectedTeam === 'team2'
                              ? 'parier-team-option--selected'
                              : ''
                          }`}
                        >
                          <div className="parier-team-content">
                            {match.team2.logo && match.team2.logo.startsWith('/') ? (
                              <Image
                                src={match.team2.logo}
                                alt={match.team2.name}
                                width={56}
                                height={56}
                                className="parier-team-logo"
                              />
                            ) : (
                              <div className="parier-team-logo parier-team-logo-fallback">
                                {match.team2.name.substring(0, 2).toUpperCase()}
                              </div>
                            )}
                            <p className="parier-team-name">{match.team2.name}</p>
                            <div className="parier-team-odds">{match.team2.odds ? match.team2.odds.toFixed(2) : '1.00'}</div>
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

          <div className="parier-bet-section">
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="parier-bet-panel"
            >
              <Card className="parier-bet-panel--active">
                <div className="parier-bet-header">
                  <Sparkles className="parier-bet-icon" />
                  <h3 className="parier-bet-title-text">Votre Pari</h3>
                </div>

                <AnimatePresence mode="wait">
                  {selectedMatch && selectedTeam ? (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="space-y-6"
                    >
                      <div className="parier-selected-match">
                        <p className="parier-selected-label">Match sélectionné</p>
                        <div className="parier-selected-content">
                          <div className="parier-selected-logo-wrapper">
                            {selectedMatchData && selectedTeam && selectedMatchData[selectedTeam] && (
                              selectedMatchData[selectedTeam].logo && selectedMatchData[selectedTeam].logo?.startsWith('/') ? (
                                <Image
                                  src={selectedMatchData[selectedTeam].logo!}
                                  alt={selectedMatchData[selectedTeam].name}
                                  width={48}
                                  height={48}
                                  className="rounded-lg object-contain"
                                />
                              ) : (
                                <div className="parier-selected-logo-fallback">
                                  {selectedMatchData[selectedTeam].name.substring(0, 2).toUpperCase()}
                                </div>
                              )
                            )}
                          </div>
                          <div className="parier-selected-info">
                            <p className="parier-selected-team-name">
                              {selectedMatchData?.[selectedTeam]?.name}
                            </p>
                            <p className="parier-selected-match-info">
                              {selectedMatchData?.game} • {selectedMatchData?.tournament}
                            </p>
                          </div>
                        </div>
                        <div className="parier-selected-odds">
                          <span className="parier-selected-odds-label">Cote</span>
                          <span className="parier-selected-odds-value">
                            {selectedMatchData?.[selectedTeam]?.odds?.toFixed(2) || '1.00'}
                          </span>
                        </div>
                      </div>

                      <div className="parier-bet-form">
                        <Label htmlFor="amount" className="parier-bet-label">
                          Montant du pari (€)
                        </Label>
                        <motion.div
                          initial={{ scale: 1 }}
                          animate={{ scale: betAmount ? 1.02 : 1 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Input
                            id="amount"
                            type="number"
                            placeholder="Entrez votre mise..."
                            value={betAmount}
                            onChange={(e) => setBetAmount(e.target.value)}
                            max={balance}
                            min={0}
                            step="0.01"
                            className="parier-bet-input"
                          />
                        </motion.div>
                        <div className="parier-quick-amounts">
                          {[10, 25, 50, 100].map((amount) => (
                            <motion.button
                              key={amount}
                              type="button"
                              onClick={() => handleQuickAmount(amount)}
                              disabled={amount > balance}
                              whileHover={{ scale: amount <= balance ? 1.05 : 1 }}
                              whileTap={{ scale: amount <= balance ? 0.95 : 1 }}
                              className={`parier-quick-amount-btn ${
                                betAmount === amount.toString() ? 'parier-quick-amount-btn--active' : ''
                              }`}
                            >
                              {amount}€
                            </motion.button>
                          ))}
                        </div>
                        {balance > 0 && (
                          <motion.p 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-xs text-slate-400 mt-2"
                          >
                            Solde disponible: <span className="text-teal-400 font-semibold">{balance.toFixed(2)}€</span>
                          </motion.p>
                        )}
                      </div>

                      {betAmount && selectedMatchData && selectedTeam && selectedMatchData[selectedTeam] && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="parier-potential-win"
                        >
                          <div className="parier-potential-row">
                            <span className="parier-potential-label">Mise</span>
                            <span className="parier-potential-value">{parseFloat(betAmount).toFixed(2)}€</span>
                          </div>
                          <div className="parier-potential-row">
                            <span className="parier-potential-label">Cote</span>
                            <span className="parier-potential-odds">
                              {selectedMatchData[selectedTeam].odds?.toFixed(2) || '1.00'}
                            </span>
                          </div>
                          <div className="parier-potential-total">
                            <div className="parier-potential-total-row">
                              <span className="parier-potential-total-label">Gain potentiel</span>
                              <span className="parier-potential-total-value">
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
                        className="parier-place-bet-btn group"
                      >
                        {processingBet ? (
                          <>
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              className="parier-button-spinner"
                            />
                            Placement en cours...
                          </>
                        ) : (
                          <>
                            Confirmer le Pari
                            <TrendingUp className="parier-button-icon" />
                          </>
                        )}
                      </Button>

                      {betAmount && parseFloat(betAmount) > balance && (
                        <p className="parier-error-message">
                          Solde insuffisant pour ce pari
                        </p>
                      )}
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="parier-empty-state"
                    >
                      <motion.div
                        animate={{ 
                          scale: [1, 1.1, 1],
                          rotate: [0, 5, -5, 0]
                        }}
                        transition={{ duration: 3, repeat: Infinity }}
                        className="parier-empty-icon-wrapper"
                      >
                        <Trophy className="parier-empty-icon" />
                      </motion.div>
                      <h4 className="parier-empty-title">
                        Sélectionnez votre match
                      </h4>
                      <p className="parier-empty-message">
                        Choisissez un match et une équipe pour commencer à parier
                      </p>
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
              className="parier-confirmation-content"
            >
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, -10, 0],
                }}
                transition={{ duration: 0.6 }}
                className="parier-confirmation-icon"
              >
                <CheckCircle2 className="parier-confirmation-check" />
              </motion.div>
              <DialogHeader>
                <DialogTitle className="parier-confirmation-title">Pari Confirmé !</DialogTitle>
                <DialogDescription className="parier-confirmation-description">
                  Votre pari a été placé avec succès.
                  <br />
                  Bonne chance !
                </DialogDescription>
              </DialogHeader>
              <div className="parier-confirmation-win">
                <p className="parier-confirmation-win-label">Gain potentiel</p>
                <p className="parier-confirmation-win-amount">{potentialWin}€</p>
              </div>
            </motion.div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
