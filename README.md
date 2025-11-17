# 🎮 GrandPari - Plateforme de Paris Esports

Une plateforme moderne de paris esports développée avec Next.js 14, proposant le suivi de matchs en temps réel, l'authentification utilisateur et une interface de paris élégante.

## 🌐 Démo en Ligne

L'application est disponible en production à l'adresse : **https://fin-projet.vercel.app/**

**Accès Administrateur :**
- **Utilisateur :** `admin`
- **Mot de passe :** `EpsiEpsi2025`

## 📋 Aperçu du Projet

GrandPari est une application de paris esports qui permet aux utilisateurs de :
- Consulter les matchs esports en direct et programmés
- Placer des paris sur leurs équipes favorites
- Suivre l'historique de leurs paris et leur solde
- Gérer les matchs et les équipes (fonctionnalités admin)

## 🛠️ Technologies Utilisées

- **Framework :** Next.js 14 (App Router)
- **Langage :** TypeScript
- **Styles :** Tailwind CSS
- **Composants UI :** Radix UI + shadcn/ui
- **Animations :** Framer Motion
- **Authentification :** Clerk
- **Base de données :** Supabase (PostgreSQL) + SQLite (local)

## 📦 Dépendances Principales

- `@clerk/nextjs` - Authentification utilisateur
- `@supabase/supabase-js` - Gestion de la base de données
- `framer-motion` - Animations fluides
- `lucide-react` - Bibliothèque d'icônes
- `recharts` - Visualisation de données
- `better-sqlite3` - Base de données locale

## 🚀 Installation et Démarrage

### Prérequis

