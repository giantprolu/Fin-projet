import Database from 'better-sqlite3';
import path from 'path';

let db: Database.Database | null = null;

export function getDatabase() {
  if (!db) {
    const dbPath = path.join(process.cwd(), 'sqllite_esport_betting.db');
    db = new Database(dbPath);
    
    // Optimiser les performances
    db.pragma('journal_mode = WAL');
    db.pragma('synchronous = NORMAL');
  }
  
  return db;
}

export function closeDatabase() {
  if (db) {
    db.close();
    db = null;
  }
}

// Types TypeScript pour vos données
export interface Game {
  id: string;
  name: string;
  category: string;
  created_at: string;
}

export interface Team {
  id: string;
  name: string;
  tag: string;
  country: string;
  logo_url?: string;
  founded_year?: number;
  total_earnings: number;
  created_at: string;
}

export interface Player {
  id: string;
  username: string;
  real_name?: string;
  country: string;
  age?: number;
  role?: string;
  avatar_url?: string;
  total_earnings: number;
  twitch_followers: number;
  youtube_subscribers: number;
  created_at: string;
}

export interface Match {
  id: string;
  tournament_id: string;
  team1_id: string;
  team2_id: string;
  game_id: string;
  match_date: string;
  status: 'scheduled' | 'live' | 'completed' | 'cancelled';
  team1_score: number;
  team2_score: number;
  winner_id?: string;
  format: string;
  created_at: string;
}

export interface SimpleMatch {
  id: number;
  game: string;
  tournament: string;
  team1_id: number;
  team2_id: number;
  match_date: string;
  match_time: string;
  status: 'scheduled' | 'live' | 'finished';
  team1_odds: number;
  team2_odds: number;
  created_at: string;
}

export interface MatchWithTeams extends Match {
  team1: Team;
  team2: Team;
  game: Game;
  tournament: Tournament;
  odds?: MatchOdds[];
}

export interface Tournament {
  id: string;
  name: string;
  game_id: string;
  prize_pool: number;
  start_date: string;
  end_date: string;
  location: string;
  status: 'upcoming' | 'ongoing' | 'completed';
}

export interface User {
  id: string;
  clerk_id: string;
  username: string;
  email: string;
  balance: number;
  total_bet: number;
  total_won: number;
  created_at: string;
}

export interface UserWallet {
  id: string;
  user_id: string;
  balance: number;
  total_deposited: number;
  total_withdrawn: number;
  created_at: string;
  updated_at: string;
}

export interface WalletTransaction {
  id: string;
  user_id: string;
  type: 'bet' | 'win' | 'deposit' | 'withdrawal' | 'initial_bonus';
  amount: number;
  balance_after: number;
  description: string;
  reference_id?: string; // Pour lier à un pari ou autre
  created_at: string;
}

export interface Bet {
  id: string;
  user_id: string;
  match_id: string;
  team_id: string;
  amount: number;
  odds: number;
  potential_payout: number;
  status: 'pending' | 'won' | 'lost' | 'cancelled';
  placed_at: string;
}

export interface MatchOdds {
  id: string;
  match_id: string;
  team_id: string;
  odds: number;
  created_at: string;
  updated_at: string;
}

export interface TeamPlayer {
  id: string;
  team_id: string;
  player_id: string;
  position: string;
  join_date: string;
  salary?: number;
  is_active: boolean;
}