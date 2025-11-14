-- Script d'initialisation de la base de données Supabase
-- À exécuter dans le SQL Editor de Supabase

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
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'live', 'finished', 'cancelled')),
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
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'won', 'lost', 'cancelled')),
  placed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Table des transactions du portefeuille
CREATE TABLE IF NOT EXISTS wallet_transactions (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('bet', 'win', 'deposit', 'withdrawal', 'refund')),
  amount REAL NOT NULL,
  description TEXT NOT NULL,
  reference_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Créer des index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_matches_date ON matches(match_date, match_time);
CREATE INDEX IF NOT EXISTS idx_matches_status ON matches(status);
CREATE INDEX IF NOT EXISTS idx_bets_user ON bets(user_id);
CREATE INDEX IF NOT EXISTS idx_bets_match ON bets(match_id);
CREATE INDEX IF NOT EXISTS idx_bets_status ON bets(status);
CREATE INDEX IF NOT EXISTS idx_users_clerk ON users(clerk_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_user ON wallet_transactions(user_id);

-- Insérer des données de démonstration
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

-- Insérer des matchs de démonstration
INSERT INTO matches (team1_id, team2_id, game, tournament, match_date, match_time, status, team1_odds, team2_odds) VALUES
  (1, 2, 'Valorant', 'VCT Masters', CURRENT_DATE + INTERVAL '1 day', '18:00', 'scheduled', 1.85, 2.10),
  (3, 4, 'League of Legends', 'LEC Spring', CURRENT_DATE + INTERVAL '1 day', '20:00', 'scheduled', 1.65, 2.30),
  (1, 3, 'CS:GO', 'IEM Katowice', CURRENT_DATE + INTERVAL '2 days', '16:00', 'scheduled', 1.90, 1.95),
  (5, 6, 'Valorant', 'VCT Challengers', CURRENT_DATE + INTERVAL '2 days', '19:00', 'scheduled', 2.00, 1.85),
  (7, 8, 'League of Legends', 'LFL Division 1', CURRENT_DATE + INTERVAL '3 days', '17:00', 'scheduled', 1.75, 2.15)
ON CONFLICT DO NOTHING;

-- Activer Row Level Security (RLS)
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE bets ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;

-- Politique RLS : Tout le monde peut lire les équipes et matchs
CREATE POLICY "Lecture publique teams" ON teams FOR SELECT USING (true);
CREATE POLICY "Lecture publique matches" ON matches FOR SELECT USING (true);

-- Politique RLS : Les utilisateurs peuvent lire leurs propres données
CREATE POLICY "Lecture propres données users" ON users FOR SELECT USING (true);
CREATE POLICY "Lecture propres paris" ON bets FOR SELECT USING (true);
CREATE POLICY "Lecture propres transactions" ON wallet_transactions FOR SELECT USING (true);

-- Politique RLS : Opérations admin nécessitent service_role
CREATE POLICY "Admin peut tout faire teams" ON teams FOR ALL USING (true);
CREATE POLICY "Admin peut tout faire matches" ON matches FOR ALL USING (true);
CREATE POLICY "Admin peut tout faire users" ON users FOR ALL USING (true);
CREATE POLICY "Admin peut tout faire bets" ON bets FOR ALL USING (true);
CREATE POLICY "Admin peut tout faire transactions" ON wallet_transactions FOR ALL USING (true);

-- Message de confirmation
SELECT 'Base de données initialisée avec succès!' as message;
