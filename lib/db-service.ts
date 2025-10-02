import { getDatabase, type Match, type MatchWithTeams, type Team, type Game, type Tournament, type Bet, type MatchOdds, type Player } from './database';

export class DatabaseService {
  private db = getDatabase();

  constructor() {
    this.initializeTables();
  }

  // Initialiser les tables si elles n'existent pas
  private initializeTables() {
    try {
      // Créer la table teams si elle n'existe pas
      this.db.exec(`
        CREATE TABLE IF NOT EXISTS teams (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          tag TEXT UNIQUE NOT NULL,
          country TEXT NOT NULL DEFAULT 'FR',
          logo_url TEXT,
          founded_year INTEGER,
          total_earnings INTEGER DEFAULT 0,
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Créer un index sur le tag pour améliorer les performances
      this.db.exec(`
        CREATE INDEX IF NOT EXISTS idx_teams_tag ON teams(tag)
      `);

      // Vérifier que la table existe
      const tableExists = this.db.prepare(`
        SELECT COUNT(*) as count FROM sqlite_master 
        WHERE type='table' AND name='teams'
      `).get() as { count: number };

      console.log(`Table teams ${tableExists.count > 0 ? 'existe' : 'n\'existe pas'}`);
    } catch (error) {
      console.error('Erreur lors de l\'initialisation des tables:', error);
    }
  }

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
    try {
      const stmt = this.db.prepare('SELECT * FROM teams ORDER BY name');
      const rawTeams = stmt.all() as any[];
      
      // Convertir les IDs en strings pour correspondre à l'interface
      return rawTeams.map(team => ({
        ...team,
        id: team.id.toString()
      }));
    } catch (error) {
      console.error('Erreur lors de la récupération des équipes:', error);
      // Si la table n'existe pas encore, retourner un tableau vide
      return [];
    }
  }

  // Obtenir une équipe par ID
  getTeamById(teamId: string): Team | null {
    try {
      const stmt = this.db.prepare('SELECT * FROM teams WHERE id = ?');
      const rawTeam = stmt.get(teamId) as any;
      
      if (!rawTeam) {
        return null;
      }
      
      // Convertir l'ID en string pour correspondre à l'interface
      return {
        ...rawTeam,
        id: rawTeam.id.toString()
      };
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'équipe:', error);
      return null;
    }
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

  // CRUD pour les équipes
  createTeam(team: Omit<Team, 'id' | 'created_at'>): Team {
    try {
      const stmt = this.db.prepare(`
        INSERT INTO teams (name, tag, country, logo_url, founded_year, total_earnings, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      
      const result = stmt.run(
        team.name,
        team.tag,
        team.country || 'FR',
        team.logo_url || null,
        team.founded_year || new Date().getFullYear(),
        team.total_earnings || 0,
        new Date().toISOString()
      );

      console.log('Résultat de l\'insertion:', result);
      console.log('lastInsertRowid type:', typeof result.lastInsertRowid);
      console.log('lastInsertRowid value:', result.lastInsertRowid);

      // Convertir le bigint en number pour la requête
      const newId = Number(result.lastInsertRowid);
      console.log('ID converti:', newId);
      
      // Retourner la nouvelle équipe avec l'ID correct
      console.log('Tentative de récupération avec ID:', newId);
      
      // Vérifier d'abord si l'équipe existe vraiment
      const countStmt = this.db.prepare('SELECT COUNT(*) as count FROM teams WHERE id = ?');
      const countResult = countStmt.get(newId) as { count: number };
      console.log('Nombre d\'équipes avec cet ID:', countResult.count);
      
      // Vérifier toutes les équipes pour voir les IDs disponibles
      const allTeams = this.db.prepare('SELECT id, name, tag FROM teams ORDER BY id DESC LIMIT 5').all();
      console.log('Dernières équipes créées:', allTeams);
      
      let rawTeam = this.db.prepare('SELECT * FROM teams WHERE id = ?').get(newId) as any;
      
      console.log('Équipe récupérée:', rawTeam);
      
      // Alternative : récupérer par tag si l'ID pose problème
      if (!rawTeam) {
        console.log('Tentative de récupération par tag:', team.tag);
        rawTeam = this.db.prepare('SELECT * FROM teams WHERE tag = ? ORDER BY id DESC LIMIT 1').get(team.tag) as any;
        console.log('Équipe récupérée par tag:', rawTeam);
      }
      
      if (!rawTeam) {
        console.error('Aucune équipe trouvée avec l\'ID:', newId);
        throw new Error('Impossible de récupérer l\'équipe créée');
      }
      
      // Convertir l'ID en string pour correspondre à l'interface
      const newTeam: Team = {
        ...rawTeam,
        id: rawTeam.id.toString()
      };
      
      console.log('Équipe créée avec succès:', newTeam);
      return newTeam;
    } catch (error) {
      console.error('Erreur lors de la création de l\'équipe:', error);
      throw error; // Relancer l'erreur pour que l'API puisse la gérer
    }
  }

  updateTeam(id: string, team: Partial<Omit<Team, 'id' | 'created_at'>>): Team | null {
    try {
      const fields: string[] = [];
      const values: any[] = [];

      if (team.name !== undefined) {
        fields.push('name = ?');
        values.push(team.name);
      }
      if (team.tag !== undefined) {
        fields.push('tag = ?');
        values.push(team.tag);
      }
      if (team.country !== undefined) {
        fields.push('country = ?');
        values.push(team.country);
      }
      if (team.logo_url !== undefined) {
        fields.push('logo_url = ?');
        values.push(team.logo_url);
      }
      if (team.founded_year !== undefined) {
        fields.push('founded_year = ?');
        values.push(team.founded_year);
      }
      if (team.total_earnings !== undefined) {
        fields.push('total_earnings = ?');
        values.push(team.total_earnings);
      }

      if (fields.length === 0) {
        return this.getTeamById(id);
      }

      values.push(id);
      const stmt = this.db.prepare(`UPDATE teams SET ${fields.join(', ')} WHERE id = ?`);
      stmt.run(...values);

      return this.getTeamById(id);
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'équipe:', error);
      throw error;
    }
  }

  deleteTeam(id: string): boolean {
    try {
      const stmt = this.db.prepare('DELETE FROM teams WHERE id = ?');
      const result = stmt.run(id);
      return result.changes > 0;
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'équipe:', error);
      throw error;
    }
  }

  // Vérifier si un tag d'équipe existe déjà
  teamTagExists(tag: string, excludeId?: string): boolean {
    try {
      let stmt;
      let result;
      
      if (excludeId) {
        stmt = this.db.prepare('SELECT COUNT(*) as count FROM teams WHERE tag = ? AND id != ?');
        result = stmt.get(tag, excludeId) as { count: number };
      } else {
        stmt = this.db.prepare('SELECT COUNT(*) as count FROM teams WHERE tag = ?');
        result = stmt.get(tag) as { count: number };
      }
      
      return result.count > 0;
    } catch (error) {
      console.error('Erreur lors de la vérification du tag:', error);
      // Si la table n'existe pas encore, le tag n'existe pas non plus
      return false;
    }
  }
}

// Instance singleton du service
export const dbService = new DatabaseService();