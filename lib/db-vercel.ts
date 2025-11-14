import { sql } from '@vercel/postgres';
import { type Team } from './database';

// Service de base de données compatible avec Vercel Postgres
export class VercelDatabaseService {
  
  // Initialiser les tables
  async initializeTables() {
    try {
      // Créer la table teams
      await sql`
        CREATE TABLE IF NOT EXISTS teams (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL,
          tag TEXT UNIQUE NOT NULL,
          country TEXT NOT NULL DEFAULT 'FR',
          logo_url TEXT,
          founded_year INTEGER,
          total_earnings INTEGER DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;

      // Créer la table matches
      await sql`
        CREATE TABLE IF NOT EXISTS matches (
          id SERIAL PRIMARY KEY,
          team1_id INTEGER REFERENCES teams(id),
          team2_id INTEGER REFERENCES teams(id),
          game TEXT NOT NULL,
          tournament TEXT NOT NULL,
          match_date DATE NOT NULL,
          match_time TIME NOT NULL,
          status TEXT DEFAULT 'scheduled',
          team1_odds REAL DEFAULT 2.0,
          team2_odds REAL DEFAULT 2.0,
          winner_id INTEGER REFERENCES teams(id),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;

      // Créer la table users
      await sql`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          clerk_id TEXT UNIQUE NOT NULL,
          username TEXT NOT NULL,
          email TEXT NOT NULL,
          balance REAL DEFAULT 0,
          total_bet REAL DEFAULT 0,
          total_won REAL DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;

      console.log('Tables Postgres créées avec succès');
    } catch (error) {
      console.error('Erreur lors de la création des tables:', error);
    }
  }

  // Obtenir toutes les équipes
  async getTeams(): Promise<Team[]> {
    try {
      const result = await sql`SELECT * FROM teams ORDER BY name`;
      return result.rows as Team[];
    } catch (error) {
      console.error('Erreur lors de la récupération des équipes:', error);
      return [];
    }
  }

  // Créer une équipe
  async createTeam(team: Omit<Team, 'id' | 'created_at'>): Promise<Team | null> {
    try {
      const result = await sql`
        INSERT INTO teams (name, tag, country, logo_url, founded_year, total_earnings)
        VALUES (${team.name}, ${team.tag}, ${team.country}, ${team.logo_url}, ${team.founded_year}, ${team.total_earnings})
        RETURNING *
      `;
      return result.rows[0] as Team;
    } catch (error) {
      console.error('Erreur lors de la création de l\'équipe:', error);
      return null;
    }
  }

  // Mettre à jour une équipe
  async updateTeam(id: string, team: Partial<Omit<Team, 'id' | 'created_at'>>): Promise<Team | null> {
    try {
      const result = await sql`
        UPDATE teams
        SET 
          name = COALESCE(${team.name}, name),
          tag = COALESCE(${team.tag}, tag),
          country = COALESCE(${team.country}, country),
          logo_url = COALESCE(${team.logo_url}, logo_url),
          founded_year = COALESCE(${team.founded_year}, founded_year),
          total_earnings = COALESCE(${team.total_earnings}, total_earnings)
        WHERE id = ${id}
        RETURNING *
      `;
      return result.rows[0] as Team;
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'équipe:', error);
      return null;
    }
  }

  // Supprimer une équipe
  async deleteTeam(id: string): Promise<boolean> {
    try {
      await sql`DELETE FROM teams WHERE id = ${id}`;
      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'équipe:', error);
      return false;
    }
  }

  // Vérifier si un tag existe
  async teamTagExists(tag: string, excludeId?: string): Promise<boolean> {
    try {
      const result = excludeId
        ? await sql`SELECT COUNT(*) as count FROM teams WHERE tag = ${tag} AND id != ${excludeId}`
        : await sql`SELECT COUNT(*) as count FROM teams WHERE tag = ${tag}`;
      
      return (result.rows[0] as any).count > 0;
    } catch (error) {
      console.error('Erreur lors de la vérification du tag:', error);
      return false;
    }
  }
}

export const vercelDbService = new VercelDatabaseService();
