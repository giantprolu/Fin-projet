const { DatabaseService } = require('./lib/db-service.ts');

console.log('Test de récupération des équipes...');

try {
  const db = new DatabaseService();
  const teams = db.getTeams();
  
  console.log(`Nombre d'équipes trouvées: ${teams.length}`);
  console.log('Équipes:');
  teams.forEach(team => {
    console.log(`- ${team.name} (${team.tag}) - Logo: ${team.logo_url}`);
  });
  
} catch (error) {
  console.error('Erreur:', error);
}