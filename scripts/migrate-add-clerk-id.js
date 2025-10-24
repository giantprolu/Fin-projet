const Database = require('better-sqlite3');
const path = require('path');

// Chemin vers la base de données
const dbPath = path.join(__dirname, '..', 'sqllite_esport_betting.db');
const db = new Database(dbPath);

console.log('Migration: Ajout de la colonne clerk_id à la table users');

try {
  // Vérifier si la colonne clerk_id existe déjà
  const tableInfo = db.prepare("PRAGMA table_info(users)").all();
  const hasClerkId = tableInfo.some(column => column.name === 'clerk_id');
  
  if (!hasClerkId) {
    // Ajouter la colonne clerk_id (sans contrainte UNIQUE d'abord)
    db.exec(`
      ALTER TABLE users 
      ADD COLUMN clerk_id TEXT;
    `);
    
    console.log('✅ Colonne clerk_id ajoutée avec succès');
    
    // Créer un index unique sur clerk_id
    db.exec(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_users_clerk_id_unique ON users(clerk_id);
    `);
    
    console.log('✅ Index unique sur clerk_id créé');
  } else {
    console.log('ℹ️ La colonne clerk_id existe déjà');
  }
  
  // Vérifier la nouvelle structure
  const newTableInfo = db.prepare("PRAGMA table_info(users)").all();
  console.log('📋 Structure mise à jour de la table users:');
  newTableInfo.forEach(column => {
    console.log(`  - ${column.name}: ${column.type}${column.notnull ? ' NOT NULL' : ''}${column.dflt_value ? ` DEFAULT ${column.dflt_value}` : ''}`);
  });
  
} catch (error) {
  console.error('❌ Erreur lors de la migration:', error.message);
} finally {
  db.close();
  console.log('🔒 Connexion à la base de données fermée');
}