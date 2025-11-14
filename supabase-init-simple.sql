-- 🚀 Script d'initialisation rapide pour Supabase
-- Copiez tout ce contenu et exécutez-le dans le SQL Editor de Supabase
-- https://supabase.com/dashboard/project/wnjcdjdetcugafigagzz/editor/sql

-- ============================================
-- PARTIE 1 : CRÉATION DES TABLES
-- ============================================

-- Table des équipes
CREATE TABLE IF NOT EXISTS teams (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  tag TEXT UNIQUE NOT NULL,
  country TEXT NOT NULL DEFAULT 'FR',
  logo_url TEXT,
  founded_year INTEGER,
  total_earnings INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des matchs
CREATE TABLE IF NOT EXISTS matches (
  id BIGSERIAL PRIMARY KEY,
  team1_id BIGINT REFERENCES teams(id) ON DELETE CASCADE,
  team2_id BIGINT REFERENCES teams(id) ON DELETE CASCADE,
  game TEXT NOT NULL,
  tournament TEXT NOT NULL,
  match_date DATE NOT NULL,
  match_time TIME NOT NULL,
  status TEXT DEFAULT 'scheduled',
  team1_odds REAL DEFAULT 2.0,
  team2_odds REAL DEFAULT 2.0,
  winner_id BIGINT REFERENCES teams(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des utilisateurs
CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  clerk_id TEXT UNIQUE NOT NULL,
  username TEXT NOT NULL,
  email TEXT NOT NULL,
  balance REAL DEFAULT 0,
  total_bet REAL DEFAULT 0,
  total_won REAL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des paris
CREATE TABLE IF NOT EXISTS bets (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  match_id BIGINT REFERENCES matches(id) ON DELETE CASCADE,
  team_id BIGINT REFERENCES teams(id) ON DELETE CASCADE,
  amount REAL NOT NULL,
  odds REAL NOT NULL,
  potential_payout REAL NOT NULL,
  status TEXT DEFAULT 'pending',
  placed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Table des transactions
CREATE TABLE IF NOT EXISTS wallet_transactions (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  amount REAL NOT NULL,
  description TEXT NOT NULL,
  reference_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- PARTIE 2 : INDEX POUR LES PERFORMANCES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_matches_date ON matches(match_date, match_time);
CREATE INDEX IF NOT EXISTS idx_matches_status ON matches(status);
CREATE INDEX IF NOT EXISTS idx_bets_user ON bets(user_id);
CREATE INDEX IF NOT EXISTS idx_bets_match ON bets(match_id);
CREATE INDEX IF NOT EXISTS idx_users_clerk ON users(clerk_id);

-- ============================================
-- PARTIE 3 : DONNÉES DE DÉMONSTRATION
-- ============================================

-- Insertion des équipes
INSERT INTO teams (name, tag, country, logo_url, founded_year, total_earnings) VALUES
  ('Team Vitality', 'VIT', 'FR', '/assets/Team_Vitality_Logo_2018.png', 2013, 2500000),
  ('Karmine Corp', 'KC', 'FR', '/assets/Karmine_Corp.svg', 2020, 1200000),
  ('Team BDS', 'BDS', 'CH', '/assets/Team_BDS.png', 2018, 1800000),
  ('Solary', 'SLY', 'FR', '/assets/Logo_Solary.png', 2017, 800000),
  ('LDLC', 'LDLC', 'FR', '/assets/TeamLDLClogo.png', 2010, 1500000),
  ('Gentle Mates', 'GM', 'FR', '/assets/gentlemates.webp', 2021, 500000),
  ('GamersOrigin', 'GO', 'FR', '/assets/GamersOrigin.png', 2016, 600000),
  ('MCES', 'MCES', 'FR', '/assets/MCES.png', 2018, 400000)
ON CONFLICT (tag) DO NOTHING;

-- Insertion des matchs (dates relatives à aujourd'hui)
INSERT INTO matches (team1_id, team2_id, game, tournament, match_date, match_time, status, team1_odds, team2_odds) VALUES
  (1, 2, 'Valorant', 'VCT Masters', CURRENT_DATE + INTERVAL '1 day', '18:00', 'scheduled', 1.85, 2.10),
  (3, 4, 'League of Legends', 'LEC Spring', CURRENT_DATE + INTERVAL '1 day', '20:00', 'scheduled', 1.65, 2.30),
  (1, 3, 'CS:GO', 'IEM Katowice', CURRENT_DATE + INTERVAL '2 days', '16:00', 'scheduled', 1.90, 1.95),
  (5, 6, 'Valorant', 'VCT Challengers', CURRENT_DATE + INTERVAL '2 days', '19:00', 'scheduled', 2.00, 1.85),
  (7, 8, 'League of Legends', 'LFL Division 1', CURRENT_DATE + INTERVAL '3 days', '17:00', 'scheduled', 1.75, 2.15)
ON CONFLICT DO NOTHING;

-- ============================================
-- PARTIE 4 : ROW LEVEL SECURITY (RLS)
-- ============================================

-- Activer RLS sur toutes les tables
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE bets ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;

-- Politiques : Lecture publique pour teams et matches
DROP POLICY IF EXISTS "public_read_teams" ON teams;
CREATE POLICY "public_read_teams" ON teams FOR SELECT USING (true);

DROP POLICY IF EXISTS "public_read_matches" ON matches;
CREATE POLICY "public_read_matches" ON matches FOR SELECT USING (true);

-- Politiques : Accès complet pour service_role (bypass RLS)
DROP POLICY IF EXISTS "service_all_teams" ON teams;
CREATE POLICY "service_all_teams" ON teams FOR ALL USING (true);

DROP POLICY IF EXISTS "service_all_matches" ON matches;
CREATE POLICY "service_all_matches" ON matches FOR ALL USING (true);

DROP POLICY IF EXISTS "service_all_users" ON users;
CREATE POLICY "service_all_users" ON users FOR ALL USING (true);

DROP POLICY IF EXISTS "service_all_bets" ON bets;
CREATE POLICY "service_all_bets" ON bets FOR ALL USING (true);

DROP POLICY IF EXISTS "service_all_transactions" ON wallet_transactions;
CREATE POLICY "service_all_transactions" ON wallet_transactions FOR ALL USING (true);

-- ============================================
-- ✅ TERMINÉ !
-- ============================================

SELECT 
  '✅ Base de données initialisée avec succès!' as message,
  COUNT(*) as nombre_equipes 
FROM teams;

-- ============================================
-- 📦 CONFIGURATION DU STOCKAGE (STORAGE)
-- ============================================
-- ⚠️ IMPORTANT : Le stockage ne peut pas être créé via SQL
-- Vous devez créer manuellement un bucket dans Supabase :
--
-- 1. Allez dans Storage dans le menu de gauche
-- 2. Cliquez sur "Create a new bucket"
-- 3. Nom du bucket : "team-assets"
-- 4. Cochez "Public bucket" (pour que les images soient accessibles)
-- 5. Cliquez sur "Create bucket"
--
-- Une fois créé, les logos d'équipes seront uploadés automatiquement !
-- ============================================
