import { getDatabase, type Match, type SimpleMatch, type MatchWithTeams, type Team, type Game, type Tournament, type Bet, type MatchOdds, type Player, type User, type UserWallet, type WalletTransaction } from './database';

export class DatabaseService {
  private db = getDatabase();

  constructor() {
    this.initializeTables();
    this.insertDemoData();
    this.updateMatchStatuses(); // Mettre à jour les statuts à l'initialisation
    
    // Vérifier les statuts toutes les 5 minutes
    setInterval(() => {
      this.updateMatchStatuses();
    }, 5 * 60 * 1000); // 5 minutes en millisecondes
  }

  // Insérer des données de démonstration
  private insertDemoData() {
    try {
      // Vérifier si des équipes existent déjà
      const teamsCount = this.db.prepare('SELECT COUNT(*) as count FROM teams').get() as { count: number };
      
      if (teamsCount.count === 0) {
        // Insérer quelques équipes de démonstration
        const insertTeam = this.db.prepare(`
          INSERT INTO teams (name, tag, country, logo_url, founded_year, total_earnings)
          VALUES (?, ?, ?, ?, ?, ?)
        `);
        
        insertTeam.run('Team Vitality', 'VIT', 'FR', '/assets/Team_Vitality_Logo_2018.png', 2013, 2500000);
        insertTeam.run('Karmine Corp', 'KC', 'FR', '/assets/Karmine_Corp.svg', 2020, 1200000);
        insertTeam.run('Team BDS', 'BDS', 'CH', '/assets/Team_BDS.png', 2018, 1800000);
        insertTeam.run('Solary', 'SLY', 'FR', '/assets/Logo_Solary.png', 2017, 800000);
      }
      
      // Vérifier si des matchs existent déjà
      const matchesCount = this.db.prepare('SELECT COUNT(*) as count FROM matches').get() as { count: number };
      
      if (matchesCount.count === 0) {
        // Insérer quelques matchs de démonstration
        const insertMatch = this.db.prepare(`
          INSERT INTO matches (team1_id, team2_id, game, tournament, match_date, match_time, status, team1_odds, team2_odds)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = tomorrow.toISOString().split('T')[0];
        
        const dayAfter = new Date();
        dayAfter.setDate(dayAfter.getDate() + 2);
        const dayAfterStr = dayAfter.toISOString().split('T')[0];
        
        insertMatch.run(1, 2, 'Valorant', 'VCT Masters', tomorrowStr, '18:00', 'scheduled', 1.85, 2.10);
        insertMatch.run(3, 4, 'League of Legends', 'LEC Spring', tomorrowStr, '20:00', 'scheduled', 1.65, 2.30);
        insertMatch.run(1, 3, 'CS:GO', 'IEM Katowice', dayAfterStr, '16:00', 'scheduled', 1.90, 1.95);
      }
      
      console.log('Données de démonstration initialisées');
    } catch (error) {
      console.error('Erreur lors de l\'initialisation des données de démo:', error);
    }
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

      // Créer la table users
      this.db.exec(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          clerk_id TEXT UNIQUE NOT NULL,
          username TEXT NOT NULL,
          email TEXT NOT NULL,
          balance REAL DEFAULT 0,
          total_bet REAL DEFAULT 0,
          total_won REAL DEFAULT 0,
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Créer la table user_wallets
      this.db.exec(`
        CREATE TABLE IF NOT EXISTS user_wallets (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          balance REAL DEFAULT 0,
          total_deposited REAL DEFAULT 0,
          total_withdrawn REAL DEFAULT 0,
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id)
        )
      `);

      // Créer la table wallet_transactions
      this.db.exec(`
        CREATE TABLE IF NOT EXISTS wallet_transactions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          type TEXT NOT NULL CHECK (type IN ('bet', 'win', 'deposit', 'withdrawal', 'initial_bonus')),
          amount REAL NOT NULL,
          balance_after REAL NOT NULL,
          description TEXT NOT NULL,
          reference_id TEXT,
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id)
        )
      `);

      // Créer la table bets
      this.db.exec(`
        CREATE TABLE IF NOT EXISTS bets (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          match_id INTEGER NOT NULL,
          team_id INTEGER NOT NULL,
          amount REAL NOT NULL,
          odds REAL NOT NULL,
          potential_payout REAL NOT NULL,
          status TEXT NOT NULL CHECK (status IN ('pending', 'won', 'lost', 'cancelled')),
          placed_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id),
          FOREIGN KEY (team_id) REFERENCES teams(id)
        )
      `);

      // Créer la table matches si elle n'existe pas
      this.db.exec(`
        CREATE TABLE IF NOT EXISTS matches (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          team1_id INTEGER NOT NULL,
          team2_id INTEGER NOT NULL,
          game TEXT NOT NULL,
          tournament TEXT NOT NULL,
          match_date TEXT NOT NULL,
          match_time TEXT NOT NULL,
          status TEXT NOT NULL CHECK (status IN ('scheduled', 'live', 'finished', 'cancelled')) DEFAULT 'scheduled',
          team1_score INTEGER DEFAULT 0,
          team2_score INTEGER DEFAULT 0,
          team1_odds REAL DEFAULT 2.0,
          team2_odds REAL DEFAULT 2.0,
          winner_id INTEGER,
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (team1_id) REFERENCES teams(id),
          FOREIGN KEY (team2_id) REFERENCES teams(id),
          FOREIGN KEY (winner_id) REFERENCES teams(id)
        )
      `);

      // Migrer la structure existante si nécessaire
      try {
        // Vérifier si les nouvelles colonnes existent
        const tableInfo = this.db.prepare("PRAGMA table_info(matches)").all() as any[];
        const columnNames = tableInfo.map(col => col.name);
        
        if (!columnNames.includes('tournament')) {
          this.db.exec(`ALTER TABLE matches ADD COLUMN tournament TEXT DEFAULT 'Unknown Tournament'`);
        }
        if (!columnNames.includes('match_time')) {
          this.db.exec(`ALTER TABLE matches ADD COLUMN match_time TEXT DEFAULT '18:00'`);
        }
        if (!columnNames.includes('team1_odds')) {
          this.db.exec(`ALTER TABLE matches ADD COLUMN team1_odds REAL DEFAULT 2.0`);
        }
        if (!columnNames.includes('team2_odds')) {
          this.db.exec(`ALTER TABLE matches ADD COLUMN team2_odds REAL DEFAULT 2.0`);
        }
      } catch (migrationError) {
        console.log('Migration des colonnes terminée ou non nécessaire');
      }

      // Créer les index pour améliorer les performances
      this.db.exec(`CREATE INDEX IF NOT EXISTS idx_teams_tag ON teams(tag)`);
      this.db.exec(`CREATE INDEX IF NOT EXISTS idx_users_clerk_id ON users(clerk_id)`);
      this.db.exec(`CREATE INDEX IF NOT EXISTS idx_user_wallets_user_id ON user_wallets(user_id)`);
      this.db.exec(`CREATE INDEX IF NOT EXISTS idx_wallet_transactions_user_id ON wallet_transactions(user_id)`);
      this.db.exec(`CREATE INDEX IF NOT EXISTS idx_bets_user_id ON bets(user_id)`);
      this.db.exec(`CREATE INDEX IF NOT EXISTS idx_bets_match_id ON bets(match_id)`);

      console.log('Tables initialisées avec succès');
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
  getUserBets(userId: number): any[] {
    try {
      // Vérifier si la table matches existe
      const tableExists = this.db.prepare(`
        SELECT name FROM sqlite_master 
        WHERE type='table' AND name='matches'
      `).get();
      
      if (!tableExists) {
        console.log('Table matches n\'existe pas encore');
        return [];
      }
      
      const stmt = this.db.prepare(`
        SELECT 
          b.*,
          t1.name as team1_name,
          t1.tag as team1_tag,
          t1.logo_url as team1_logo,
          t2.name as team2_name,
          t2.tag as team2_tag,
          t2.logo_url as team2_logo,
          bet_team.name as bet_team_name,
          bet_team.tag as bet_team_tag,
          bet_team.logo_url as bet_team_logo,
          COALESCE(m.game, 'Unknown Game') as game,
          m.match_date,
          m.status as match_status,
          m.winner_id
        FROM bets b
        LEFT JOIN matches m ON b.match_id = m.id
        LEFT JOIN teams t1 ON m.team1_id = t1.id
        LEFT JOIN teams t2 ON m.team2_id = t2.id
        LEFT JOIN teams bet_team ON b.team_id = bet_team.id
        WHERE b.user_id = ?
        ORDER BY b.placed_at DESC
      `);
      
      return stmt.all(userId);
    } catch (error) {
      console.error('Erreur lors de la récupération des paris:', error);
      return [];
    }
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
  createBet(bet: Omit<Bet, 'id' | 'placed_at'>): number {
    try {
      const stmt = this.db.prepare(`
        INSERT INTO bets (user_id, match_id, team_id, amount, odds, potential_payout, status)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      
      const result = stmt.run(
        bet.user_id,
        bet.match_id,
        bet.team_id,
        bet.amount,
        bet.odds,
        bet.potential_payout,
        bet.status
      );

