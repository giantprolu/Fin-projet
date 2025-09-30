# Fin-projet
Plan condensé (MVP → POC)

### Choix tech (recommandé POC)

Front : Next.js (TS) + React + TailwindCSS

Back : API routes Next.js (ou petit Express)

DB : Postgres (dev: SQLite acceptable) + Prisma (ORM)

Stockage images : Cloudinary / S3 (ou /public/uploads pour POC)

Auth (optionnel) : fake session (localStorage) pour POC ou NextAuth/Supabase si tu veux réel

### Initialiser repo & dev env

npx create-next-app@latest my-esports-bets --typescript

Installer Tailwind, Prisma, @prisma/client, etc.

Init git, créer README minimal (but important).

### DB : schéma minimal (penser à ton export SQL)

Tables/modèles essentiels : Team, Match, User, Bet, Transaction

Champs clefs (résumé) :

Team { id, name, slug, imgUrl }

Match { id, teamAId, teamBId, startAt, status (scheduled|live|finished), scoreA, scoreB, oddsA, oddsB }

User { id, name, balance } (pour POC, balance simulée)

Bet { id, userId, matchId, teamId, stake, odds, payout, status (open|won|lost) }

Transaction { id, userId, amount, type, meta }

Si tu as un export SQL -> importe dans Postgres ou convertis en seed via Prisma.

### Seed data

Charger équipes et quelques matches (utilise ton export SQL si utile).

Créer 3–5 users factices (pour tester gains/pertes).

### API CRUD (Back)

GET /api/teams, POST /api/teams, PUT /api/teams/:id, DELETE /api/teams/:id

GET /api/matches, POST /api/matches, PUT /api/matches/:id, DELETE /api/matches/:id

POST /api/bets (place bet) — vérifie solde, conserve odds, réserve montant

POST /api/matches/:id/resolve (admin) → marque match fini, calcule résultats, paye les gagnants (création transaction + update balance + update bets)

### Admin UI (pages protégées / simple)

Page admin/teams : formulaire CRUD + upload image (upload direct Cloudinary ou champ URL)

Page admin/matches : créer match (choisir équipes, odds, date), modifier status/scoring, bouton resolve

Protection simple : local token ENV (POC) ou login basique

### Visitor UI (UX de pari)

Landing : pitch + CTA “Parier maintenant”

Page matches : lister matchs ouverts (status scheduled/live), montrer odds (decimal), bouton Parier

Modal/form pari : sélectionner équipe, montant, aperçu payout (payout = stake * odds)

Afficher bets de l’utilisateur, solde courant, historique + détail gains/pertes

### Logique pari & règlements

Odds : modèle decimal → payout = stake * odds

Vérifier funds before placing: if stake > balance => error

À la résolution : pour chaque bet sur vainqueur -> payout = stake * odds ; créditer user, marquer bet won ou lost

Penser à garder les odds et stake immuables après placement (snapshots)

### Upload images

POC simple : input file → POST /api/upload → sauvegarde dans /public/uploads (dev)

Prod : Cloudinary/S3 upload direct depuis frontend (presigned)

### Match lifecycle & UI states

Status: scheduled → live → finished

Admin change status + update scores en live

Frontend : rafraîchir listes via polling simple (setInterval) ou WebSocket (bonus)

### Tests manuels (checklist)

Créer équipe ✅

Créer match ✅

Placer pari avec solde insuffisant => erreur ✅

Résoudre match, vérifier gains transférés ✅

Supprimer/éditer équipe et match (admin) ✅

### Déploiement POC

Front+API = Vercel (Next.js natif)

DB = Railway / Supabase / Neon / PlanetScale (Postgres)

Stockage images = Cloudinary

Mettre DATABASE_URL en env, push, vérifier migrations Prisma

# Checklist minimale à livrer au VC (acceptance criteria)

 Landing clair + CTA

 Admin : CRUD équipes (avec upload image)

 Admin : CRUD matches + resolve match

 Visiteur : lister matches + possibilité de parier (sauvegarde bet)

 Visiteur : voir historique de paris + solde + gains/pertes calculés

 Seed data et scripts d’import de ton export SQL

# Bonus 

WebSocket pour mises à jour live (Pusher / Socket.io)

Multi-bets / combinés

Bookmaker simple : calcul automatique des odds selon volume des mises

UI/UX : animations, micro-interactions, thème néon e-sport, leaderboard des winners

Intégrer vrai auth (NextAuth / Supabase) et KYC minimal (si besoin légal)

### Astuces pratiques et pièges à éviter

Snapshop des odds : enregistre odds au moment du pari (éviter manipulation)

Atomicité : lors du placement de pari, faites une transaction DB (débit balance + insertion bet)

Validation côté serveur : tout vérifier côté API (ne pas faire confiance au frontend)

Images : pour POC, public/uploads suffit ; pour scale, passer à Cloudinary/S3

Logs : journaliser les résolutions de match et transactions pour audit
