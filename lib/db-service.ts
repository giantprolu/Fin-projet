import { getDatabase, type Match, type MatchWithTeams, type Team, type Game, type Tournament, type Bet, type MatchOdds, type Player } from './database';

export class DatabaseService {
  private db = getDatabase();

  // Obtenir tous les matchs avec les détails des équipes
  getMatchesWithDetails(): MatchWithTeams[] {
    const stmt = this.db.prepare(`
      SELECT 
        m.*,
        t1.name as team1_name,
        t1.tag as team1_tag,
        t1.logo_url as team1_logo,
        t2.name as team2_name,
        t2.tag as team2_tag,
        t2.logo_url as team2_logo,
        g.name as game_name,
        g.category as game_category,
        tour.name as tournament_name,
        tour.location as tournament_location
      FROM matches m
      JOIN teams t1 ON m.team1_id = t1.id
      JOIN teams t2 ON m.team2_id = t2.id
      JOIN games g ON m.game_id = g.id
      JOIN tournaments tour ON m.tournament_id = tour.id
      ORDER BY m.match_date DESC
    `);
    
    const rows = stmt.all() as any[];
    
    return rows.map(row => ({
      id: row.id,
      tournament_id: row.tournament_id,
      team1_id: row.team1_id,
      team2_id: row.team2_id,
      game_id: row.game_id,
      match_date: row.match_date,
      status: row.status,
      team1_score: row.team1_score,
      team2_score: row.team2_score,
      winner_id: row.winner_id,
      format: row.format,
      created_at: row.created_at,
      team1: {
        id: row.team1_id,
        name: row.team1_name,
        tag: row.team1_tag,
        logo_url: row.team1_logo,
        country: '',
        total_earnings: 0,
        created_at: ''
      },
      team2: {
        id: row.team2_id,
        name: row.team2_name,
        tag: row.team2_tag,
        logo_url: row.team2_logo,
        country: '',
        total_earnings: 0,
        created_at: ''
      },
      game: {
        id: row.game_id,
        name: row.game_name,
        category: row.game_category,
        created_at: ''
      },
      tournament: {
        id: row.tournament_id,
        name: row.tournament_name,
        game_id: row.game_id,
        prize_pool: 0,
        start_date: '',
        end_date: '',
        location: row.tournament_location,
        status: 'upcoming'
      }
    }));
  }

  // Obtenir un match spécifique avec tous les détails
  getMatchById(matchId: string): MatchWithTeams | null {
    const stmt = this.db.prepare(`
      SELECT 
        m.*,
        t1.name as team1_name,
        t1.tag as team1_tag,
        t1.logo_url as team1_logo,
        t2.name as team2_name,
        t2.tag as team2_tag,
        t2.logo_url as team2_logo,
        g.name as game_name,
        g.category as game_category,
        tour.name as tournament_name,
        tour.location as tournament_location
      FROM matches m
      JOIN teams t1 ON m.team1_id = t1.id
      JOIN teams t2 ON m.team2_id = t2.id
      JOIN games g ON m.game_id = g.id
      JOIN tournaments tour ON m.tournament_id = tour.id
      WHERE m.id = ?
    `);
    
    const row = stmt.get(matchId) as any;
    if (!row) return null;
    
    // Obtenir les cotes pour ce match
    const oddsStmt = this.db.prepare('SELECT * FROM match_odds WHERE match_id = ?');
    const odds = oddsStmt.all(matchId) as MatchOdds[];
    
    return {
      id: row.id,
      tournament_id: row.tournament_id,
      team1_id: row.team1_id,
      team2_id: row.team2_id,
      game_id: row.game_id,
      match_date: row.match_date,
      status: row.status,
      team1_score: row.team1_score,
      team2_score: row.team2_score,
      winner_id: row.winner_id,
      format: row.format,
      created_at: row.created_at,
      team1: {
        id: row.team1_id,
        name: row.team1_name,
        tag: row.team1_tag,
        logo_url: row.team1_logo,
        country: '',
        total_earnings: 0,
        created_at: ''
      },
      team2: {
        id: row.team2_id,
        name: row.team2_name,
        tag: row.team2_tag,
        logo_url: row.team2_logo,
        country: '',
        total_earnings: 0,
        created_at: ''
      },
      game: {
        id: row.game_id,
        name: row.game_name,
        category: row.game_category,
        created_at: ''
      },
      tournament: {
        id: row.tournament_id,
        name: row.tournament_name,
        game_id: row.game_id,
        prize_pool: 0,
        start_date: '',
        end_date: '',
        location: row.tournament_location,
        status: 'upcoming'
      },
      odds
    };
  }