- Node.js 18+ installé
- npm ou yarn
- Un compte Clerk (pour l'authentification)
- Un compte Supabase (pour la base de données)

### Installation

1. **Cloner le repository**
```bash
git clone https://github.com/giantprolu/Fin-projet.git
cd Fin-projet
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configurer les variables d'environnement**

Créer un fichier `.env.local` à la racine du projet :

```env
# Authentification Clerk
# Obtenez ces clés sur : https://dashboard.clerk.com/
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=votre_clerk_publishable_key
CLERK_SECRET_KEY=votre_clerk_secret_key

# Configuration Supabase
# Obtenez ces clés sur : https://supabase.com/dashboard
NEXT_PUBLIC_SUPABASE_URL=votre_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=votre_supabase_service_role_key

# Utilisateurs Admin (IDs Clerk séparés par des virgules)
NEXT_PUBLIC_ADMIN_USER_IDS=votre_user_id_clerk
```

**Note :** Pour obtenir vos propres clés :
- **Clerk :** Créez un compte sur [clerk.com](https://clerk.com), créez une application et copiez les clés
- **Supabase :** Créez un projet sur [supabase.com](https://supabase.com) et récupérez les clés dans Settings > API

4. **Initialiser la base de données**

Exécutez le script SQL dans votre tableau de bord Supabase :
```bash
# Le script se trouve dans : supabase-init-simple.sql
```

Cela créera les tables nécessaires :
- `teams` - Équipes esports
- `matches` - Informations sur les matchs
- `users` - Profils utilisateurs
- `bets` - Historique des paris
- `wallet_transactions` - Historique des transactions

## 🎮 Lancer le Projet

### Mode Développement

```bash
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

### Build de Production (Local)

```bash
npm run build
npm start
```

### Autres Commandes

```bash
# Vérification des types TypeScript
npm run typecheck

# Linter
npm run lint
```

## 📁 Structure du Projet

```
Fin-projet/
├── app/                      # Next.js App Router
│   ├── api/                  # Routes API
│   │   ├── matches/          # API des matchs
│   │   ├── teams/            # API des équipes
│   │   ├── bets/             # API des paris
│   │   └── users/            # API des utilisateurs
│   ├── admin/                # Tableau de bord admin
│   ├── parier/               # Page de paris
│   ├── resultats/            # Page des résultats
│   └── styles/               # Styles spécifiques aux pages
├── components/               # Composants réutilisables
│   ├── ui/                   # Composants UI (shadcn)
│   ├── Navigation.tsx        # Navigation principale
│   └── FloatingElements.tsx  # Animations d'arrière-plan
├── hooks/                    # Hooks React personnalisés
│   ├── use-user-balance.ts   # Gestion du portefeuille
│   └── use-toast.ts          # Notifications toast
├── lib/                      # Bibliothèques utilitaires
│   ├── db-service.ts         # Service base de données SQLite
│   ├── db-supabase.ts        # Service Supabase
│   └── supabase.ts           # Client Supabase
├── public/                   # Assets statiques
│   └── assets/               # Logos d'équipes et images
├── scripts/                  # Scripts utilitaires
└── middleware.ts             # Middleware Next.js
```

## 🎯 Fonctionnalités

### Utilisateurs
- **Authentification :** Inscription/connexion sécurisée avec Clerk
- **Système de Paris :** Placer des paris sur les matchs en direct et programmés
- **Gestion du Portefeuille :** Suivi du solde et de l'historique des transactions
- **Tableau de Bord :** Consulter l'historique des paris et les statistiques de performance
- **Design Responsive :** Interface adaptée à tous les appareils

### Administrateurs
- **Gestion des Matchs :** Créer, modifier et supprimer des matchs
- **Gestion des Équipes :** Gérer les informations des équipes
- **Administration des Paris :** Voir et gérer tous les paris utilisateurs
- **Nettoyage de la Base :** Outils de maintenance des données

## 📊 Schéma de la Base de Données

### Table Teams (Équipes)
```sql
- id (UUID)
- name (texte)
- tag (texte)
- country (texte)
- logo_url (texte)
- founded_year (nombre)
- total_earnings (nombre)
```

### Table Matches (Matchs)
```sql
- id (nombre)
- team1_id (UUID)
- team2_id (UUID)
- team1_odds (décimal)
- team2_odds (décimal)
- game (texte)
- tournament (texte)
- match_date (date)
- match_time (heure)
- status (texte)
- winner_id (UUID)
```

### Table Users (Utilisateurs)
```sql
- id (nombre)
- clerk_id (texte)
- email (texte)
- username (texte)
- balance (décimal)
- total_bet (décimal)
- total_won (décimal)
```

### Table Bets (Paris)
```sql
- id (UUID)
- user_id (nombre)
- match_id (nombre)
- team_id (UUID)
- amount (décimal)
- odds (décimal)
- potential_payout (décimal)
- status (texte: pending/won/lost/cancelled)
- placed_at (timestamp)
```

## 🎨 Design System

Le projet utilise un système de design personnalisé avec :
- **Couleur Primaire :** Copper (#C79081)
- **Couleur Secondaire :** Sage/Teal (#14B8A6)
- **Thème Sombre :** Tons de Slate
- Fichiers CSS personnalisés pour chaque page dans `app/styles/`

## 🔧 Fichiers de Configuration

- `next.config.js` - Configuration Next.js
- `tailwind.config.ts` - Personnalisation Tailwind CSS
- `tsconfig.json` - Configuration TypeScript
- `components.json` - Configuration shadcn/ui
- `package.json` - Dépendances et scripts

## 🐛 Dépannage

### L'API retourne un tableau vide
Vérifiez que toutes les variables d'environnement sont correctement définies dans `.env.local`.

### Problèmes de connexion à la base de données
Vérifiez vos identifiants Supabase et assurez-vous que les tables sont correctement initialisées.

### Erreurs de build
Exécutez `npm run typecheck` pour identifier les erreurs TypeScript avant le build.

### Erreur "Module not found"
```bash
# Supprimer node_modules et réinstaller
rm -rf node_modules package-lock.json
npm install
```

## 📝 Points Importants

- **Premier lancement :** Lors de la première inscription, chaque utilisateur reçoit 1000€ de solde initial
- **Base de données locale :** Le projet utilise SQLite en local (fichier `.db`) et Supabase pour la production
- **Admin :** Pour être admin localement, ajoutez votre ID utilisateur Clerk dans `NEXT_PUBLIC_ADMIN_USER_IDS`
- **Logos d'équipes :** Placez les logos dans `/public/assets/`

## 🎓 Structure du Code

### Routes API
- `/api/matches` - Liste et création de matchs
- `/api/teams` - Gestion des équipes
- `/api/bets` - Placement et suivi des paris
- `/api/users/balance` - Gestion du portefeuille

### Pages Principales
- `/` - Page d'accueil
- `/parier` - Interface de paris
- `/resultats` - Historique et statistiques
- `/admin` - Tableau de bord administrateur

## 👤 Auteur

**giantprolu** - [Profil GitHub](https://github.com/giantprolu)

## 🙏 Remerciements

- Construit avec [Next.js](https://nextjs.org/)
- Composants UI de [shadcn/ui](https://ui.shadcn.com/)
- Authentification par [Clerk](https://clerk.com/)
- Base de données [Supabase](https://supabase.com/)
- Icônes [Lucide](https://lucide.dev/)
