import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('⚠️ Variables Supabase manquantes:', {
    url: !!supabaseUrl,
    anonKey: !!supabaseAnonKey,
    serviceKey: !!supabaseServiceKey
  });
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Client avec service role pour les opérations admin (côté serveur uniquement)
export const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseServiceKey || supabaseAnonKey, // Fallback sur anon key si service key manquante
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Types pour la base de données
export interface Team {
  id: number;
  name: string;
  tag: string;
  country: string;
  logo_url: string | null;
  founded_year: number | null;
  total_earnings: number;
  created_at: string;
}

export interface Match {
  id: number;
  team1_id: number;
  team2_id: number;
  game: string;
  tournament: string;
  match_date: string;
  match_time: string;
  status: string;
  team1_odds: number;
  team2_odds: number;
  winner_id: number | null;
  created_at: string;
}

export interface User {
  id: number;
  clerk_id: string;
  username: string;
  email: string;
  balance: number;
  total_bet: number;
  total_won: number;
  created_at: string;
}

export interface Bet {
  id: number;
  user_id: number;
  match_id: number;
  team_id: number;
  amount: number;
  odds: number;
  potential_payout: number;
  status: string;
  placed_at: string;
  resolved_at: string | null;
}
