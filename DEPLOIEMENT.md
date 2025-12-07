# L1TRIANGLE - Guide de Déploiement

## 🚀 Déployer sur Render.com (GRATUIT)

### Étape 1: Préparer GitHub
1. Créez un compte sur https://github.com (si pas déjà fait)
2. Créez un nouveau repository "l1triangle-shop"
3. Uploadez tous les fichiers de ce dossier

### Étape 2: Déployer sur Render
1. Allez sur https://render.com
2. Connectez-vous avec votre compte GitHub
3. Cliquez "New +" → "Web Service"
4. Sélectionnez votre repository "l1triangle-shop"
5. Configurez:
   - **Name**: l1triangle-shop
   - **Environment**: Node
   - **Build Command**: (laissez vide)
   - **Start Command**: `node api-server.js`
   - **Plan**: Free
6. Cliquez "Create Web Service"

### Étape 3: Accéder à votre site
Après quelques minutes, votre site sera accessible à:
```
https://l1triangle-shop.onrender.com
```

**URLs principales:**
- Boutique: `https://l1triangle-shop.onrender.com/index.html`
- Admin: `https://l1triangle-shop.onrender.com/admin-login-v2.html`

---

## 🌐 Alternative: Netlify + Backend séparé

### Frontend sur Netlify (GRATUIT)
1. Créez un compte sur https://netlify.com
2. Uploadez uniquement les fichiers HTML/CSS/JS
3. Votre site sera sur `https://votre-site.netlify.app`

### Backend sur Railway.app (GRATUIT)
1. Créez un compte sur https://railway.app
2. Déployez `api-server.js` + `database.json`
3. Récupérez l'URL de l'API
4. Mettez à jour `config.js` avec la nouvelle URL

---

## 📱 Accès depuis d'autres appareils (RÉSEAU LOCAL)

Si vous voulez juste accéder depuis d'autres appareils sur le **même WiFi**:

1. Le serveur est déjà configuré pour accepter les connexions
2. Utilisez l'URL: `http://172.29.192.1:3000`
3. Partagez cette URL avec les autres appareils

**⚠️ Important**: Cette solution fonctionne SEULEMENT sur le même réseau WiFi.

---

## 🔐 Sécurité

Le code admin `L1_TRIANGLE` est déjà sécurisé côté serveur.

Pour production, pensez à:
- Changer le code admin dans `api-server.js` (ligne 113)
- Utiliser des variables d'environnement
- Activer HTTPS (automatique sur Render/Netlify)

---

## 💡 Recommandation

Pour un accès **public** depuis n'importe où:
👉 **Utilisez Render.com** (le plus simple, gratuit, tout-en-un)
