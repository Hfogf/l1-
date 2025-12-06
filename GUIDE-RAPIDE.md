# 🚀 GUIDE DE DÉMARRAGE RAPIDE

## ⚡ Démarrage en 3 étapes

### 1️⃣ Double-cliquez sur `DEMARRER.bat`
   - Le fichier installera automatiquement tout ce qui est nécessaire
   - Le serveur démarrera sur http://localhost:3000

### 2️⃣ Ouvrez votre navigateur et accédez à :
   ```
   http://localhost:3000/admin-login.html
   ```

### 3️⃣ Connectez-vous avec :
   - **Code de sécurité :** `L1_TRIANGLE`
   - **Nom d'utilisateur :** Votre choix (ex: Admin)

---

## 📋 Ce que vous pouvez faire

### Dans le panneau admin :

✅ **Ajouter des produits**
   - Nom, catégorie, prix, stock, description, image

✅ **Modifier des produits existants**
   - Changer prix, stock, description, etc.

✅ **Supprimer des produits**
   - Retirer des produits du catalogue

✅ **Voir toutes les commandes**
   - Nom du client, téléphone, produits commandés

✅ **Consulter l'historique**
   - Toutes les modifications faites sur le site

---

## 🌐 URLs importantes

| Page | URL | Description |
|------|-----|-------------|
| **Admin** | `http://localhost:3000/admin-login.html` | Panneau d'administration |
| **Boutique** | `http://localhost:3000/index.html` | Page des produits |
| **Accueil** | `http://localhost:3000/start.html` | Page d'accueil |

---

## 🔧 Commandes utiles

Si vous voulez utiliser le terminal PowerShell :

```powershell
# Installer les dépendances
npm install

# Démarrer le serveur
npm start

# Arrêter le serveur
Ctrl + C
```

---

## ❓ Problèmes fréquents

### ❌ "npm n'est pas reconnu"
**Solution :** Installez Node.js depuis https://nodejs.org

### ❌ "Port 3000 déjà utilisé"
**Solution :** 
1. Trouvez le processus : `netstat -ano | findstr :3000`
2. Arrêtez-le : `taskkill /PID <numéro> /F`

### ❌ "Cannot GET /"
**Solution :** Ajoutez `/start.html` ou `/index.html` à l'URL

---

## 💡 Conseils

- **Toujours démarrer le serveur** avant d'accéder au site
- **Les modifications admin** sont visibles immédiatement sur le site
- **Les commandes clients** sont automatiquement enregistrées
- **Sauvegardez database.json** régulièrement pour ne pas perdre vos données

---

## 📞 Support

Besoin d'aide ? Contactez :
- **WhatsApp :** +509 39 94 59 94
- **Email :** l1triangle.info@gmail.com

---

**Bon travail ! 🎉**
