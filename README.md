# 🛍️ L1TRIANGLE STORE - Système d'Administration

## 📋 Description

Système complet de gestion pour L1triangle_store avec :
- ✅ Panneau d'administration sécurisé (Code: **L1_TRIANGLE**)
- ✅ Gestion des produits (ajout, modification, suppression)
- ✅ Suivi des commandes clients
- ✅ Base de données JSON externe avec API REST
- ✅ Historique complet des modifications
- ✅ Synchronisation en temps réel

## 🚀 Installation

### Prérequis
- Node.js (version 14 ou supérieure)
- Un navigateur web moderne

### Étapes d'installation

1. **Installer les dépendances Node.js**
   ```powershell
   npm install
   ```

2. **Démarrer le serveur API**
   ```powershell
   npm start
   ```
   
   Ou en mode développement avec rechargement automatique :
   ```powershell
   npm run dev
   ```

3. **Accéder à l'application**
   - Boutique principale : `http://localhost:3000/index.html`
   - Page d'accueil : `http://localhost:3000/start.html`
   - **Panneau admin : `http://localhost:3000/admin-login.html`**

## 🔐 Connexion Administrateur

**URL :** `admin-login.html`

**Code de sécurité :** `L1_TRIANGLE`

**Nom d'utilisateur :** Libre (pour identification dans les logs)

## 📦 Fonctionnalités Admin

### 1. Tableau de bord
- Vue d'ensemble des statistiques
- Nombre de produits, commandes et modifications
- Dernières commandes affichées

### 2. Gestion des produits
- ➕ **Ajouter** de nouveaux produits
- ✏️ **Modifier** les produits existants
- 🗑️ **Supprimer** des produits
- Champs disponibles :
  - Nom du produit
  - Catégorie (Manettes, Moniteurs, Accessoires, AirPods, Câbles, Vape)
  - Prix (HTG)
  - Stock
  - Description
  - URL de l'image

### 3. Gestion des commandes
- 📋 Visualiser toutes les commandes
- Informations clients (nom, téléphone)
- Détails des produits commandés
- Montant total
- 🗑️ Supprimer des commandes

### 4. Historique des modifications
- 📝 Toutes les actions admin enregistrées
- Date et heure de chaque modification
- Type d'action (ajout, modification, suppression)
- Détails de l'opération
- Nom de l'administrateur
- 🗑️ Effacer l'historique

## 🔌 API REST

Le serveur API fonctionne sur `http://localhost:3000/api`

### Endpoints disponibles :

#### Produits
- `GET /api/products` - Liste tous les produits
- `GET /api/products/:id` - Produit par ID
- `POST /api/products` - Créer un produit
- `PUT /api/products/:id` - Modifier un produit
- `DELETE /api/products/:id` - Supprimer un produit

#### Commandes
- `GET /api/orders` - Liste toutes les commandes
- `GET /api/orders/:id` - Commande par ID
- `POST /api/orders` - Créer une commande
- `DELETE /api/orders/:id` - Supprimer une commande

#### Logs
- `GET /api/logs` - Liste tous les logs
- `DELETE /api/logs` - Effacer tous les logs

#### Statistiques
- `GET /api/stats` - Statistiques globales

## 💾 Base de données

La base de données est stockée dans `database.json` avec la structure suivante :

```json
{
  "products": [],
  "orders": [],
  "logs": []
}
```

Toutes les modifications sont automatiquement sauvegardées et visibles par tous les utilisateurs du site en temps réel.

## 📁 Structure des fichiers

```
├── admin-login.html        # Page de connexion admin
├── admin-dashboard.html    # Tableau de bord admin
├── admin-style.css         # Styles pour l'interface admin
├── admin-auth.js           # Authentification admin
├── admin-dashboard.js      # Logique du dashboard
├── api-server.js           # Serveur API backend
├── database.json           # Base de données JSON
├── package.json            # Dépendances Node.js
├── index.html              # Page des produits
├── start.html              # Page d'accueil
├── panier-api.js           # Gestion panier avec API
├── style.css               # Styles du site
└── README.md               # Ce fichier
```

## 🔄 Intégration avec le site web

Pour utiliser l'API dans vos pages HTML, remplacez :

```html
<!-- Ancien -->
<script src="panier.js"></script>

<!-- Nouveau -->
<script src="panier-api.js"></script>
```

Le fichier `panier-api.js` :
- Charge automatiquement les produits depuis l'API
- Enregistre chaque commande dans la base de données
- Fonctionne en mode hors ligne si le serveur n'est pas disponible

## 🛠️ Commandes utiles

```powershell
# Installer les dépendances
npm install

# Démarrer le serveur
npm start

# Mode développement (avec rechargement auto)
npm run dev

# Arrêter le serveur
Ctrl + C
```

## 🌐 Accès depuis d'autres appareils

Pour accéder depuis d'autres appareils sur le même réseau :

1. Trouvez votre adresse IP locale :
   ```powershell
   ipconfig
   ```

2. Utilisez cette adresse :
   ```
   http://VOTRE_IP:3000/admin-login.html
   ```

## 🔒 Sécurité

- Le code d'accès admin est stocké côté client (pour un site statique)
- Pour une production réelle, implémenter une authentification backend
- La base de données JSON est simple mais non sécurisée pour de grosses charges
- Considérer MongoDB, PostgreSQL ou Firebase pour un site en production

## 📱 Contact

- **WhatsApp / Téléphone :** +509 39 94 59 94
- **Email :** l1triangle.info@gmail.com

## ✨ Fonctionnalités futures possibles

- [ ] Authentification multi-utilisateurs
- [ ] Gestion des stocks avec alertes
- [ ] Rapports et statistiques avancées
- [ ] Upload d'images direct
- [ ] Notifications en temps réel
- [ ] Export des données (CSV, PDF)
- [ ] Gestion des catégories dynamiques
- [ ] Système de réduction/promotion

---

**Développé pour L1triangle_store** 🔺
© 2025 - Tous droits réservés
