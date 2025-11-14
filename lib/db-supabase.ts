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