      const betId = Number(result.lastInsertRowid);

      // Ajouter la transaction de pari
      this.addWalletTransaction(
        Number(bet.user_id),
        'bet',
        bet.amount,
        `Pari sur le match ${bet.match_id}`,
        betId.toString()
      );

      return betId;
    } catch (error) {
      console.error('Erreur lors de la création du pari:', error);
      throw error;
    }
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

  // CRUD pour les matchs simples (interface admin)
  getSimpleMatches(): any[] {
    try {
      const stmt = this.db.prepare(`
        SELECT 
          m.id,
          m.game,
          m.tournament,
          m.match_date,
          m.match_time,
          m.status,
          m.team1_odds,
          m.team2_odds,
          t1.name as team1_name,
          t1.tag as team1_tag,
          t1.logo_url as team1_logo,
          t2.name as team2_name,
          t2.tag as team2_tag,
          t2.logo_url as team2_logo
        FROM matches m
        JOIN teams t1 ON m.team1_id = t1.id
        JOIN teams t2 ON m.team2_id = t2.id
        ORDER BY m.match_date DESC, m.match_time DESC
      `);
      
      const rows = stmt.all() as any[];
      
      return rows.map(row => ({
        id: row.id,
        game: row.game,
        tournament: row.tournament,
        team1: {
          name: row.team1_name,
          tag: row.team1_tag || '',
          logo: row.team1_logo,
          odds: row.team1_odds
        },
        team2: {
          name: row.team2_name,
          tag: row.team2_tag || '',
          logo: row.team2_logo,
          odds: row.team2_odds
        },
        match_date: row.match_date,
        match_time: row.match_time,
        status: row.status,
        // Ajout de compatibilité avec l'ancienne interface
        date: row.match_date,
        time: row.match_time
      }));
    } catch (error) {
      console.error('Erreur lors de la récupération des matchs simples:', error);
      return [];
    }
  }

  createSimpleMatch(matchData: {
    game: string;
    tournament: string;
    team1_name: string;
    team2_name: string;
    team1_odds: number;
    team2_odds: number;
    date: string;
    time: string;
    status: string;
  }): number | null {
    try {
      // Récupérer les IDs des équipes par leur nom
      const team1 = this.db.prepare('SELECT id FROM teams WHERE name = ?').get(matchData.team1_name) as any;
      const team2 = this.db.prepare('SELECT id FROM teams WHERE name = ?').get(matchData.team2_name) as any;
      
      if (!team1 || !team2) {
        console.error('Équipe(s) non trouvée(s)');
        return null;
      }

      const stmt = this.db.prepare(`
        INSERT INTO matches (team1_id, team2_id, game, tournament, match_date, match_time, status, team1_odds, team2_odds)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      const result = stmt.run(
        team1.id,
        team2.id,
        matchData.game,
        matchData.tournament,
        matchData.date,
        matchData.time,
        matchData.status,
        matchData.team1_odds,
        matchData.team2_odds
      );
      
      return Number(result.lastInsertRowid);
    } catch (error) {
      console.error('Erreur lors de la création du match:', error);
      return null;
    }
  }

  updateSimpleMatch(matchId: number, matchData: {
    game: string;
    tournament: string;
    team1_name: string;
    team2_name: string;
    team1_odds: number;
    team2_odds: number;
    date: string;
    time: string;
    status: string;
  }): boolean {
    try {
      // Récupérer les IDs des équipes par leur nom
      const team1 = this.db.prepare('SELECT id FROM teams WHERE name = ?').get(matchData.team1_name) as any;
      const team2 = this.db.prepare('SELECT id FROM teams WHERE name = ?').get(matchData.team2_name) as any;
      
      if (!team1 || !team2) {
        console.error('Équipe(s) non trouvée(s)');
        return false;
      }

      const stmt = this.db.prepare(`
        UPDATE matches 
        SET team1_id = ?, team2_id = ?, game = ?, tournament = ?, 
            match_date = ?, match_time = ?, status = ?, team1_odds = ?, team2_odds = ?
        WHERE id = ?
      `);
      
      const result = stmt.run(
        team1.id,
        team2.id,
        matchData.game,
        matchData.tournament,
        matchData.date,
        matchData.time,
        matchData.status,
        matchData.team1_odds,
        matchData.team2_odds,
        matchId
      );
      
      return result.changes > 0;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du match:', error);
      return false;
    }
  }

  deleteSimpleMatch(matchId: number): boolean {
    try {
      const stmt = this.db.prepare('DELETE FROM matches WHERE id = ?');
      const result = stmt.run(matchId);
      return result.changes > 0;
    } catch (error) {
      console.error('Erreur lors de la suppression du match:', error);
      return false;
    }
  }

  // Mettre à jour automatiquement les statuts des matchs en fonction de la date/heure
  updateMatchStatuses(): void {
    try {
      const now = new Date();
      const currentDate = now.toISOString().split('T')[0]; // YYYY-MM-DD
      const currentTime = now.toTimeString().split(' ')[0].substring(0, 5); // HH:MM
      
      // Convertir la date/heure actuelle en minutes depuis minuit pour comparaison
      const [currentHour, currentMinute] = currentTime.split(':').map(Number);
      const currentTotalMinutes = currentHour * 60 + currentMinute;

      // Récupérer tous les matchs
      const matches = this.db.prepare('SELECT * FROM matches').all() as any[];
      
      for (const match of matches) {
        const matchDate = match.match_date;
        const matchTime = match.match_time;
        
        if (!matchTime) continue; // Skip si pas d'heure définie
        
        const [matchHour, matchMinute] = matchTime.split(':').map(Number);
        const matchTotalMinutes = matchHour * 60 + matchMinute;
        
        let newStatus = match.status;
        
        if (matchDate < currentDate) {
          // Match dans le passé -> finished
          newStatus = 'finished';
        } else if (matchDate === currentDate) {
          // Match aujourd'hui, vérifier l'heure
          const minutesDifference = currentTotalMinutes - matchTotalMinutes;
          
          if (minutesDifference >= 60) {
            // Plus d'1h après le début -> finished
            newStatus = 'finished';
          } else if (minutesDifference >= 0) {
            // Entre 0 et 60 minutes après le début -> live
            newStatus = 'live';
          } else {
            // Avant le début -> scheduled
            newStatus = 'scheduled';
          }
        } else {
          // Match dans le futur -> scheduled
          newStatus = 'scheduled';
        }
        
        // Mettre à jour seulement si le statut a changé
        if (newStatus !== match.status) {
          const updateStmt = this.db.prepare('UPDATE matches SET status = ? WHERE id = ?');
          updateStmt.run(newStatus, match.id);
          console.log(`Match ${match.id} status updated from ${match.status} to ${newStatus}`);
        }
      }
      
      // Après avoir mis à jour les statuts, simuler les résultats pour les matchs terminés
      this.simulateMatchOutcomes();
      
    } catch (error) {
      console.error('Erreur lors de la mise à jour des statuts de matchs:', error);
    }
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

  // === GESTION DES UTILISATEURS ET PORTEFEUILLE ===

  // Créer ou récupérer un utilisateur par son clerk_id
  createOrGetUser(clerkId: string, username: string, email: string): User {
    try {
      console.log('createOrGetUser called with:', { clerkId, username, email });
      
      // Vérifier si l'utilisateur existe déjà
      const existingUser = this.db.prepare('SELECT * FROM users WHERE clerk_id = ?').get(clerkId) as User;
      
      if (existingUser) {
        console.log('Utilisateur existant trouvé:', existingUser.id);
        return existingUser;
      }

      console.log('Création nouvel utilisateur...');
      
      // Créer un nouvel utilisateur
      const stmt = this.db.prepare(`
        INSERT INTO users (clerk_id, username, email, balance)
        VALUES (?, ?, ?, 100.0)
      `);
      
      console.log('Avant exécution SQL avec paramètres:', [clerkId, username, email]);
      const result = stmt.run(clerkId, username, email);
      console.log('SQL result:', result);

      // Récupérer l'utilisateur créé pour obtenir son vrai ID (TEXT)
      const newUser = this.db.prepare('SELECT * FROM users WHERE clerk_id = ?').get(clerkId) as User;
      console.log('Utilisateur créé:', newUser);

      // Ne pas créer de wallet automatiquement car il y a un conflit de types
      // L'utilisateur commencera avec le balance de la table users (100€)

      return newUser;
    } catch (error) {
      console.error('Erreur lors de la création de l\'utilisateur:', error);
      throw error;
    }
  }

  // Initialiser le portefeuille d'un utilisateur avec bonus initial
  private initializeUserWallet(userId: number): void {
    try {
      // Créer le portefeuille
      const walletStmt = this.db.prepare(`
        INSERT INTO user_wallets (user_id, balance, total_deposited)
        VALUES (?, 100.0, 100.0)
      `);
      walletStmt.run(userId);

      // Ajouter la transaction du bonus initial
      const transactionStmt = this.db.prepare(`
        INSERT INTO wallet_transactions (user_id, type, amount, balance_after, description)
        VALUES (?, 'initial_bonus', 100.0, 100.0, 'Bonus de bienvenue')
      `);
      transactionStmt.run(userId);
    } catch (error) {
      console.error('Erreur lors de l\'initialisation du portefeuille:', error);
      throw error;
    }
  }

  // Récupérer un utilisateur par son clerk_id
  getUserByClerkId(clerkId: string): User | null {
    try {
      return this.db.prepare('SELECT * FROM users WHERE clerk_id = ?').get(clerkId) as User || null;
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'utilisateur:', error);
      return null;
    }
  }

  // Récupérer le portefeuille d'un utilisateur
  getUserWallet(userId: number): UserWallet | null {
    try {
      return this.db.prepare('SELECT * FROM user_wallets WHERE user_id = ?').get(userId) as UserWallet || null;
    } catch (error) {
      console.error('Erreur lors de la récupération du portefeuille:', error);
      return null;
    }
  }

  // Mettre à jour le solde d'un utilisateur
  updateUserBalance(userId: number, newBalance: number): void {
    try {
      const transaction = this.db.transaction(() => {
        // Mettre à jour la table users
        this.db.prepare('UPDATE users SET balance = ? WHERE id = ?').run(newBalance, userId);
        
        // Mettre à jour la table user_wallets
        this.db.prepare('UPDATE user_wallets SET balance = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?')
          .run(newBalance, userId);
      });
      
      transaction();
    } catch (error) {
      console.error('Erreur lors de la mise à jour du solde:', error);
      throw error;
    }
  }

  // Ajouter une transaction au portefeuille
  addWalletTransaction(userId: number | string, type: string, amount: number, description: string, referenceId?: string): void {
    try {
      // Convertir l'userId en nombre pour la table user_wallets
      const numericUserId = typeof userId === 'string' ? parseInt(userId) : userId;
      
      // Récupérer le solde actuel
      let wallet = this.getUserWallet(numericUserId);
      
      // Si le portefeuille n'existe pas, le créer avec un solde initial de 1000€
      if (!wallet) {
        this.db.prepare(`
          INSERT INTO user_wallets (user_id, balance, created_at, updated_at)
          VALUES (?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `).run(numericUserId, 1000);
        
        // Mettre à jour la table users aussi (utiliser l'ID original)
        this.db.prepare('UPDATE users SET balance = ? WHERE id = ?').run(1000, userId);
        
        wallet = this.getUserWallet(numericUserId);
        if (!wallet) throw new Error('Impossible de créer le portefeuille');
      }

      const newBalance = wallet.balance + (type === 'bet' ? -amount : amount);
      
      const transaction = this.db.transaction(() => {
        // Ajouter la transaction
        this.db.prepare(`
          INSERT INTO wallet_transactions (user_id, type, amount, balance_after, description, reference_id)
          VALUES (?, ?, ?, ?, ?, ?)
        `).run(numericUserId, type, amount, newBalance, description, referenceId);

        // Mettre à jour le solde
        this.updateUserBalance(numericUserId, newBalance);

        // Mettre à jour les totaux selon le type dans la table users (utiliser l'ID original)
        if (type === 'bet') {
          this.db.prepare('UPDATE users SET total_bet = total_bet + ? WHERE id = ?').run(amount, userId);
        } else if (type === 'win') {
          this.db.prepare('UPDATE users SET total_won = total_won + ? WHERE id = ?').run(amount, userId);
        }
      });
      
      transaction();
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la transaction:', error);
      throw error;
    }
  }

  // Récupérer les statistiques d'un utilisateur
  getUserStats(userId: string): any {
    try {
      const user = this.db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as User;
      const bets = this.db.prepare('SELECT * FROM bets WHERE user_id = ?').all(userId) as Bet[];
      
      if (!user) return null;

      const totalBets = bets.length;
      const wonBets = bets.filter(bet => bet.status === 'won').length;
      const lostBets = bets.filter(bet => bet.status === 'lost').length;
      const pendingBets = bets.filter(bet => bet.status === 'pending').length;
      
      const winRate = totalBets > 0 ? (wonBets / totalBets) * 100 : 0;
      const profit = user.total_won - user.total_bet;

      // Calculer les gains/pertes par jour (7 derniers jours)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const dailyStats = this.db.prepare(`
        SELECT 
          DATE(placed_at) as date,
          SUM(CASE WHEN status = 'won' THEN potential_payout ELSE 0 END) as gains,
          SUM(CASE WHEN status = 'lost' THEN amount ELSE 0 END) as pertes
        FROM bets 
        WHERE user_id = ? AND DATE(placed_at) >= DATE(?)
        GROUP BY DATE(placed_at)
        ORDER BY date DESC
      `).all(userId, sevenDaysAgo.toISOString().split('T')[0]);

      // Calculer les performances mensuelles (6 derniers mois)
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      
      const monthlyStats = this.db.prepare(`
        SELECT 
          strftime('%Y-%m', placed_at) as month,
          SUM(CASE WHEN status = 'won' THEN potential_payout - amount ELSE -amount END) as profit
        FROM bets 
        WHERE user_id = ? AND DATE(placed_at) >= DATE(?)
        GROUP BY strftime('%Y-%m', placed_at)
        ORDER BY month DESC
      `).all(userId, sixMonthsAgo.toISOString().split('T')[0]);

      return {
        user,
        totalBets,
        wonBets,
        lostBets,
        pendingBets,
        winRate,
        profit,
        balance: user.balance,
        totalStake: user.total_bet,
        totalPayout: user.total_won,
        dailyStats,
        monthlyStats
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      return null;
    }
  }

  // Récupérer les transactions du portefeuille d'un utilisateur
  getUserTransactions(userId: number, limit: number = 50): WalletTransaction[] {
    try {
      const stmt = this.db.prepare(`
        SELECT * FROM wallet_transactions 
        WHERE user_id = ? 
        ORDER BY created_at DESC 
        LIMIT ?
      `);
      
      return stmt.all(userId, limit) as WalletTransaction[];
    } catch (error) {
      console.error('Erreur lors de la récupération des transactions:', error);
      return [];
    }
  }

  // Annuler/Supprimer un pari et rembourser l'utilisateur
  cancelBet(betId: number, reason: string = 'Pari annulé'): boolean {
    try {
      const transaction = this.db.transaction(() => {
        // Récupérer les informations du pari
        const bet = this.db.prepare('SELECT * FROM bets WHERE id = ?').get(betId) as any;
        
        if (!bet) {
          throw new Error('Pari non trouvé');
        }
        
        if (bet.status !== 'pending') {
          throw new Error('Impossible d\'annuler un pari qui n\'est pas en attente');
        }
        
        // Marquer le pari comme annulé
        this.db.prepare(`
          UPDATE bets SET status = 'cancelled' WHERE id = ?
        `).run(betId);
        
        // Rembourser l'utilisateur
        this.addWalletTransaction(
          bet.user_id,
          'deposit',
          bet.amount,
          `Remboursement du pari #${betId}: ${reason}`,
          betId.toString()
        );
        
        console.log(`Pari #${betId} annulé et remboursé: ${reason}`);
      });
      
      transaction();
      return true;
    } catch (error) {
      console.error('Erreur lors de l\'annulation du pari:', error);
      return false;
    }
  }

  // Supprimer définitivement un pari (plus radical)
  deleteBet(betId: number, reason: string = 'Pari supprimé'): boolean {
    try {
      const transaction = this.db.transaction(() => {
        // Récupérer les informations du pari
        const bet = this.db.prepare('SELECT * FROM bets WHERE id = ?').get(betId) as any;
        
        if (!bet) {
          throw new Error('Pari non trouvé');
        }
        
        // Si le pari est en attente, rembourser d'abord
        if (bet.status === 'pending') {
          this.addWalletTransaction(
            bet.user_id,
            'deposit',
            bet.amount,
            `Remboursement avant suppression du pari #${betId}: ${reason}`,
            betId.toString()
          );
        }
        
        // Supprimer le pari de la base de données
        this.db.prepare('DELETE FROM bets WHERE id = ?').run(betId);
        
        // Supprimer les transactions liées si nécessaire
        this.db.prepare('DELETE FROM wallet_transactions WHERE reference_id = ?').run(betId.toString());
        
        console.log(`Pari #${betId} supprimé définitivement: ${reason}`);
      });
      
      transaction();
      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression du pari:', error);
      return false;
    }
  }

  // Nettoyer automatiquement les paris problématiques
  cleanupProblematicBets(): { cancelled: number; deleted: number } {
    try {
      let cancelledCount = 0;
      let deletedCount = 0;
      
      // Récupérer tous les paris avec des problèmes potentiels
      const problematicBets = this.getProblematicBets();
      
      console.log(`Trouvé ${problematicBets.length} paris problématiques`);
      
      for (const bet of problematicBets) {
        let reason = '';
        let shouldDelete = false;
        
        // Déterminer la raison et l'action à prendre
        if (!bet.match_status) {
          reason = 'Match associé n\'existe plus';
          shouldDelete = true; // Supprimer car le match n'existe plus
        } else if (bet.game === 'Unknown Game') {
          reason = 'Jeu du match inconnu ou invalide';
          shouldDelete = false; // Juste annuler, le match pourrait être fixé
        } else {
          reason = 'Équipe pariée invalide pour ce match';
          shouldDelete = false; // Juste annuler
        }
        
        if (shouldDelete) {
          if (this.deleteBet(bet.id, reason)) {
            deletedCount++;
          }
        } else {
          if (this.cancelBet(bet.id, reason)) {
            cancelledCount++;
          }
        }
      }
      
      console.log(`Nettoyage terminé: ${cancelledCount} paris annulés, ${deletedCount} paris supprimés`);
      return { cancelled: cancelledCount, deleted: deletedCount };
      
    } catch (error) {
      console.error('Erreur lors du nettoyage des paris problématiques:', error);
      return { cancelled: 0, deleted: 0 };
    }
  }

  // Récupérer la liste des paris problématiques
  getProblematicBets(): any[] {
    try {
      return this.db.prepare(`
        SELECT 
          b.*,
          COALESCE(m.game, 'Unknown Game') as game,
          m.status as match_status,
          m.tournament,
          bet_team.name as bet_team_name
        FROM bets b
        LEFT JOIN matches m ON b.match_id = m.id
        LEFT JOIN teams bet_team ON b.team_id = bet_team.id
        WHERE b.status = 'pending'
        AND (
          m.id IS NULL OR                           -- Match n'existe plus
          COALESCE(m.game, 'Unknown Game') = 'Unknown Game' OR  -- Jeu inconnu
          m.status IS NULL OR                       -- Statut du match invalide
          b.team_id NOT IN (m.team1_id, m.team2_id) -- Équipe pariée n'existe plus dans le match
        )
        ORDER BY b.placed_at DESC
      `).all() as any[];
    } catch (error) {
      console.error('Erreur lors de la récupération des paris problématiques:', error);
      return [];
    }
  }

  // Finaliser un match avec un gagnant (pour la simulation)
  finalizeMatch(matchId: number, winnerId: number): boolean {
    try {
      const transaction = this.db.transaction(() => {
        // Mettre à jour le match avec le gagnant et le statut
        this.db.prepare(`
          UPDATE matches 
          SET status = 'finished', winner_id = ? 
          WHERE id = ?
        `).run(winnerId, matchId);

        // Traiter tous les paris pour ce match
        const bets = this.db.prepare(`
          SELECT * FROM bets WHERE match_id = ? AND status = 'pending'
        `).all(matchId) as any[];

        for (const bet of bets) {
          const isWinner = bet.team_id === winnerId;
          const newStatus = isWinner ? 'won' : 'lost';
          
          // Mettre à jour le statut du pari
          this.db.prepare(`
            UPDATE bets SET status = ? WHERE id = ?
          `).run(newStatus, bet.id);

          // Si gagné, ajouter les gains au portefeuille
          if (isWinner) {
            this.addWalletTransaction(
              bet.user_id,
              'win',
              bet.potential_payout,
              `Gains du pari #${bet.id}`,
              bet.id.toString()
            );
          }
        }
      });

      transaction();
      return true;
    } catch (error) {
      console.error('Erreur lors de la finalisation du match:', error);
      return false;
    }
  }

  // Simuler la finalisation de matchs terminés sans gagnant défini
  simulateMatchOutcomes(): void {
    try {
      const finishedMatches = this.db.prepare(`
        SELECT id, team1_id, team2_id FROM matches 
        WHERE status = 'finished' AND winner_id IS NULL
      `).all() as any[];

      for (const match of finishedMatches) {
        // Simulation aléatoire mais cohérente basée sur l'ID du match
        const seed = match.id * 54321;
        const random = (seed % 1000) / 1000;
        const winnerId = random > 0.5 ? match.team1_id : match.team2_id;
        
        this.finalizeMatch(match.id, winnerId);
      }
    } catch (error) {
      console.error('Erreur lors de la simulation des résultats:', error);
    }
  }
}

// Instance singleton du service
export const dbService = new DatabaseService();