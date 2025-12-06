# 🚀 L1TRIANGLE STORE - Guide de Démarrage

## 📋 Prérequis
- **Node.js** installé (https://nodejs.org)
- Les fichiers du projet dans le dossier

## 🎯 Démarrage Rapide

### Windows (Recommandé)
1. **Double-cliquez sur `DEMARRER.bat`**
2. Attendez le message "Serveur prêt"
3. Ouvrez `http://172.29.192.1:3000`

### Terminal PowerShell
```powershell
cd "C:\Users\senat\Desktop\New folder (3)"
npm start
```

### Terminal CMD
```cmd
cd "C:\Users\senat\Desktop\New folder (3)"
npm start
```

## 🌐 Accès au Serveur

| Type | URL | Appareil |
|------|-----|----------|
| **Local** | `http://localhost:3000` | Cet ordinateur |
| **Réseau** | `http://172.29.192.1:3000` | Autres appareils |
| **Admin** | `http://172.29.192.1:3000/admin-login.html` | Dashboard |
| **Boutique** | `http://172.29.192.1:3000/index.html` | Store |

## 🔐 Identifiants Admin
- **Code d'accès** : `L1_TRIANGLE`

## 📱 Utilisation Multi-Appareils

### Sur le même WiFi :
1. Assurez-vous que le serveur tourne
2. Sur l'autre appareil (téléphone, tablette, etc.)
3. Ouvrez `http://172.29.192.1:3000` dans le navigateur
4. Les produits se chargent automatiquement
5. Les modifications sont synchronisées en temps réel

### ⚠️ Important :
- **NE PAS utiliser Netlify** pour l'admin (utiliser l'IP locale)
- **TOUS les appareils doivent être sur le MÊME WiFi**
- Si ça ne fonctionne pas : vérifiez le pare-feu Windows

## 📊 Structure du Projet

```
New folder (3)/
├── DEMARRER.bat           # 🚀 Lanceur principal
├── api-server.js          # 🔧 Serveur API Node.js
├── config.js              # ⚙️ Configuration API
├── panier-api.js          # 🛒 Gestion du panier
├── admin-dashboard.js     # 👤 Interface admin
├── index.html             # 🛍️ Boutique
├── admin-login.html       # 🔐 Login admin
├── package.json           # 📦 Dépendances
├── database.json          # 💾 Base de données
└── README.md              # 📖 Ce fichier
```

## 🐛 Dépannage

### Le serveur ne démarre pas
- Vérifiez que **Node.js est installé** : `node --version`
- Vérifiez que **npm fonctionne** : `npm --version`
- Réinstallez les dépendances : `npm install`

### Les autres appareils ne peuvent pas se connecter
- ✅ Vérifiez que **le serveur tourne**
- ✅ Vérifiez que vous utilisez **`http://172.29.192.1:3000`** (pas localhost)
- ✅ Vérifiez que **tous les appareils sont sur le MÊME WiFi**
- ✅ Vérifiez le **pare-feu Windows** (port 3000 doit être autorisé)

### Les produits ne se sauvegardent pas
- Vérifiez que le serveur tourne (pas d'erreur en rouge)
- Ouvrez **F12** et regardez l'onglet **Console** pour les erreurs
- Vérifiez que vous utilisez **l'IP locale** (`172.29.192.1:3000`)

## 🔧 Commandes Utiles

```bash
# Démarrer le serveur
npm start

# Développement (avec rechargement automatique)
npm run dev

# Vérifier Node.js
node --version

# Vérifier npm
npm --version
```

## 💾 Base de Données
- Tous les produits, commandes et logs sont stockés dans `database.json`
- Modifications automatiquement sauvegardées
- Accessible depuis tous les appareils

## 📞 Support
En cas de problème, vérifiez :
1. Le terminal où le serveur tourne (erreurs rouges ?)
2. La console du navigateur (F12 → Console)
3. Le pare-feu Windows (port 3000 ouvert ?)
4. Que le WiFi est partagé entre tous les appareils
