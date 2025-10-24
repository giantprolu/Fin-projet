const Database = require('better-sqlite3');
const path = require('path');

// Connexion à la base de données
const dbPath = path.join(process.cwd(), 'sqllite_esport_betting.db');
const db = new Database(dbPath);

try {
  // Équipes supplémentaires à ajouter
  const additionalTeams = [
    { name: 'Gentle Mates', tag: 'GM', logo_url: '/assets/gentlemates.webp' },
    { name: 'GamersOrigin', tag: 'GO', logo_url: '/assets/GamersOrigin.png' },
    { name: 'MCES', tag: 'MCES', logo_url: '/assets/MCES.png' },
    { name: 'Mandatory', tag: 'MND', logo_url: '/assets/Mandatory.png' },
    { name: 'Atlético', tag: 'ATL', logo_url: '/assets/atletico.webp' }
  ];

  const insertTeam = db.prepare(`
    INSERT OR IGNORE INTO teams (name, tag, country, logo_url, founded_year, total_earnings)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  for (const team of additionalTeams) {
    insertTeam.run(team.name, team.tag, 'FR', team.logo_url, 2020, 500000);
    console.log(`Équipe ajoutée: ${team.name}`);
  }

  // Afficher toutes les équipes
  const allTeams = db.prepare('SELECT * FROM teams ORDER BY name').all();
  console.log('\nToutes les équipes en base:');
  allTeams.forEach(team => {
    console.log(`- ${team.name} (${team.tag}) - ${team.logo_url}`);
  });

  console.log(`\nTotal: ${allTeams.length} équipes`);

} catch (error) {
  console.error('Erreur:', error);
} finally {
  db.close();
}