import { supabaseAdmin, type Team, type Match, type User, type Bet } from './supabase';

export class SupabaseService {
  
  // ==================== ÉQUIPES ====================
  
  async getTeams(): Promise<Team[]> {
    console.log('🔍 SupabaseService.getTeams() appelé');
    
    const { data, error } = await supabaseAdmin
      .from('teams')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('❌ Erreur Supabase getTeams:', error);
      return [];
    }
    
    console.log('✅ Données reçues de Supabase:', data?.length || 0, 'équipes');
    return data || [];
  }

  async getTeamById(id: string): Promise<Team | null> {
    const { data, error } = await supabaseAdmin
      .from('teams')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Erreur getTeamById:', error);
      return null;
    }
    
    return data;
  }

  async createTeam(team: Omit<Team, 'id' | 'created_at'>): Promise<Team | null> {
    const { data, error } = await supabaseAdmin
      .from('teams')
      .insert([team])
      .select()
      .single();
    
    if (error) {
      console.error('Erreur createTeam:', error);
      return null;
    }
    
    return data;
  }

  async updateTeam(id: string, team: Partial<Omit<Team, 'id' | 'created_at'>>): Promise<Team | null> {
    const { data, error } = await supabaseAdmin
      .from('teams')
      .update(team)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Erreur updateTeam:', error);
      return null;
    }
    
    return data;
  }

  async deleteTeam(id: string): Promise<boolean> {
    const { error } = await supabaseAdmin
      .from('teams')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Erreur deleteTeam:', error);
      return false;
    }
    
    return true;
  }

  async teamTagExists(tag: string, excludeId?: string): Promise<boolean> {
    let query = supabaseAdmin
      .from('teams')
      .select('id')
      .eq('tag', tag);
    
    if (excludeId) {
      query = query.neq('id', excludeId);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Erreur teamTagExists:', error);
      return false;
    }
    
    return (data?.length || 0) > 0;
  }

  // ==================== MATCHS ====================
  
  async getMatches(): Promise<any[]> {
    const { data, error } = await supabaseAdmin
      .from('matches')
      .select(`
        *,
        team1:teams!matches_team1_id_fkey(id, name, tag, logo_url),
        team2:teams!matches_team2_id_fkey(id, name, tag, logo_url)
      `)
      .order('match_date', { ascending: true });
    
    if (error) {
      console.error('Erreur getMatches:', error);
      return [];
    }
    
    return data || [];
  }

  async getMatchById(id: string): Promise<any | null> {
    const { data, error } = await supabaseAdmin
      .from('matches')
      .select(`
        *,
        team1:teams!matches_team1_id_fkey(id, name, tag, logo_url),
        team2:teams!matches_team2_id_fkey(id, name, tag, logo_url)
      `)
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Erreur getMatchById:', error);
      return null;
    }
    
    return data;
  }

  async createMatch(match: Omit<Match, 'id' | 'created_at'>): Promise<number | null> {
    const { data, error } = await supabaseAdmin
      .from('matches')
      .insert([match])
      .select('id')
      .single();
    
    if (error) {
      console.error('Erreur createMatch:', error);
      return null;
    }
    
    return data?.id || null;
  }

  async updateMatch(id: number, match: Partial<Omit<Match, 'id' | 'created_at'>>): Promise<boolean> {
    const { error } = await supabaseAdmin
      .from('matches')
      .update(match)
      .eq('id', id);
    
    if (error) {
      console.error('Erreur updateMatch:', error);
      return false;
    }
    
    return true;
  }

  async deleteMatch(id: number): Promise<boolean> {
    const { error } = await supabaseAdmin
      .from('matches')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Erreur deleteMatch:', error);
      return false;
    }
    
    return true;
  }

  // Méthodes pour l'interface admin (matches simples)
  async getSimpleMatches(): Promise<any[]> {
    const { data, error } = await supabaseAdmin
      .from('matches')
      .select(`
        *,
        team1:teams!matches_team1_id_fkey(id, name, tag, logo_url),
        team2:teams!matches_team2_id_fkey(id, name, tag, logo_url)
      `)
      .order('match_date', { ascending: true })
      .order('match_time', { ascending: true });
    
    if (error) {
      console.error('Erreur getSimpleMatches:', error);
      return [];
    }
    
    return data || [];
  }

  async createSimpleMatch(matchData: {
    game: string;
    tournament: string;
    team1_name: string;
    team2_name: string;
    team1_odds: number;
    team2_odds: number;
    date: string;
    time: string;
    status: string;
  }): Promise<number | null> {
    // Trouver les IDs des équipes par leur nom
    const { data: team1Data } = await supabaseAdmin
      .from('teams')
      .select('id')
      .eq('name', matchData.team1_name)
      .single();
    
    const { data: team2Data } = await supabaseAdmin
      .from('teams')
      .select('id')
      .eq('name', matchData.team2_name)
      .single();
    
    if (!team1Data || !team2Data) {
      console.error('Équipes non trouvées:', matchData.team1_name, matchData.team2_name);
      return null;
    }

    const { data, error } = await supabaseAdmin
      .from('matches')
      .insert([{
        team1_id: team1Data.id,
        team2_id: team2Data.id,
        game: matchData.game,
        tournament: matchData.tournament,
        match_date: matchData.date,
        match_time: matchData.time,
        team1_odds: matchData.team1_odds,
        team2_odds: matchData.team2_odds,
        status: matchData.status
      }])
      .select('id')
      .single();
    
    if (error) {
      console.error('Erreur createSimpleMatch:', error);
      return null;
    }
    
    return data?.id || null;
  }

  async updateSimpleMatch(matchId: number, matchData: {
    game: string;
    tournament: string;
    team1_name: string;
    team2_name: string;
    team1_odds: number;
    team2_odds: number;
    date: string;
    time: string;
    status: string;
  }): Promise<boolean> {
    // Trouver les IDs des équipes
    const { data: team1Data } = await supabaseAdmin
      .from('teams')
      .select('id')
      .eq('name', matchData.team1_name)
      .single();
    
    const { data: team2Data } = await supabaseAdmin
      .from('teams')
      .select('id')
      .eq('name', matchData.team2_name)
      .single();
    
    if (!team1Data || !team2Data) {
      console.error('Équipes non trouvées');
      return false;
    }

    const { error } = await supabaseAdmin
      .from('matches')
      .update({
        team1_id: team1Data.id,
        team2_id: team2Data.id,
        game: matchData.game,
        tournament: matchData.tournament,
        match_date: matchData.date,
        match_time: matchData.time,
        team1_odds: matchData.team1_odds,
        team2_odds: matchData.team2_odds,
        status: matchData.status
      })
      .eq('id', matchId);
    
    if (error) {
      console.error('Erreur updateSimpleMatch:', error);
      return false;
    }
    
    return true;
  }

  async deleteSimpleMatch(matchId: number): Promise<boolean> {
    return this.deleteMatch(matchId);
  }

  // ==================== UTILISATEURS ====================
  
  async getUserByClerkId(clerkId: string): Promise<User | null> {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('clerk_id', clerkId)
      .single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 = not found
      console.error('Erreur getUserByClerkId:', error);
    }
    
    return data || null;
  }

  async createOrGetUser(clerkId: string, username: string, email: string): Promise<User | null> {
    // Vérifier si l'utilisateur existe
    const existingUser = await this.getUserByClerkId(clerkId);
    if (existingUser) return existingUser;

    // Créer un nouvel utilisateur avec un solde initial
    const { data, error } = await supabaseAdmin
      .from('users')
      .insert([{
        clerk_id: clerkId,
        username,
        email,
        balance: 1000, // Solde initial de 1000€
        total_bet: 0,
        total_won: 0
      }])
      .select()
      .single();
    
    if (error) {
      console.error('Erreur createOrGetUser:', error);
      return null;
    }
    
    return data;
  }

  // ==================== PARIS ====================
  
  async getUserBets(userId: number): Promise<any[]> {
    const { data, error } = await supabaseAdmin
      .from('bets')
      .select(`
        *,
        match:matches(
          *,
          team1:teams!matches_team1_id_fkey(name, tag, logo_url),
          team2:teams!matches_team2_id_fkey(name, tag, logo_url)
        ),
        team:teams(name, tag, logo_url)
      `)
      .eq('user_id', userId)
      .order('placed_at', { ascending: false });
    
    if (error) {
      console.error('Erreur getUserBets:', error);
      return [];
    }
    
    return data || [];
  }

  async createBet(bet: Omit<Bet, 'id' | 'placed_at' | 'resolved_at'>): Promise<number | null> {
    const { data, error } = await supabaseAdmin
      .from('bets')
      .insert([bet])
      .select('id')
      .single();
    
    if (error) {
      console.error('Erreur createBet:', error);
      return null;
    }
    
    return data?.id || null;
  }

  async updateBetStatus(betId: string, status: string): Promise<boolean> {
    const { error } = await supabaseAdmin
      .from('bets')
      .update({ status, resolved_at: new Date().toISOString() })
      .eq('id', betId);
    
    if (error) {
      console.error('Erreur updateBetStatus:', error);
      return false;
    }
    
    return true;
  }

  // ==================== TRANSACTIONS ====================
  
  async addWalletTransaction(
    userId: number,
    type: string,
    amount: number,
    description: string,
    referenceId?: string
  ): Promise<boolean> {
    // Récupérer le solde actuel
    const { data: userData, error: getUserError } = await supabaseAdmin
      .from('users')
      .select('balance')
      .eq('id', userId)
      .single();
    
    if (getUserError || !userData) {
      console.error('Erreur récupération user:', getUserError);
      return false;
    }

    // Calculer le nouveau solde
    const multiplier = type === 'bet' ? -1 : 1;
    const newBalance = userData.balance + (multiplier * amount);
    
    const { error: balanceError } = await supabaseAdmin
      .from('users')
      .update({ balance: newBalance })
      .eq('id', userId);
    
    if (balanceError) {
      console.error('Erreur mise à jour balance:', balanceError);
      return false;
    }

    // Enregistrer la transaction
    const { error: transactionError } = await supabaseAdmin
      .from('wallet_transactions')
      .insert([{
        user_id: userId,
        type,
        amount: multiplier * amount,
        description,
        reference_id: referenceId
      }]);
    
    if (transactionError) {
      console.error('Erreur addWalletTransaction:', transactionError);
      return false;
    }
    
    return true;
  }

  async getUserTransactions(userId: number): Promise<any[]> {
    const { data, error } = await supabaseAdmin
      .from('wallet_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Erreur getUserTransactions:', error);
      return [];
    }
    
    return data || [];
  }

  // ==================== STATISTIQUES ====================
  
  async getUserStats(userId: number): Promise<any> {
    const user = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    const bets = await supabaseAdmin
      .from('bets')
      .select('*')
      .eq('user_id', userId);

    const wonBets = await supabaseAdmin
      .from('bets')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'won');

    return {
      balance: user.data?.balance || 0,
      totalBets: bets.data?.length || 0,
      wonBets: wonBets.data?.length || 0,
      totalWagered: user.data?.total_bet || 0,
      totalWon: user.data?.total_won || 0,
    };
  }

  // ==================== GESTION DES PARIS PROBLÉMATIQUES ====================
  
  async getProblematicBets(): Promise<any[]> {
    // Récupérer les paris avec des matchs ayant un statut fini mais le pari toujours en attente
    const { data, error } = await supabaseAdmin
      .from('bets')
      .select(`
        *,
        match:matches(
          *,
          team1:teams!matches_team1_id_fkey(name, tag),
          team2:teams!matches_team2_id_fkey(name, tag)
        ),
        team:teams(name, tag)
      `)
      .eq('status', 'pending')
      .in('match.status', ['finished', 'cancelled']);
    
    if (error) {
      console.error('Erreur getProblematicBets:', error);
      return [];
    }
    
    return data || [];
  }

  async cancelBet(betId: string, reason: string): Promise<boolean> {
    // Récupérer les infos du pari
    const { data: bet, error: betError } = await supabaseAdmin
      .from('bets')
      .select('user_id, amount')
      .eq('id', betId)
      .single();
    
    if (betError || !bet) {
      console.error('Erreur récupération pari:', betError);
      return false;
    }

    // Annuler le pari
    const { error: updateError } = await supabaseAdmin
      .from('bets')
      .update({ 
        status: 'cancelled',
        resolved_at: new Date().toISOString()
      })
      .eq('id', betId);
    
    if (updateError) {
      console.error('Erreur cancelBet:', updateError);
      return false;
    }

    // Rembourser l'utilisateur
    await this.addWalletTransaction(
      bet.user_id,
      'refund',
      bet.amount,
      reason,
      betId
    );
    
    return true;
  }

  async deleteBet(betId: string, reason: string): Promise<boolean> {
    // Récupérer les infos du pari
    const { data: bet, error: betError } = await supabaseAdmin
      .from('bets')
      .select('user_id, amount, status')
      .eq('id', betId)
      .single();
    
    if (betError || !bet) {
      console.error('Erreur récupération pari:', betError);
      return false;
    }

    // Si le pari est en attente, rembourser avant de supprimer
    if (bet.status === 'pending') {
      await this.addWalletTransaction(
        bet.user_id,
        'refund',
        bet.amount,
        reason,
        betId
      );
    }

    // Supprimer le pari
    const { error: deleteError } = await supabaseAdmin
      .from('bets')
      .delete()
      .eq('id', betId);
    
    if (deleteError) {
      console.error('Erreur deleteBet:', deleteError);
      return false;
    }
    
    return true;
  }

  async cleanupProblematicBets(): Promise<{ cancelled: number; deleted: number }> {
    const problematicBets = await this.getProblematicBets();
    let cancelled = 0;
    let deleted = 0;

    for (const bet of problematicBets) {
      if (bet.match?.status === 'cancelled') {
        // Annuler et rembourser les paris sur matchs annulés
        const success = await this.cancelBet(bet.id, 'Match annulé');
        if (success) cancelled++;
      } else if (bet.match?.status === 'finished') {
        // Supprimer les paris orphelins sur matchs terminés
        const success = await this.deleteBet(bet.id, 'Nettoyage automatique');
        if (success) deleted++;
      }
    }

    return { cancelled, deleted };
  }

  // ==================== MISE À JOUR DES STATUTS ====================
  
  async updateMatchStatuses(): Promise<{ 
    scheduledToLive: number; 
    liveToFinished: number;
    cancelledBets: number;
  }> {
    const now = new Date();
    const currentDate = now.toISOString().split('T')[0];
    const currentTime = now.toTimeString().split(' ')[0];

    console.log('🔄 Mise à jour des statuts des matchs...', { currentDate, currentTime });

    let scheduledToLive = 0;
    let liveToFinished = 0;
    let cancelledBets = 0;

    // 1. Mettre à jour les matchs en 'live' (matchs programmés dont l'heure est passée)
    const { data: scheduledMatches, error: scheduledError } = await supabaseAdmin
      .from('matches')
      .select('*')
      .eq('status', 'scheduled')
      .lte('match_date', currentDate);

    if (!scheduledError && scheduledMatches) {
      for (const match of scheduledMatches) {
        const matchDateTime = new Date(`${match.match_date}T${match.match_time}`);
        const now = new Date();
        
        // Si le match devrait avoir commencé
        if (matchDateTime <= now) {
          await supabaseAdmin
            .from('matches')
            .update({ status: 'live' })
            .eq('id', match.id);
          
          scheduledToLive++;
          console.log(`✅ Match ${match.id} passé en 'live'`);
        }
      }
    }

    // 2. Finaliser automatiquement les matchs en 'live' depuis plus de 30 minutes
    const { data: liveMatches, error: liveError } = await supabaseAdmin
      .from('matches')
      .select('*')
      .eq('status', 'live');

    if (!liveError && liveMatches) {
      const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000);
      
      for (const match of liveMatches) {
        const matchDateTime = new Date(`${match.match_date}T${match.match_time}`);
        
        // Si le match a démarré il y a plus de 30 minutes
        if (matchDateTime < thirtyMinutesAgo) {
          // Marquer le match comme terminé sans gagnant
          await supabaseAdmin
            .from('matches')
            .update({ 
              status: 'finished',
              winner_id: null // Pas de gagnant = match annulé
            })
            .eq('id', match.id);

          // Récupérer tous les paris sur ce match
          const { data: bets } = await supabaseAdmin
            .from('bets')
            .select('*')
            .eq('match_id', match.id)
            .eq('status', 'pending');

          // Annuler tous les paris et rembourser les mises
          if (bets && bets.length > 0) {
            for (const bet of bets) {
              // Rembourser la mise
              const { data: user } = await supabaseAdmin
                .from('users')
                .select('balance')
                .eq('clerk_id', bet.user_id)
                .single();

              if (user) {
                await supabaseAdmin
                  .from('users')
                  .update({ balance: user.balance + bet.amount })
                  .eq('clerk_id', bet.user_id);
              }

              // Marquer le pari comme annulé
              await supabaseAdmin
                .from('bets')
                .update({ 
                  status: 'cancelled',
                  resolved_at: new Date().toISOString()
                })
                .eq('id', bet.id);

              cancelledBets++;
            }
          }

          liveToFinished++;
          console.log(`⚠️ Match ${match.id} finalisé automatiquement (30min expirées) - ${bets?.length || 0} paris annulés et remboursés`);
        }
      }
    }

    return { scheduledToLive, liveToFinished, cancelledBets };
  }

  // ==================== FINALISATION DE MATCH ET GAINS ====================
  
  async finalizeMatch(matchId: number, winnerTeamId: number): Promise<{ 
    success: boolean; 
    winnersCount: number; 
    totalPaid: number;
    error?: string;
  }> {
    console.log(`🏆 Finalisation du match ${matchId} - Gagnant: team ${winnerTeamId}`);

    try {
      // 1. Récupérer le match
      const { data: match, error: matchError } = await supabaseAdmin
        .from('matches')
        .select('*')
        .eq('id', matchId)
        .single();

      if (matchError || !match) {
        return { success: false, winnersCount: 0, totalPaid: 0, error: 'Match non trouvé' };
      }

      // Déterminer quelle équipe a gagné (1 ou 2)
      const winningTeamNumber = match.team1_id === winnerTeamId ? 1 : 2;
      const winningOdds = winningTeamNumber === 1 ? match.team1_odds : match.team2_odds;

      console.log(`📊 Équipe gagnante: ${winningTeamNumber}, Cote: ${winningOdds}`);

      // 2. Récupérer tous les paris sur ce match
      const { data: bets, error: betsError } = await supabaseAdmin
        .from('bets')
        .select('*')
        .eq('match_id', matchId);

      if (betsError) {
        console.error('Erreur récupération paris:', betsError);
        return { success: false, winnersCount: 0, totalPaid: 0, error: 'Erreur récupération paris' };
      }

      let winnersCount = 0;
      let totalPaid = 0;

      // 3. Traiter chaque pari
      for (const bet of bets || []) {
        const betWon = bet.team_id === winnerTeamId;
        
        if (betWon) {
          // Calculer les gains
          const winAmount = bet.amount * winningOdds;
          
          // Mettre à jour le solde de l'utilisateur
          const { data: user, error: userError } = await supabaseAdmin
            .from('users')
            .select('balance, total_won')
            .eq('clerk_id', bet.user_id)
            .single();

          if (!userError && user) {
            const newBalance = user.balance + winAmount;
            const newTotalWon = user.total_won + winAmount;

            await supabaseAdmin
              .from('users')
              .update({ 
                balance: newBalance,
                total_won: newTotalWon
              })
              .eq('clerk_id', bet.user_id);

            console.log(`💰 Utilisateur ${bet.user_id}: +${winAmount}€ (nouveau solde: ${newBalance}€)`);
            
            winnersCount++;
            totalPaid += winAmount;
          }
        }

        // Marquer le pari comme résolu
        await supabaseAdmin
          .from('bets')
          .update({ 
            status: betWon ? 'won' : 'lost',
            resolved_at: new Date().toISOString()
          })
          .eq('id', bet.id);
      }

      // 4. Mettre à jour le match
      await supabaseAdmin
        .from('matches')
        .update({ 
          status: 'finished',
          winner_team_id: winnerTeamId
        })
        .eq('id', matchId);

      console.log(`✅ Match finalisé: ${winnersCount} gagnants, ${totalPaid}€ distribués`);

      return { 
        success: true, 
        winnersCount, 
        totalPaid 
      };

    } catch (error) {
      console.error('Erreur finalizeMatch:', error);
      return { 
        success: false, 
        winnersCount: 0, 
        totalPaid: 0, 
        error: error instanceof Error ? error.message : 'Erreur inconnue' 
      };
    }
  }

  // Supprimer les matchs terminés (optionnel - peut être appelé après distribution des gains)
  async cleanupFinishedMatches(): Promise<number> {
    const { data, error } = await supabaseAdmin
      .from('matches')
      .delete()
      .eq('status', 'finished')
      .select('id');

    if (error) {
      console.error('Erreur cleanupFinishedMatches:', error);
      return 0;
    }

    return data?.length || 0;
  }
}

// Instance singleton
let supabaseServiceInstance: SupabaseService | null = null;

export function getSupabaseService(): SupabaseService {
  if (!supabaseServiceInstance) {
    supabaseServiceInstance = new SupabaseService();
  }
  return supabaseServiceInstance;
}

export const supabaseService = getSupabaseService();
