#!/usr/bin/env node

/**
 * Script de vérification de la configuration Supabase
 * Lance ce script pour vérifier que tout est bien configuré
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Vérification de la configuration Supabase...\n');

// Vérifier si .env.local existe
const envPath = path.join(__dirname, '.env.local');
if (!fs.existsSync(envPath)) {
  console.error('❌ Fichier .env.local introuvable !');
  console.log('📝 Créez le fichier .env.local à la racine du projet');
  process.exit(1);
}

// Lire le fichier .env.local
const envContent = fs.readFileSync(envPath, 'utf-8');

// Vérifier les variables Supabase
const requiredVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY'
];

let allGood = true;
const foundVars = {};

requiredVars.forEach(varName => {
  const regex = new RegExp(`${varName}=["']?([^"'\\n]+)["']?`);
  const match = envContent.match(regex);
  
  if (match && match[1] && !match[1].includes('REMPLACER')) {
    console.log(`✅ ${varName} : configuré`);
    foundVars[varName] = match[1];
  } else {
    console.log(`❌ ${varName} : manquant ou à remplacer`);
    allGood = false;
  }
});

console.log('\n---\n');

if (allGood) {
  console.log('✅ Toutes les variables Supabase sont configurées !');
  console.log('\n📊 Informations de connexion :');
  console.log(`   URL: ${foundVars.NEXT_PUBLIC_SUPABASE_URL}`);
  console.log(`   Anon Key: ${foundVars.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 20)}...`);
  console.log(`   Service Role Key: ${foundVars.SUPABASE_SERVICE_ROLE_KEY.substring(0, 20)}...`);
  console.log('\n🚀 Vous pouvez maintenant :');
  console.log('   1. Exécuter le script SQL dans Supabase (voir MIGRATION-SUPABASE.md)');
  console.log('   2. Lancer npm run dev');
  console.log('   3. Aller sur http://localhost:3000/admin/equipes');
} else {
  console.log('⚠️  Configuration incomplète !');
  console.log('\n📝 Pour obtenir vos clés Supabase :');
  console.log('   1. Allez sur https://supabase.com/dashboard/project/wnjcdjdetcugafigagzz');
  console.log('   2. Cliquez sur Settings > API');
  console.log('   3. Copiez les valeurs dans .env.local');
  console.log('\n📖 Consultez MIGRATION-SUPABASE.md pour plus de détails');
}

console.log('\n');
