const Database = require('better-sqlite3');
const path = require('path');

// Connexion à la base de données
const dbPath = path.join(__dirname, '..', 'sqllite_esport_betting.db');
const db = new Database(dbPath, { readonly: true });

console.log('=== STRUCTURE DE LA BASE DE DONNÉES ===\n');

// Obtenir la liste des tables
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();

console.log('Tables trouvées:');
tables.forEach(table => {
  console.log(`- ${table.name}`);
});

console.log('\n=== SCHÉMA DES TABLES ===\n');

// Pour chaque table, afficher le schéma
tables.forEach(table => {
  console.log(`\n--- Table: ${table.name} ---`);
  
  // Obtenir le schéma de la table
  const schema = db.prepare(`PRAGMA table_info(${table.name})`).all();
  
  console.log('Colonnes:');
  schema.forEach(col => {
    console.log(`  ${col.name}: ${col.type}${col.notnull ? ' NOT NULL' : ''}${col.pk ? ' PRIMARY KEY' : ''}${col.dflt_value ? ` DEFAULT ${col.dflt_value}` : ''}`);
  });
  
  // Compter les enregistrements
  const count = db.prepare(`SELECT COUNT(*) as count FROM ${table.name}`).get();
  console.log(`Nombre d'enregistrements: ${count.count}`);
  
  // Afficher quelques exemples de données si la table n'est pas vide
  if (count.count > 0) {
    console.log('\nExemples de données:');
    const samples = db.prepare(`SELECT * FROM ${table.name} LIMIT 3`).all();
    samples.forEach((row, index) => {
      console.log(`  Ligne ${index + 1}:`, JSON.stringify(row, null, 2));
    });
  }
});

db.close();
console.log('\n=== FIN DE L\'INSPECTION ===');