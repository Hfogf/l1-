# 🔓 Guide Connexion Multi-Appareils - L1Triangle

## ⚠️ Problème: "Impossible de se connecter au serveur"

### 🔴 Cause: Firewall Windows bloque le port 3000

---

## ✅ Solution: Ouvrir le port 3000

### Option 1: Via PowerShell (RECOMMANDÉ)

1. **Ouvrez PowerShell en tant qu'ADMINISTRATEUR**
   - Cherchez "PowerShell" 
   - Clic droit → "Exécuter en tant qu'administrateur"
   - Cliquez "Oui"

2. **Collez cette commande**:
```powershell
New-NetFirewallRule -DisplayName "L1Triangle API Port 3000" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow
```

3. **Appuyez sur Entrée**

4. **Vous devriez voir**:
```
Name                  : {UUID}
DisplayName           : L1Triangle API Port 3000
Description           : 
Group                 : 
Enabled               : True
```

✅ **Le port est maintenant ouvert!**

---

### Option 2: Via Windows Defender Firewall (GUI)

1. Ouvrez **Windows Defender Firewall**
2. Cliquez sur **"Autoriser une application via le pare-feu"**
3. Cliquez sur **"Modifier les paramètres"** (admin)
4. Cliquez sur **"Autoriser une autre application"**
5. Tapez dans le champ: `3000` ou cherchez `node.exe`
6. Cliquez **Ajouter** puis **OK**

---

## 📱 Accéder depuis un autre appareil

### Une fois le firewall configuré:

#### 🖥️ **Depuis PC/Smartphone sur même WiFi**:
```
http://172.29.192.1:3000/index.html
```

#### 🛒 **Boutique**: 
```
http://172.29.192.1:3000/index.html
```

#### 📊 **Admin Dashboard**:
```
http://172.29.192.1:3000/admin-login.html
Code: L1_TRIANGLE
```

---

## 🧪 Tester la Connexion

### Sur le même PC:
```
http://localhost:3000/index.html  ✅ Doit fonctionner
```

### Sur un autre appareil:
1. Connectez-vous au **même réseau WiFi**
2. Ouvrez votre navigateur
3. Accédez à: `http://172.29.192.1:3000/index.html`
4. Vous devriez voir les produits ✅

---

## 🔄 Synchronisation Multi-Appareils

### Comment ça fonctionne:

```
PC 1 (Admin) : Ajoute un produit
    ↓
POST http://172.29.192.1:3000/api/products
    ↓
Serveur sauvegarde en database.json
    ↓
PC 2 (Boutique) : Rafraîchit la page
    ↓
GET http://172.29.192.1:3000/api/products
    ↓
Affiche le nouveau produit ✅
```

### ✅ Si c'est lent:
- Attendez 2-3 secondes après modification
- Appuyez sur **F5** pour rafraîchir
- Vérifiez la console (F12) pour les erreurs

---

## 🛠️ Vérifier le Firewall

### Vérifier que la règle est active:
```powershell
Get-NetFirewallRule -DisplayName "L1Triangle API Port 3000" | Select-Object Name, Enabled, Direction
```

### Désactiver la règle (temporaire):
```powershell
Disable-NetFirewallRule -DisplayName "L1Triangle API Port 3000"
```

### Réactiver:
```powershell
Enable-NetFirewallRule -DisplayName "L1Triangle API Port 3000"
```

### Supprimer la règle:
```powershell
Remove-NetFirewallRule -DisplayName "L1Triangle API Port 3000"
```

---

## ❌ Troubleshooting

### "Connection refused" depuis autre appareil
- ❌ Firewall toujours actif
- ✅ Solution: Exécutez la commande PowerShell ci-dessus en admin

### "Impossible d'accéder à 172.29.192.1"
- ❌ L'appareil n'est pas sur le même WiFi
- ✅ Solution: Connectez-vous au même réseau WiFi que le PC serveur

### Voir les modifications après 10 secondes
- ❌ Réseau lent
- ✅ Solution: Attendez 2-3 sec, puis appuyez F5

### Les modifications n'apparaissent pas
- ❌ Cache du navigateur
- ✅ Solution: Appuyez **Ctrl+Shift+Delete** → Effacer l'historique → Rafraîchir

---

## 📊 Architecture

```
┌─────────────────────────────────────────┐
│         Windows PC (Serveur)            │
│  • Node.js API sur 0.0.0.0:3000         │
│  • database.json (BD)                   │
│  • Firewall: PORT 3000 OUVERT ✅        │
└─────────────────────────────────────────┘
                    ↑↓
        WiFi (même réseau)
                    ↑↓
┌─────────────────────────────────────────┐
│    Autre PC / Téléphone / Tablette      │
│  • Chrome/Safari/Firefox                │
│  • Accès: 172.29.192.1:3000             │
│  • Données synchronisées ✅              │
└─────────────────────────────────────────┘
```

---

## ✨ Checklist Finale

- [ ] PowerShell ouvert en **ADMINISTRATEUR**
- [ ] Commande firewall exécutée avec succès
- [ ] Autre appareil sur **même WiFi**
- [ ] Accès à `http://172.29.192.1:3000` ✅
- [ ] Produits affichent correctement
- [ ] Modification d'un produit → visible partout après F5

**Une fois tout ça fait, votre système fonctionne à 100% en synchronisation! 🎉**

---

**Date**: 06 Décembre 2025  
**Version**: 1.0