  // Obtenir toutes les équipes
  getTeams(): Team[] {
    const stmt = this.db.prepare('SELECT * FROM teams ORDER BY name');
    return stmt.all() as Team[];
  }

  // Obtenir une équipe par ID
  getTeamById(teamId: string): Team | null {
    const stmt = this.db.prepare('SELECT * FROM teams WHERE id = ?');
    return stmt.get(teamId) as Team | null;
  }

  // Obtenir tous les jeux
  getGames(): Game[] {
    const stmt = this.db.prepare('SELECT * FROM games ORDER BY name');
    return stmt.all() as Game[];
  }

  // Obtenir tous les tournois
  getTournaments(): Tournament[] {
    const stmt = this.db.prepare('SELECT * FROM tournaments ORDER BY start_date DESC');
    return stmt.all() as Tournament[];
  }

  // Obtenir les paris d'un utilisateur
  getUserBets(userId: string): Bet[] {
    const stmt = this.db.prepare('SELECT * FROM bets WHERE user_id = ? ORDER BY placed_at DESC');
    return stmt.all(userId) as Bet[];
  }

  // Obtenir les cotes d'un match
  getMatchOdds(matchId: string): MatchOdds[] {
    const stmt = this.db.prepare('SELECT * FROM match_odds WHERE match_id = ?');
    return stmt.all(matchId) as MatchOdds[];
  }

  // Obtenir les joueurs d'une équipe
  getTeamPlayers(teamId: string): Player[] {
    const stmt = this.db.prepare(`
      SELECT p.* 
      FROM players p
      JOIN team_players tp ON p.id = tp.player_id
      WHERE tp.team_id = ? AND tp.is_active = 1
    `);
    return stmt.all(teamId) as Player[];
  }

  // Créer un nouveau pari
  createBet(bet: Omit<Bet, 'id' | 'placed_at'>): string {
    const id = this.generateId();
    const stmt = this.db.prepare(`
      INSERT INTO bets (id, user_id, match_id, team_id, amount, odds, potential_payout, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(id, bet.user_id, bet.match_id, bet.team_id, bet.amount, bet.odds, bet.potential_payout, bet.status);
    return id;
  }

  // Mettre à jour le statut d'un pari
  updateBetStatus(betId: string, status: Bet['status']): void {
    const stmt = this.db.prepare('UPDATE bets SET status = ? WHERE id = ?');
    stmt.run(status, betId);
  }

  // Générer un ID unique
  private generateId(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  // Obtenir les statistiques générales
  getStats() {
    const totalMatches = this.db.prepare('SELECT COUNT(*) as count FROM matches').get() as { count: number };
    const totalTeams = this.db.prepare('SELECT COUNT(*) as count FROM teams').get() as { count: number };
    const totalBets = this.db.prepare('SELECT COUNT(*) as count FROM bets').get() as { count: number };
    const totalUsers = this.db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
    
    return {
      totalMatches: totalMatches.count,
      totalTeams: totalTeams.count,
      totalBets: totalBets.count,
      totalUsers: totalUsers.count
    };
  }
}

// Instance singleton du service
export const dbService = new DatabaseService();