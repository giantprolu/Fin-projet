# 🚀 Configuration des Variables d'Environnement dans Vercel

## ⚠️ IMPORTANT : Sans ces variables, l'API retournera un tableau vide !

## 📋 Étapes détaillées

### 1️⃣ Aller dans les paramètres Vercel

1. Aller sur https://vercel.com/dashboard
2. Cliquer sur votre projet **fin-projet**
3. Cliquer sur l'onglet **Settings**
4. Dans le menu de gauche, cliquer sur **Environment Variables**

### 2️⃣ Ajouter les 3 variables Supabase

**Variable 1 : NEXT_PUBLIC_SUPABASE_URL**
```
Key: NEXT_PUBLIC_SUPABASE_URL
Value: https://wnjcdjdetcugafigagzz.supabase.co
Environments: ✅ Production ✅ Preview ✅ Development
```

**Variable 2 : NEXT_PUBLIC_SUPABASE_ANON_KEY**
```
Key: NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InduamNkamRldGN1Z2FmaWdhZ3p6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMwOTA5MTAsImV4cCI6MjA3ODY2NjkxMH0.Zc7a0Z3GPosqvVy3qvQ-61hQm2Us8Q2GPXMbxXlre0A
Environments: ✅ Production ✅ Preview ✅ Development
```

**Variable 3 : SUPABASE_SERVICE_ROLE_KEY**
```
Key: SUPABASE_SERVICE_ROLE_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InduamNkamRldGN1Z2FmaWdhZ3p6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzA5MDkxMCwiZXhwIjoyMDc4NjY2OTEwfQ.jBKaj528LZhp4ZcuG43AnPBg9fpGOsBtGwC3UO3-MW8
Environments: ✅ Production ✅ Preview ✅ Development
```

### 3️⃣ Important : Cocher tous les environnements

Pour chaque variable, assurez-vous de cocher les 3 cases :
- ✅ **Production** (production)
- ✅ **Preview** (preview)
- ✅ **Development** (development)

### 4️⃣ Redéployer l'application

Une fois les variables ajoutées, vous devez redéployer :

**Option A : Redéploiement automatique (recommandé)**
```bash
git commit --allow-empty -m "Trigger redeploy avec variables Supabase"
git push origin master
```

**Option B : Redéploiement manuel**
1. Aller dans l'onglet **Deployments**
2. Cliquer sur les **...** du dernier déploiement
3. Cliquer sur **Redeploy**
4. Confirmer

### 5️⃣ Vérifier la configuration

Une fois redéployé, testez :

1. **Test de configuration** :
   - Aller sur https://fin-projet.vercel.app/api/debug
   - Vous devriez voir :
   ```json
   {
     "supabaseUrl": "https://wnjcdjdetcugafigagzz.supabase.co",
     "hasAnonKey": true,
     "anonKeyLength": 219,
     "hasServiceKey": true,
     "serviceKeyLength": 222,
     "nodeEnv": "production",
     "vercelEnv": "production"
   }
   ```

2. **Test de l'API teams** :
   - Aller sur https://fin-projet.vercel.app/api/teams
   - Vous devriez voir un tableau avec 8 équipes

### 6️⃣ Si ça ne fonctionne toujours pas

1. Vérifier les logs :
   - Onglet **Deployments** → cliquer sur le déploiement → **Function Logs**
   - Chercher les erreurs

2. Vérifier que les variables sont bien présentes :
   - Settings → Environment Variables
   - Les 3 variables doivent être là avec les bonnes valeurs

3. Forcer un redéploiement complet :
   - Deployments → ... → Redeploy → **Use existing Build Cache** : ❌ DÉCOCHER

## 🎯 Résultat attendu

Après configuration, votre API `/api/teams` devrait retourner :

```json
[
  {
    "id": 1,
    "name": "Team Vitality",
    "tag": "VIT",
    "country": "FR",
    "logo_url": "/assets/Team_Vitality_Logo_2018.png",
    "founded_year": 2013,
    "total_earnings": 2500000,
    "created_at": "2025-11-14T..."
  },
  // ... 7 autres équipes
]
```

## 📝 Notes

- Les variables `NEXT_PUBLIC_*` sont accessibles côté client
- La variable `SUPABASE_SERVICE_ROLE_KEY` est SECRÈTE et n'est accessible que côté serveur
- Après modification des variables, TOUJOURS redéployer
- Les variables ne sont pas rétroactives (les anciens déploiements gardent les anciennes valeurs)

## 🆘 Besoin d'aide ?

Si après tout ça, l'API retourne toujours un tableau vide :
1. Vérifiez les Function Logs dans Vercel
2. Testez `/api/debug` pour voir si les variables sont présentes
3. Vérifiez que le script SQL a bien été exécuté dans Supabase (Table Editor)
